import $ from 'jquery';
import { DeviceMeta } from '@rbx/core-scripts/legacy/Roblox';
import AppHybridClientInterface from './src/js/win10/appHybridClientInterface';
import AuthenticationChecker from './src/js/authenticationChecker';
import GameLauncher from './src/js/gameLauncher';
import GameLaunchLogger from './src/js/gameLaunchLogger';
import GamePlayEvents from './src/js/gamePlayEvents';
import GamePlayEventsHandlers from './src/js/gamePlayEventsHandlers';
import ProtocolHandlerClientInterface from './src/js/react/protocolHandlerClientInterface';
import PlayButton from './src/ts/playButton/playButtonEntry';
import './src/main.scss';
import './src/main.css';

Object.assign(window.Roblox, {
  AuthenticationChecker,
  GameLauncher,
  GameLaunchLogger,
  GamePlayEvents,
  ProtocolHandlerClientInterface,
  PlayButton
});

$(document).ready(() => {
  GamePlayEventsHandlers();
  const device = DeviceMeta();
  if (device.isUWPApp || device.isUniversalApp) {
    AppHybridClientInterface.isJoinAttemptIdEnabled = true;
    window.Roblox.AppHybridClientInterface = AppHybridClientInterface;
    GameLauncher.setGameLaunchInterface(AppHybridClientInterface);
  }
  GameLauncher.setGameLaunchLogger(GameLaunchLogger);
});
