import React from 'react';
import { render } from 'react-dom';
import { ready } from 'core-utilities';
import { fireEvent } from 'roblox-event-tracker';
import '../../../css/placesList/realtimePlacelist.scss';
import '../../../../../Roblox.ReminderOfNorms.WebApp/Roblox.ReminderOfNorms.WebApp/css/reminderOfNorms.scss';
import '../../../css/tailwind.css';
import HomePageContainer from './HomePageContainer';

ready(() => {
  const contentDiv = document.getElementById('content');
  if (contentDiv && document.getElementById('places-list-web-app')) {
    // need to render in content div for css to work properly
    render(<HomePageContainer />, contentDiv);
  } else {
    fireEvent('HomePageMissingContainerDiv');
  }
});
