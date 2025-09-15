import { httpService } from 'core-utilities';
import { toResult } from '../common';
import {
  LegacyAccountInfoError,
  LegacyAccountInfoResponse,
  LegacyAccountInfoUrlConfig
} from '../types/legacyAccountInfo';
import { Result } from '../../result';

// eslint-disable-next-line import/prefer-default-export
export const getAccountInfo = (): Promise<
  Result<LegacyAccountInfoResponse, LegacyAccountInfoError | null>
> => toResult(httpService.get(LegacyAccountInfoUrlConfig), LegacyAccountInfoError);
