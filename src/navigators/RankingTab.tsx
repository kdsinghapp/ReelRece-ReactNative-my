import 'react-native-gesture-handler';
import React, { memo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import _routes from '@routes/routes'; 
import RankingScreen from '@screens/BottomTab/ranking/rankingScreen/RankingScreen';
import ScreenNameEnum from '@routes/screenName.enum';
import MovieDetailScreen from '@screens/BottomTab/discover/movieDetail/MovieDetailScreen';
import OtherProfile from '@screens/BottomTab/home/otherProfile/OtherProfile';
import WoodsScreen from '@screens/BottomTab/ranking/woodsScreen/WoodsScreen';
import SearchMovieDetail from '@screens/BottomTab/discover/movieDetail/SearchMovieDetail';
 const Stack = createNativeStackNavigator();

const RankingTab = memo(() => {
  const _routes = [
    { name: ScreenNameEnum.RankingScreen, Component: RankingScreen },
    { name: ScreenNameEnum.MovieDetailScreen, Component: MovieDetailScreen },
    { name: ScreenNameEnum.OtherProfile, Component: OtherProfile },
    { name: ScreenNameEnum.WoodsScreen, Component: WoodsScreen },
    { name: ScreenNameEnum.SearchMovieDetail, Component: SearchMovieDetail },
  ];

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        freezeOnBlur: true,
      }}>
      {_routes.map((screen) => (
        <Stack.Screen
          key={screen.name}
          name={screen.name}
          component={screen.Component}
        />
      ))}

    </Stack.Navigator>
  );
});
RankingTab.displayName = 'RankingTab';

export default RankingTab;
