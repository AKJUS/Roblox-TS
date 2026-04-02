import { EnvironmentUrls, Guac } from 'Roblox';
import chatModule from '../chatModule';

function guacService($q, httpService, $log) {
  'ngInject';

  return {
    getChatUiPolicies() {
      return Guac.callBehaviour('chat-ui');
    },
    getAppPolicies() {
      return Guac.callBehaviour('app-policy');
    },
    getAbuseReportRevampPolicies() {
      return Guac.callBehaviour('abuse-reporting-revamp');
    },
    getRenameFriendsPolicies() {
      return Guac.callBehaviour('web-rename-friends')
        .then(data => ({ renameFriendsToConnections: !(data?.connectionsToFriendsRenameEnabled ?? false) }))
        .catch(() => ({ renameFriendsToConnections: true }));
    }
  };
}

chatModule.factory('guacService', guacService);

export default guacService;
