import chatModule from '../chatModule';

function groupInviteDialog(resources) {
  'ngInject';

  return {
    restrict: 'A',
    scope: true,
    controller: 'groupInviteDialogController',
    templateUrl: resources.templates.groupInviteDialogTemplate
  };
}

chatModule.directive('groupInviteDialog', groupInviteDialog);

export default groupInviteDialog;
