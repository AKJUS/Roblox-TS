import { httpService } from 'core-utilities';
import { Result } from '../../result';
import { toResult } from '../common';
import * as Users from '../types/users';

export const getUserById = (
  userId: string,
): Promise<
  Result<
    Users.UserInfo,
    Users.UsersApiError | null
  >
> =>
  toResult(
    httpService.get(
      Users.GET_USER_BY_ID_CONFIG(userId),
    ),
    Users.UsersApiError
  );
