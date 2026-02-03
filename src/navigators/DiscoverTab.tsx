import 'react-native-gesture-handler';
import React, { FunctionComponent } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import _routes from '@routes/routes';
import ScreenNameEnum from '@routes/screenName.enum';
import DiscoverScreen from '@screens/BottomTab/discover/discoverScreen/DiscoverScreen';
import MovieDetailScreen from '@screens/BottomTab/discover/movieDetail/MovieDetailScreen';
import WoodsScreen from '@screens/BottomTab/ranking/woodsScreen/WoodsScreen';
import SearchMovieDetail from '@screens/BottomTab/discover/movieDetail/SearchMovieDetail';
const Stack = createNativeStackNavigator();


const DiscoverTab: FunctionComponent = () => {
  const _routess = [
    { name: ScreenNameEnum.DiscoverScreen, Component: DiscoverScreen },
    { name: ScreenNameEnum.MovieDetailScreen, Component: MovieDetailScreen },
    { name: ScreenNameEnum.WoodsScreen, Component: WoodsScreen },
    { name: ScreenNameEnum.SearchMovieDetail, Component: SearchMovieDetail },

    // { name: ScreenNameEnum.WoodsScreen, Component: WoodsScreen },  
   ];

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',

      }}>
      {_routess.map((screen, index) => (
        <Stack.Screen
          key={index}
          name={screen.name}
          component={screen.Component}
        />
      ))}

    </Stack.Navigator>
  );
};

export default DiscoverTab;
