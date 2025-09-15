import EventTimer from '../../../../common/eventTimer';
import { RequestServiceDefault } from '../../../../common/request';
import { MetricName } from '../../../../common/request/types/metrics';
import { FEATURE_NAME, METRICS_CONSTANTS } from '../app.config';

/**
 * Default implementation of the metrics service for biometric challenges.
 */
export class MetricsServiceDefault {
  private biometricType: string;

  private appType: string;

  private challengeSolveTimeSequenceName: string;

  private eventTimer: EventTimer;

  private requestServiceDefault: RequestServiceDefault;

  constructor(
    biometricType: string,
    appType: string,
    requestServiceDefault: RequestServiceDefault
  ) {
    this.biometricType = biometricType;
    this.appType = appType;
    this.requestServiceDefault = requestServiceDefault;
    this.eventTimer = new EventTimer();
    this.challengeSolveTimeSequenceName = `${FEATURE_NAME}_${METRICS_CONSTANTS.sequence.challengeSolveTime}`;
  }

  fireChallengeInitializedEvent(): void {
    this.fireEvent(METRICS_CONSTANTS.event.challengeInitialized);
    this.eventTimer.start(this.challengeSolveTimeSequenceName);
  }

  fireChallengeCompletedEvent(): void {
    this.fireEvent(METRICS_CONSTANTS.event.challengeCompleted);
    this.fireSolveTimeEvent(METRICS_CONSTANTS.event.challengeCompleted);
  }

  fireChallengeInvalidatedEvent(): void {
    this.fireEvent(METRICS_CONSTANTS.event.challengeInvalidated);
    this.fireSolveTimeEvent(METRICS_CONSTANTS.event.challengeInvalidated);
  }

  fireChallengeAbandonedEvent(): void {
    this.fireEvent(METRICS_CONSTANTS.event.challengeAbandoned);
    this.fireSolveTimeEvent(METRICS_CONSTANTS.event.challengeAbandoned);
  }

  fireEvent(metricName: string): void {
    this.requestServiceDefault.metrics
      .recordMetric({
        name: MetricName.EventPersonaLiveness,
        value: 1,
        labelValues: {
          event_type: `${FEATURE_NAME}_${metricName}`
        }
      })
      // Swallow errors if metrics failed to send; this should not be fatal.
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .catch(() => {});
  }

  fireSolveTimeEvent(metricName: string): void {
    const eventTime = this.eventTimer.end(this.challengeSolveTimeSequenceName);
    if (eventTime !== null) {
      this.requestServiceDefault.metrics
        .recordMetric({
          name: MetricName.SolveTimePersonaLiveness,
          value: eventTime,
          labelValues: {
            event_type: `${FEATURE_NAME}_${metricName}`
          }
        })
        // Swallow errors if metrics failed to send; this should not be fatal.
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        .catch(() => {});
    }
  }
}

/**
 * An interface encapsulating the metrics fired by this web app.
 *
 * This interface type offers future flexibility e.g. for mocking the default
 * metrics service.
 */
export type MetricsService = {
  [K in keyof MetricsServiceDefault]: MetricsServiceDefault[K];
};
