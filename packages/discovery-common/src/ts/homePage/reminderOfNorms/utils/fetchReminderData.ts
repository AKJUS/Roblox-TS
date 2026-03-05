import environmentUrls from "@rbx/environment-urls";
import * as http from "@rbx/core-scripts/http";
import { AxiosResponse } from "@rbx/core-scripts/http";
import { ReminderDataType } from "./types";

const reminderUrl = `${environmentUrls.userModerationApi}/v1/reminder`;

const fetchReminderData = async (): Promise<AxiosResponse<ReminderDataType | null>> => {
  const urlConfig: { url: string; withCredentials: boolean } = {
    url: reminderUrl,
    withCredentials: true,
  };
  return http.get(urlConfig);
};

export default fetchReminderData;
