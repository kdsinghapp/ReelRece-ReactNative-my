import React, { memo } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
 import imageIndex from '@assets/imageIndex';
import ScreenNameEnum from '@routes/screenName.enum';
import { RootStackParamList } from '@navigators/type';
import { CustomStatusBar, HeaderCustom } from '@components/index';
 
interface MovieHeaderProps {
  navigation: NativeStackNavigationProp<RootStackParamList, ScreenNameEnum.MovieDetailScreen>;
}

const MovieHeader = ({ navigation }: MovieHeaderProps) => {
  return (
    <>
      <CustomStatusBar />
      <HeaderCustom
        backIcon={imageIndex.backArrow}
        rightIcon={imageIndex.search}
        onRightPress={() =>
          navigation.navigate(ScreenNameEnum.WoodsScreen, { type: 'movie' })
        }
        onBackPress={() => navigation.goBack()}
      />
    </>
  );
};

export default memo(MovieHeader);
