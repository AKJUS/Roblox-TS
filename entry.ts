import { addExternal, addLegacyExternal } from "@rbx/externals";
import * as tracing from "@rbx/core-scripts/tracing";

addExternal(["Roblox", "core-scripts", "tracing"], tracing);

addLegacyExternal("RobloxTracer", {
  isTracerEnabled: tracing.isTracerEnabled,
  instrumentation: tracing.instrumentation,
  logs: tracing.logs,
  tags: tracing.tags,
  inject: tracing.inject,
  extract: tracing.extract,
  apiSiteRequestValidator: tracing.apiSiteRequestValidator,
  tracerConstants: tracing.tracerConstants,
});

tracing.bootstrapTracer.rootTracer();
