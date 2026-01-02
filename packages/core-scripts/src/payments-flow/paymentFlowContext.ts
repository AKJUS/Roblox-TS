import environmentUrls from "@rbx/environment-urls";
import { isValueOf } from "@rbx/core-types";
import { COOKIE_NAME, COOKIE_TIMESPAN, TRIGGERING_CONTEXT } from "./constants";
import { getCookie } from "../cookie";

export default class PaymentFlowContext {
  public purchaseFlowUuid?: string;

  public triggeringContext?: TRIGGERING_CONTEXT;

  constructor(purchaseFlowUuid?: string, triggeringContext?: TRIGGERING_CONTEXT) {
    this.purchaseFlowUuid = purchaseFlowUuid;
    this.triggeringContext = triggeringContext;
  }

  public save(): void {
    const flowCtx = `${this.purchaseFlowUuid ?? ""},${this.triggeringContext ?? ""}`;
    document.cookie = `${COOKIE_NAME}=${flowCtx}; domain=.${environmentUrls.domain}; path=/; max-age=${COOKIE_TIMESPAN}`;
  }

  public static stop(): void {
    document.cookie = `${COOKIE_NAME}=; domain=.${environmentUrls.domain}; path=/; max-age=0`;
  }

  public static loadFromCookie(): PaymentFlowContext | null {
    // get the cookie value
    const cookie = getCookie(COOKIE_NAME);
    if (!cookie) {
      return null;
    }
    // split the value into uuid and context
    const [uuid, context] = cookie.split(",");
    const purchaseFlowUuid = uuid ?? undefined;
    const triggerContext =
      context != null && isValueOf(TRIGGERING_CONTEXT, context) ? context : undefined;
    return new PaymentFlowContext(purchaseFlowUuid, triggerContext);
  }
}
