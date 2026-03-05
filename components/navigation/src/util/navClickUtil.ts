import { EventStream } from "@rbx/core-scripts/legacy/Roblox";

const NAV_ITEMS: { ids: string[]; navItem: string }[] = [
  { ids: ["nav-logo-link"], navItem: "logo" },
  { ids: ["nav-charts-md-link", "nav-charts-sm-link"], navItem: "charts" },
  { ids: ["nav-marketplace-md-link", "nav-marketplace-sm-link"], navItem: "marketplace" },
  { ids: ["header-develop-md-link", "header-develop-sm-link"], navItem: "create" },
];

const initNavClickEvents = () => {
  NAV_ITEMS.forEach(({ ids, navItem }) => {
    ids.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener("click", () => {
          if (EventStream) {
            EventStream.SendEventWithTarget(
              "navBarClick",
              "click",
              { nav_item: navItem },
              EventStream.TargetTypes.WWW,
            );
          }
        });
      }
    });
  });
};

export default { initNavClickEvents };
