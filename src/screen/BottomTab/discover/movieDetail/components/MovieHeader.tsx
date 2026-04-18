import React, { memo } from 'react';
import imageIndex from '@assets/imageIndex';
import { CustomStatusBar, HeaderCustom } from '@components/index';

interface MovieHeaderProps {
  onBackPress: () => void;
  onSearchPress: () => void;
}

const MovieHeader = ({ onBackPress, onSearchPress }: MovieHeaderProps) => {
  return (
    <>
      <CustomStatusBar />
      <HeaderCustom
        backIcon={imageIndex.backArrow}
        rightIcon={imageIndex.search}
        onRightPress={onSearchPress}
        onBackPressW={onBackPress}
      />
    </>
  );
};

export default memo(MovieHeader);
