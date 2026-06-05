import './src/main.css';
import './src/sendrNotificationStream.scss';

import {
  renderSendrNotification,
  renderSendrModalContainer
} from '@rbx/notifications/sendrNotificationStream/utils/notificationReactMountUtility';

Object.assign(Roblox, {
  NotificationStreamService: {
    renderSendrNotification,
    renderSendrModalContainer
  }
});
