import { httpService } from 'core-utilities';
import { Result } from '../../result';
import { toResult } from '../common';
import {
  USER_SETTINGS_URL_CONFIG,
  UserSettingsApiError,
  UserSettingsReturnType
} from '../types/userSettings';

// eslint-disable-next-line import/prefer-default-export
export const userSettings = (): Promise<
  Result<UserSettingsReturnType, UserSettingsApiError | null>
> => toResult(httpService.get(USER_SETTINGS_URL_CONFIG), UserSettingsApiError);
