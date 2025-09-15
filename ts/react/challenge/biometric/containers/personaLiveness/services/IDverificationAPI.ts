import { httpService } from 'core-utilities';
import {
  startPersonaIdVerificationUrlConfig,
  getPersonaVerificationStatusUrlConfig
} from '../constants/urlConstants';
import { VerificationErrorCode, PersonaTemplate } from '../enums';

export const startPersonaIdVerification = () => {
  const urlConfig = startPersonaIdVerificationUrlConfig();
  const params = { generateLink: true, template: PersonaTemplate.LivenessCheck };
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
