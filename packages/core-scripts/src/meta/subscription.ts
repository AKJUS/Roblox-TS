const subscriptionDataset = (): DOMStringMap | null => {
  const metaTag = document.querySelector<HTMLMetaElement>('meta[name="subscription-data"]');
  return metaTag?.dataset ?? null;
};

export const isEnabled = (): boolean => subscriptionDataset()?.isEnabled === "true";
