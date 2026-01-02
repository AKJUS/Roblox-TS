import React from 'react';
import { Text, TTypographyToken } from '@rbx/discovery-sdui-components';
import { TSduiCommonProps } from '../system/SduiTypes';

type TSduiTextProps = TSduiCommonProps & {
  text: string;
  textFontStyle?: TTypographyToken;
  textColor?: string;
  textLink?: string;
  openLinkInNewTab?: boolean;
};

const SduiText = ({
  text,
  textFontStyle,
  textColor,
  textLink,
  openLinkInNewTab,
  sduiContext
}: TSduiTextProps): JSX.Element => {
  const { tokens } = sduiContext.dependencies;

  return (
    <Text
      text={text}
      textFontStyle={textFontStyle ?? tokens.Typography.BodyMedium}
      textColor={textColor ?? tokens.Color.Content.Default}
      textLink={textLink}
      openLinkInNewTab={openLinkInNewTab ?? false}
    />
  );
};

export default SduiText;
