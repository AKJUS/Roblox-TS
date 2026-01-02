import { EnvironmentUrls } from 'Roblox';

const { apiGatewayUrl } = EnvironmentUrls;

// URL configs for ID verification
const startPersonaLivenessVerificationUrlConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${apiGatewayUrl}/age-verification-service/v1/persona-id-verification/start-liveness-verification`
});

const getPersonaVerificationStatusUrlConfig = () => ({
  retryable: true,
  withCredentials: true,
  url: `${apiGatewayUrl}/age-verification-service/v1/persona-id-verification/verified-status`
});

export { startPersonaLivenessVerificationUrlConfig, getPersonaVerificationStatusUrlConfig };
