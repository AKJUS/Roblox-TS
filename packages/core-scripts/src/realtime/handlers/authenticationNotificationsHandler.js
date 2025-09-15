import $ from "jquery";
import environmentUrls from "@rbx/environment-urls";
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
});
