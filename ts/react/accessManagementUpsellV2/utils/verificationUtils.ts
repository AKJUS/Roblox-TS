import { Intl } from 'Roblox';

export default function openVerificationLink(verificationLink?: string | null): void {
  if (!verificationLink) return;
  // Get user locale and append language parameter if available
  const userLocale = new Intl().getLocale();
  let linkWithLanguage = verificationLink;

  if (userLocale) {
    linkWithLanguage = `${verificationLink}&language=${userLocale}`;
  }
  window.location.href = linkWithLanguage;
}
