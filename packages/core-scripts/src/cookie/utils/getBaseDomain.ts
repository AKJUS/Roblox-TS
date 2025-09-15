export const getBaseDomain = (): string => {
  const currentHostname = window.location.hostname;
  return currentHostname.startsWith("www.") ? currentHostname.substring(4) : currentHostname;
};
