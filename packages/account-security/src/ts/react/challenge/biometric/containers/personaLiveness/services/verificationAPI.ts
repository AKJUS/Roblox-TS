import { httpService } from 'core-utilities';
import {
  startPersonaLivenessVerificationUrlConfig,
  getPersonaVerificationStatusUrlConfig
} from '../constants/urlConstants';
import { VerificationErrorCode } from '../enums';

export const startPersonaLivenessVerification = () => {
  const urlConfig = startPersonaLivenessVerificationUrlConfig();
  const params = { generateLink: true };
  return httpService
    .post(urlConfig, params)
    .then(({ data }) => {
      return data;
    })
    .catch(err => {
      const errorCode = httpService.parseErrorCode(err) as VerificationErrorCode;
      console.error(`Error to start ID verification: ${errorCode || 'unknown'}`, err);
    });
};

export const getPersonaVerificationStatus = (token: string) => {
  const urlConfig = getPersonaVerificationStatusUrlConfig();
  const params = { token };
  return httpService
    .get(urlConfig, params)
    .then(({ data }) => {
      return data;
    })
    .catch(err => {
      const errorCode = httpService.parseErrorCode(err) as VerificationErrorCode;
      console.error(`Error to get ID verification status: ${errorCode || 'unknown'}`, err);
    });
};
