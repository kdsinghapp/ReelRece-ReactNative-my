import 'react-native-gesture-handler';
import React, { memo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import _routes from '@routes/routes';
import ScreenNameEnum from '@routes/screenName.enum';
import WatchScreen from '@screens/BottomTab/watch/watchScreen/WatchScreen';
import OtherProfile from '@screens/BottomTab/home/otherProfile/OtherProfile';
import MovieDetailScreen from '@screens/BottomTab/discover/movieDetail/MovieDetailScreen';
import WoodsScreen from '@screens/BottomTab/ranking/woodsScreen/WoodsScreen';
import GroupSearchScreen from '@screens/BottomTab/watch/watchScreen/GroupSearchScreen';
import WatchWithFriend from '@screens/BottomTab/watch/watchScreen/WatchWithFriend';
import SearchMovieDetail from '@screens/BottomTab/discover/movieDetail/SearchMovieDetail';

const Stack = createNativeStackNavigator();

const WatchTab = memo(() => {
  const _routess = [
    { name: ScreenNameEnum.WatchScreen, Component: WatchScreen },
    { name: ScreenNameEnum.OtherProfile, Component: OtherProfile },
    { name: ScreenNameEnum.MovieDetailScreen, Component: MovieDetailScreen },
    { name: ScreenNameEnum.WoodsScreen, Component: WoodsScreen },
    { name: ScreenNameEnum.GroupSearch, Component: GroupSearchScreen },
    { name: ScreenNameEnum.WatchWithFriend, Component: WatchWithFriend },
    { name: ScreenNameEnum.SearchMovieDetail, Component: SearchMovieDetail }, 
  ];

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        contentStyle: { backgroundColor: '#ff0404ff' },
        freezeOnBlur: true,
      }}>
      {_routess.map((screen) => (
        <Stack.Screen
          key={screen.name}
          name={screen.name}
          component={screen.Component}
        />
      ))}

    </Stack.Navigator>
  );
});
WatchTab.displayName = 'WatchTab';

export default WatchTab;
