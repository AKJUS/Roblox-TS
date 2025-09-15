import { httpService } from 'core-utilities';
import { Result } from '../../result';
import { toResult } from '../common';
import * as Phone from '../types/phone';

// eslint-disable-next-line import/prefer-default-export
export const getPhoneConfiguration = async (): Promise<
  Result<Phone.GetPhoneConfigurationReturnType, Phone.PhoneError | null>
> => toResult(httpService.get(Phone.GET_PHONE_CONFIG, {}), Phone.PhoneError);

export const prioritizeDefaultPrefix = (
  getPhonePrefixListResult: Phone.GetPhonePrefixesListReturnType
): Phone.GetPhonePrefixesListReturnType => {
  // prefix list may contain indicator of default prefix
  const defaultPrefixByLocation = getPhonePrefixListResult.find(element => {
    return element.isDefault;
  });

  let processedResult = getPhonePrefixListResult;
  if (defaultPrefixByLocation !== undefined) {
    // Find default option and put that at the top of the list
    processedResult = getPhonePrefixListResult.filter(p => {
      return p.code !== defaultPrefixByLocation.code;
    });

    processedResult.unshift(defaultPrefixByLocation);
  }
  return processedResult;
};

export const getPhonePrefixList = async (): Promise<
  Result<Phone.GetPhonePrefixesListReturnType, Phone.PhoneError | null>
> => {
  return toResult(
    httpService.get(Phone.GET_PHONE_PREFIXES_LIST_CONFIG, {}),
    Phone.PhoneError,
    prioritizeDefaultPrefix
  );
};
