import environmentUrls from "@rbx/environment-urls";

const developLinkMdContainerId = "header-develop-md-link";
const developLinkSmContainerId = "header-develop-sm-link";

const initializeDevelopLink = () => {
  const developLinkMd = document.getElementById(developLinkMdContainerId);
  const developLinkSm = document.getElementById(developLinkSmContainerId);
  if (developLinkMd !== null) {
    developLinkMd.href = `https://create.${environmentUrls.domain}/`;
  }

  if (developLinkSm !== null) {
    developLinkSm.href = `https://create.${environmentUrls.domain}/`;
  }
};

export default { initializeDevelopLink };
