import { Guac } from 'Roblox';

type TVpcLaunchStatusBody = {
  isVPCEnabled: boolean;
  isTeenLaunchEnabled: boolean;
};

const universalAppConfigurationService = {
  getVpcLaunchStatus: async (): Promise<TVpcLaunchStatusBody> => {
    return Guac.callBehaviour<TVpcLaunchStatusBody>('vpc-launch-status');
  }
};

export default universalAppConfigurationService;
