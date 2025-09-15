export const getCookie = (cname: string): string | null => {
  const name = `${cname}=`;
  const value = document.cookie
    .split("; ")
    .find(row => row.startsWith(name))
    ?.split("=")[1];
  return value != null ? decodeURIComponent(value) : null;
};
