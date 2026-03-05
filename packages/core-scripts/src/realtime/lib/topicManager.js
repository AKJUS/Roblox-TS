/**
 * TopicManager - Manages topic-based notifications (source-agnostic)
 *
 * Responsibilities:
 * - Subscribe/unsubscribe to topic notifications
 * - Maintain callback registry (topicId → Set<callback>)
 * - Delegate subscription and notification handling to source
 *
 * Does NOT know about:
 * - SignalR, pubSub, or kingmaker
 * - Leader/follower roles
 * - Cross-tab coordination (handled by sources)
 */

/**
 * Creates a TopicManager instance
 * @param {object} dependencies - Injected dependencies
 * @param {function} dependencies.log - Logger function(message, isVerbose)
 * @returns {object} TopicManager instance
 */
const createTopicManager = ({ log }) => {
  // ============================================================================
  // STATE
  // ============================================================================

  // Subscriptions: topicId → { token, callbacks: Set<fn> }
  const subscriptions = {};

  // Reference to current source (set via onSourceChanged)
  let currentSource = null;

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Extract topicId from token
   * Token format: "{namespace}!{topic}.body.sig"
   * TopicId format: "{namespace}!{topic}"
   */
  const extractTopicId = token => {
    if (!token || typeof token !== "string") {
      return null;
    }

    // Find first '.' separator - everything before it is the topicId
    const dotIndex = token.indexOf(".");
    if (dotIndex < 0) {
      return null;
    }

    const topicId = token.substring(0, dotIndex);

    // Validate topicId contains '!' delimiter
    if (!topicId.includes("!")) {
      return null;
    }

    return topicId;
  };

  /**
   * Dispatch notification to local callbacks for a topic
   */
  const dispatchToCallbacks = (topicId, detail) => {
    const sub = subscriptions[topicId];
    if (!sub?.callbacks?.size) {
      return;
    }

    log(
      `Topic notifications: Dispatching to ${sub.callbacks.size} callback(s) for ${topicId}`,
      true,
    );

    // Spread to avoid issues if callback unsubscribes during iteration
    for (const callback of [...sub.callbacks]) {
      try {
        callback(detail);
      } catch (e) {
        log(`Topic notifications: Error in callback for ${topicId}: ${e}`);
      }
    }
  };

  /**
   * Re-subscribe all current subscriptions via the source
   * Called when source becomes ready (connect/reconnect)
   */
  const resubscribeAll = () => {
    const subs = Object.values(subscriptions);
    if (subs.length === 0) {
      return;
    }

    log(`Topic notifications: Re-subscribing to ${subs.length} topic(s)`);

    for (const sub of subs) {
      if (sub?.token) {
        currentSource?.SubscribeTopic?.(sub.token, null);
      }
    }
  };

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  /**
   * Subscribe to topic notifications
   * @param {string} token - Topic token (format: "{namespace}!{topic}.body.sig")
   * @param {function} callback - Called when notification received
   * @returns {object} Handle with unsubscribe() method
   */
  const subscribe = (token, callback) => {
    const topicId = extractTopicId(token);
    if (!topicId) {
      log(`Topic notifications: Failed to extract topicId from token`);
      // eslint-disable-next-line no-empty-function
      return { unsubscribe: () => {} };
    }

    log(`Topic notifications: Subscribing to topicId: ${topicId}`);

    // Get or create subscription
    if (!subscriptions[topicId]) {
      subscriptions[topicId] = {
        token,
        callbacks: new Set(),
      };
    }

    const sub = subscriptions[topicId];

    // Save old token before updating (for replaceToken parameter)
    const oldToken = sub.token !== token ? sub.token : null;
    sub.token = token;

    // Add callback to subscription (Set deduplicates same reference)
    sub.callbacks.add(callback);

    // Delegate to source (source handles SignalR/pubSub based on its type)
    currentSource?.SubscribeTopic?.(token, oldToken);

    // Return unsubscribe handle
    return {
      unsubscribe: () => {
        log(`Topic notifications: Unsubscribing callback from topicId: ${topicId}`);
        const subscription = subscriptions[topicId];
        if (subscription) {
          subscription.callbacks.delete(callback);
          // Clean up entry when no callbacks remain to avoid
          // unnecessary SubscribeTopic calls on reconnect/election
          if (subscription.callbacks.size === 0) {
            delete subscriptions[topicId];
          }
        }
        // Note: Phase 1 doesn't call UnsubscribeTopic on server
        // Tokens naturally expire, avoiding server-side state management
      },
    };
  };

  /**
   * Called by client when source changes
   * Registers handlers with the source for notifications and readiness
   * @param {object} newSource - The source instance (implements IRealtimeSource)
   */
  const onSourceChanged = newSource => {
    currentSource = newSource;

    if (!currentSource) {
      return;
    }

    // Register notification handler with source
    // Source will call this when it receives a topic notification
    currentSource.SetTopicNotificationHandler?.((topicId, detail) => {
      log(`Topic notifications: Received notification for topic: ${topicId}`, true);
      dispatchToCallbacks(topicId, detail);
    });

    // Register ready handler with source
    // Source will call this when connection is ready (connect/reconnect/leader elected)
    // Resubscription is deferred to this handler to avoid sending SubscribeTopic
    // before the connection is established (which would fail with "Cannot send data")
    currentSource.SetTopicReadyHandler?.(() => {
      log("Topic notifications: Source ready, re-subscribing all topics");
      resubscribeAll();
    });
  };

  // Return public API
  return {
    subscribe,
    onSourceChanged,
  };
};

export default createTopicManager;
