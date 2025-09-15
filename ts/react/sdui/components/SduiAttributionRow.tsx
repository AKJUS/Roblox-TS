import { AttributionRow, TTypographyToken } from '@rbx/discovery-sdui-components';
import React from 'react';
import { TSduiCommonProps } from '../system/SduiTypes';

type SduiAttributionRowProps = TSduiCommonProps & {
  title: string;
  titleFontStyle?: TTypographyToken;
  subtitle?: string;
  subtitleFontStyle?: TTypographyToken;
  titleSubtitleGap?: number;
  subtitleMaxLines?: number;
  height?: number;
  rightButtonContent?: React.ReactNode;
  image?: React.ReactNode;
};

const SduiAttributionRow = ({
  sduiContext,
  title,
  titleFontStyle,
  subtitle,
  subtitleFontStyle,
  titleSubtitleGap,
  subtitleMaxLines,
  height,
  rightButtonContent,
  image
}: SduiAttributionRowProps): JSX.Element => {
  const { tokens } = sduiContext.dependencies;
  return (
    <AttributionRow
      title={title}
      subtitle={subtitle}
      textColor={tokens.Color.Content.Emphasis}
      titleFontStyle={titleFontStyle ?? tokens.Typography.TitleMedium}
      subtitleFontStyle={subtitleFontStyle ?? tokens.Typography.BodyMedium}
      titleSubtitleGap={titleSubtitleGap}
      subtitleMaxLines={subtitleMaxLines}
      rightButtonContent={rightButtonContent}
      imageComponent={image}
      height={height}
    />
  );
};

export default SduiAttributionRow;
