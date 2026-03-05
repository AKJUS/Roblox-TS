import $ from "jquery";
import environmentUrls from "@rbx/environment-urls";
import { pubSub } from "@rbx/core-scripts/util/cross-tab-communication";
import * as endpoints from "../../endpoints";
import { getClient } from "../lib/client";

$(() => {
  getClient().Subscribe("AuthenticationNotifications", data => {
    if (data.Type === "SignOut") {
      let url = `${environmentUrls.usersApi}/v1/users/authenticated`;
      if (endpoints) {
        url = endpoints.generateAbsoluteUrl(url, null, true);
      }
      $.ajax({
        url,
        method: "GET",
        error: response => {
          if (response.status === 401) {
            window.location.reload();
          }
        },
      });
    }
  });

  // Listen for cross-tab account switch notifications
  // When another tab switches accounts, this tab should reload to reflect the new user
  if (pubSub.isAvailable()) {
    pubSub.subscribe(
      "RBXASAccountSwitched",
      "Roblox.Authentication.AccountSwitchHandler",
      newValue => {
        // Only reload when value is being cleared by another tab completing teh switch
        if (!newValue) {
          window.location.reload();
        }
      },
    );
  }
});
