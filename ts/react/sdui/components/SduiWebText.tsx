import React from 'react';
import { WebText, TTypographyToken } from '@rbx/discovery-sdui-components';
import { TSduiCommonProps } from '../system/SduiTypes';

type TSduiWebTextProps = TSduiCommonProps & {
  text: string;
  textFontStyle?: TTypographyToken;
  textColor?: string;
};

/**
 * SduiWebText component displays a block of text. This is different from SduiText as it supports raw HTML
 * inside the text prop. The allowed HTML tags are: em, i, strong, b, u, a, br, and the allowed attributes
 * are href, target, and rel.
 */
const SduiWebText = ({
  text,
  textFontStyle,
  textColor,
  sduiContext
}: TSduiWebTextProps): JSX.Element => {
  const { tokens } = sduiContext.dependencies;

  return (
    <WebText
      text={text}
      textFontStyle={textFontStyle ?? tokens.Typography.BodyMedium}
      textColor={textColor ?? tokens.Color.Content.Default}
    />
  );
};

export default SduiWebText;
