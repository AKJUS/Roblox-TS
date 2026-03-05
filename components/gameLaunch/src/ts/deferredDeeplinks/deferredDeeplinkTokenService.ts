import * as http from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";
import { deferredDeeplinkGroupName } from "./deferredDeeplinkConstants";
import sendDeeplinkTokenCreateAttempt from "./deferredDeeplinkEvents";

const deferredDeeplinkTokenServiceUrl = `${environmentUrls.apiGatewayUrl}/deferred-deep-link/token-api`;
export type TCreateDeeplinkTokenResponse = {
  token?: string | null;
  expirationTime: string;
};

const createDeeplinkToken = async (
  experienceAffiliateReferralUrl: string,
): Promise<string | null> => {
  const createDeeplinkTokenRequestBody = {
    linkId: experienceAffiliateReferralUrl,
    group: deferredDeeplinkGroupName,
  };

  const urlConfig = {
    withCredentials: true,
    url: `${deferredDeeplinkTokenServiceUrl}/create-token`,
  };

  try {
    const res = await http.post<TCreateDeeplinkTokenResponse>(
      urlConfig,
      createDeeplinkTokenRequestBody,
    );
    const token = res.data.token ?? null;
    sendDeeplinkTokenCreateAttempt(token, experienceAffiliateReferralUrl, res.status);
    return token;
  } catch {
    return null;
  }
};

export default createDeeplinkToken;
