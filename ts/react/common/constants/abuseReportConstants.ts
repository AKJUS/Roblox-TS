/**
 * Retrieves the GUAC configuration for the new abuse reporting revamp flow and the new report abuse URL.
 * Multiple copies of this file exists in the codebase, give that there currently is not a way to share code across WebApps.
 * If updating this file, please report all the copies in the codebase.
 */
import { Guac } from 'Roblox';

type GuacResponse = {
  EnableExperience?: boolean;
};

type GuacConfig = {
  EnableExperience: boolean;
};

/**
 * Retrieves the abuse report URL with the specified parameters.
 *
 * @param param0 - An object containing the following properties:
 *   - `targetId`: The Id of the target being reported (could be player, asset, postId, etc.).
 *   - `submitterId`: The Id of the user submitting the report.
 *   - `abuseVector`: The surface where the abuse is occurring (user_profile, group, avatar, etc.).
 * @returns The constructed abuse report URL as a string.
 */
export function getAbuseReportRevampUrl({
  targetId,
  submitterId,
  abuseVector,
  universeId
}: {
  targetId: string;
  submitterId: string;
  abuseVector: string;
  universeId: string;
}): string {
  const params = new URLSearchParams({
    targetId,
    submitterId,
    abuseVector,
    custom: JSON.stringify({
      stringId: universeId
    })
  });
  return `/report-abuse/?${params.toString()}`;
}

/**
 * Loads the GUAC (Great Universal App Configurator) configuration for abuse reporting, which functions as flags.
 * This function does not throw errors and returns a false configuration if the request fails.
 *
 * @returns A promise that resolves to a `GuacConfig` object containing:
 *   - `EnableExperience`: A boolean indicating whether the item abuse reporting feature is enabled.
 */
export async function loadGuacConfigNonThrowing(): Promise<GuacConfig> {
  try {
    const data = await Guac.callBehaviour<GuacResponse>('abuse-reporting-revamp');

    if (!data) {
      return {
        EnableExperience: false
      };
    }

    return {
      EnableExperience: Boolean(data.EnableExperience)
    };
  } catch (e) {
    return {
      EnableExperience: false
    };
  }
}
