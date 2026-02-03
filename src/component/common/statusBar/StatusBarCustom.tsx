import React from 'react';
import { StatusBar,  } from 'react-native';
import { Color } from '@theme/color';
 type StatusBarComponentProps = {
  barStyle?: 'default' | 'light-content' | 'dark-content';
  backgroundColor?: string;
  translucent?: boolean;
};

const StatusBarCustom: React.FC<StatusBarComponentProps> = ({
  barStyle = 'light-content',
  backgroundColor,
  translucent = false,
}) => {
  const effectiveBackgroundColor = translucent ? 'transparent' : backgroundColor || Color.background;

  return (
    <>
      <StatusBar
        barStyle={barStyle}
        backgroundColor={effectiveBackgroundColor}
        translucent={translucent}
      />
      {/* <SafeAreaView style={{ backgroundColor: effectiveBackgroundColor }} /> */}
    </>
  );
};

export default StatusBarCustom;
