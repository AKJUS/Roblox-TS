/* eslint-disable no-restricted-syntax */
import { sendEvent, Event as EventStreamEvent } from "@rbx/core-scripts/event-stream";
import environmentUrls from "@rbx/environment-urls";
import { get } from "../http";

const EVENT_NAME = "GuacMigration";
const EVENT_TYPE = "guac_migration";
const EVENT_CONTEXT = "guac_migration";

const BEHAVIOR_PATTERN = "<behaviour-name>";

enum GuacStatus {
  SUCCESS = "success",
  FAILURE = "failure",
}

const getGuacUrl = (behaviorName: string, params?: URLSearchParams): string => {
  const { apiGatewayUrl } = environmentUrls;
  const rawPath = "/guac-v2/v1/bundles/<behaviour-name>";
  const resolvedPath = rawPath.replace(BEHAVIOR_PATTERN, behaviorName);

  const search = params?.toString() ?? "";
  return `${apiGatewayUrl}${resolvedPath}${search === "" ? "" : `?${search}`}`;
};

type GuacMigrationParams = {
  ctx: string;
  url: string;
  latency: number;
  version: string;
  status: string;
  error: string;
  errordetails: string;
};

const toGuacMigrationEvent = (): EventStreamEvent => ({
  name: EVENT_NAME,
  type: EVENT_TYPE,
  context: EVENT_CONTEXT,
  requiredParams: ["version", "status"],
});

const sendGuacMigrationEvent = (params: GuacMigrationParams) => {
  sendEvent(toGuacMigrationEvent(), params);
};

export const callBehaviour = async <T>(
  behaviorName: string,
  params?: URLSearchParams,
): Promise<T> => {
  const guacUrl = getGuacUrl(behaviorName, params);
  const start = performance.now();

  let status: GuacStatus = GuacStatus.SUCCESS;
  let error = "";
  let errorDetails = "";

  try {
    const response = await get<T>({ url: guacUrl, withCredentials: true });
    return response.data;
  } catch (exception) {
    status = GuacStatus.FAILURE;
    if (exception instanceof Error) {
      error = exception.message;
      errorDetails = exception.stack ?? "";
    } else {
      const statusCode =
        exception && typeof exception === "object" && "status" in exception
          ? String(exception.status)
          : "Unknown";

      error = statusCode;
      errorDetails = JSON.stringify(exception);
    }

    throw exception;
  } finally {
    const latency = Math.round(performance.now() - start);
    sendGuacMigrationEvent({
      ctx: window.location.pathname,
      url: guacUrl,
      latency,
      version: "v2",
      status,
      error,
      errordetails: errorDetails,
    });
  }
};
