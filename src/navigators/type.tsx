import ScreenNameEnum from "@routes/screenName.enum";

 
// navigation/types.ts
export type DiscoverTabParamList = {
  [ScreenNameEnum.DiscoverScreen]: { isSelectList: string; type: string };
};

export type RootStackParamList = {
  [ScreenNameEnum.DiscoverTab]: {
    screen: keyof DiscoverTabParamList;
    params?: DiscoverTabParamList[keyof DiscoverTabParamList];
  };
   [ScreenNameEnum.MovieDetailScreen]: { item };
    [ScreenNameEnum.OtherProfile]: { item };
    [ScreenNameEnum.WoodsScreen]: never;

  // other root stack screens...
};
