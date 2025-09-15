import { JSX, createContext } from "react";
import Intl from "@rbx/core-scripts/intl";
import { TranslationResourceProvider } from "@rbx/core-scripts/intl/translation";
import { TranslationConfig, WithTranslationsProps } from "../../intl";
import { validateTranslationConfig } from "../validateTranslationConfig";

const createTranslationContext = (translationConfig: TranslationConfig) => {
  const validatedConfig = validateTranslationConfig(translationConfig);
  const intl = new Intl();
  const translationProvider = new TranslationResourceProvider(intl);
  const translationResources = validatedConfig.map(namespace =>
    translationProvider.getTranslationResource(namespace),
  );
  const languageResources = translationProvider.mergeTranslationResources(...translationResources);

  const translate = (key: string, parameters?: Record<string, unknown>): string =>
    languageResources.get(key, parameters);

  return { translate, intl };
};

export const TranslationContext = createContext<WithTranslationsProps | undefined>(undefined);

/**
 * Wraps the ReactNode with `WithTranslationProps. Also see
 * ./hooks/useTranslation on how to conveniently access the context provided
 * here.
 */
export function TranslationProvider({
  config,
  children,
}: {
  config: TranslationConfig;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <TranslationContext.Provider value={createTranslationContext(config)}>
      {children}
    </TranslationContext.Provider>
  );
}
