// Since the notification stream is angularjs code, the notification-stream-base-view below is for
// notification stream code to engage with navigation component
/* eslint-disable react/no-unknown-property */
import React from 'react';
import angular from 'angular';
import ClassNames from 'classnames';
import navigationUtil from '../util/navigationUtil';

class NotificationStreamBase extends React.Component {
  componentDidMount() {
    try {
      angular.module('notificationStream');
      angular.bootstrap(this.container, ['notificationStream']);
    } catch (err) {
      console.error(err);
    }
  }

  render() {
    const themeFontClass = navigationUtil.getThemeClass();
    const streamClass = ClassNames('notification-stream-base', themeFontClass);
    return (
      <div
        ref={c => {
          this.container = c;
        }}
        className={streamClass}
        notification-stream-base-view="true"
      />
    );
  }
}

export default NotificationStreamBase;
