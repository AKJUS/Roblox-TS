// Since the notification stream is angularjs code, the notification-stream-indicator below is for
// notification stream code to engage with navigation component
/* eslint-disable react/no-unknown-property */
import React from 'react';
import angular from 'angular';

class NotificationStreamIcon extends React.Component {
  componentDidMount() {
    try {
      angular.module('notificationStreamIcon');
      angular.bootstrap(this.container, ['notificationStreamIcon']);
    } catch (err) {
      console.error(err);
    }
  }

  render() {
    return (
      <span
        ref={c => {
          this.container = c;
        }}
        className="nav-robux-icon rbx-menu-item"
      >
        <span id="notification-stream-icon-container" notification-stream-indicator="true" />
      </span>
    );
  }
}

export default NotificationStreamIcon;
