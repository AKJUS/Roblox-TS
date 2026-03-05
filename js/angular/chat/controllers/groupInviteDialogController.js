import { uuidService } from 'core-utilities';
import chatModule from '../chatModule';

function groupInviteDialogController($scope, $log, chatService, chatUtility, analyticsService) {
  'ngInject';

  $scope.inviteData = {
    inviterName: '',
    members: []
  };

  $scope.getConversation = function () {
    const layoutId = $scope.chatViewModel.groupInviteDialogLayoutId;
    return (layoutId && $scope.chatUserDict?.[layoutId]) || null;
  };

  $scope.getGroupName = function () {
    const conversation = $scope.getConversation();
    return conversation?.conversationTitle?.titleForViewer || conversation?.name || '';
  };

  const fetchParticipantsMetadata = function (conversationId) {
    if (!conversationId) {
      return;
    }

    chatService
      .getConversationsParticipantsMetadata([conversationId])
      .then(response => {
        const participantsMetadata =
          response?.conversation_participants_metadata?.[conversationId]?.participants_metadata;

        if (participantsMetadata && $scope.inviteData.members.length > 0) {
          $scope.inviteData.members = $scope.inviteData.members.map(member => {
            const metadata = participantsMetadata[member.id];
            const isBlocked = metadata?.is_blocked || false;
            const isInviter = metadata?.is_inviter || false;
            const isInvited = metadata?.is_invited || false;

            if (isInviter) {
              $scope.inviteData.inviterName = member.displayName;
            }

            return {
              ...member,
              isBlocked,
              isInviter,
              isInvited
            };
          });
        }
      })
      .catch(err => {
        $log.error('Failed to fetch participants metadata:', err);
      });
  };

  const populateMembers = function () {
    const conversation = $scope.getConversation();

    if (!conversation) {
      $log.debug(
        'No conversation found for groupInviteDialogLayoutId:',
        $scope.chatViewModel.groupInviteDialogLayoutId
      );
      return;
    }

    const members = [];
    if (conversation.participants && conversation.participants.length > 0) {
      conversation.participants.forEach(function (participant) {
        if (participant.id === $scope.chatLibrary?.userId) {
          return;
        }

        members.push({
          id: participant.id,
          displayName:
            participant.combined_name || participant.display_name || participant.name || '',
          username: participant.name || '',
          isBlocked: false,
          isInviter: false,
          isInvited: false
        });
      });
    }
    $scope.inviteData.members = members;

    if (conversation.source === chatUtility.conversationSource.CHANNELS) {
      fetchParticipantsMetadata(conversation.id);
    }
  };

  const generateAnalyticsEventBase = function () {
    return {
      modalSequence: chatUtility.modalSequence.CONVERSATION_LIST_OVERLAY,
      modalVariant: chatUtility.modalVariant.OSA_CONTEXT_CARD,
      impressionId: $scope.impressionId,
      conversationId: $scope.getConversation()?.id
    };
  };

  $scope.$watch('chatViewModel.groupInviteDialogLayoutId', function (layoutId) {
    if (layoutId) {
      populateMembers();
      $scope.impressionId = uuidService.generateRandomUuid();
      analyticsService.sendModalRenderedEvent(generateAnalyticsEventBase());
    }
  });

  $scope.joinGroup = function () {
    const conversation = $scope.getConversation();
    if (!conversation) {
      $log.debug('No conversation found for join action');
      $scope.closeGroupInviteDialog();
      return;
    }

    const analyticsEventBase = {
      ...generateAnalyticsEventBase(),
      action: analyticsService.modalActionType.PRIMARY_CTA
    };

    $log.debug('User clicked Join for group:', $scope.getGroupName());
    analyticsService.sendModalActionEvent(analyticsEventBase);

    chatService
      .recordModalSequenceResponse({
        ...chatUtility.getDynamicConversationId(conversation),
        modalSequence: chatUtility.modalSequence.CONVERSATION_LIST_OVERLAY,
        modalVariant: chatUtility.modalVariant.OSA_CONTEXT_CARD,
        actionType: chatUtility.modalActionType.RECORD_HAS_ACCEPTED
      })
      .then(function (response) {
        if (response.status !== chatUtility.resultType.SUCCESS) {
          $log.debug('Failed to record join response:', response);
          return;
        }

        analyticsService.sendModalActionResultEvent({
          ...analyticsEventBase,
          actionResult: analyticsService.modalActionResultType.SUCCESS
        });

        conversation.osaAcknowledgementStatus = chatUtility.osaAcknowledgementStatus.ACKNOWLEDGED;

        $scope.fetchConversations(conversation.id);
        $scope.launchDialog(conversation.layoutId, true);

        $scope.closeGroupInviteDialog();
      })
      .catch(function (error) {
        $log.debug('Error recording join response:', error);
        analyticsService.sendModalActionResultEvent({
          ...analyticsEventBase,
          actionResult: analyticsService.modalActionResultType.FAILURE
        });
        $scope.closeGroupInviteDialog();
      });
  };

  $scope.declineInvite = function () {
    const conversation = $scope.getConversation();
    if (!conversation) {
      $log.debug('No conversation found for decline action');
      $scope.closeGroupInviteDialog();
      return;
    }

    $log.debug('User declined invite for group:', $scope.getGroupName());
    const analyticsEventBase = {
      ...generateAnalyticsEventBase(),
      action: analyticsService.modalActionType.SECONDARY_CTA
    };
    analyticsService.sendModalActionEvent(analyticsEventBase);

    chatService
      .recordModalSequenceResponse({
        ...chatUtility.getDynamicConversationId(conversation),
        modalSequence: chatUtility.modalSequence.CONVERSATION_LIST_OVERLAY,
        modalVariant: chatUtility.modalVariant.OSA_CONTEXT_CARD,
        actionType: chatUtility.modalActionType.RECORD_DONT_SHOW_AGAIN
      })
      .then(function (response) {
        if (response.status !== chatUtility.resultType.SUCCESS) {
          $log.debug('Failed to record decline response:', response);
          return;
        }

        analyticsService.sendModalActionResultEvent({
          ...analyticsEventBase,
          actionResult: analyticsService.modalActionResultType.SUCCESS
        });

        $scope.removeConversationFromUI(conversation.id);

        $scope.closeGroupInviteDialog();
      })
      .catch(function (error) {
        $log.debug('Error recording decline response:', error);
        analyticsService.sendModalActionResultEvent({
          ...analyticsEventBase,
          actionResult: analyticsService.modalActionResultType.FAILURE
        });
        $scope.closeGroupInviteDialog();
      });
  };

  $scope.dismissDialog = function () {
    analyticsService.sendModalActionEvent({
      ...generateAnalyticsEventBase(),
      action: analyticsService.modalActionType.DISMISS
    });
    $scope.closeGroupInviteDialog();
  };
}

chatModule.controller('groupInviteDialogController', groupInviteDialogController);

export default groupInviteDialogController;
