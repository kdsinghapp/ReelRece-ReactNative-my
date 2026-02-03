import 'react-native-gesture-handler';
import React, { FunctionComponent } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import _routes from '@routes/routes';
import ScreenNameEnum from '@routes/screenName.enum';
import OtherProfile from '@screens/BottomTab/home/otherProfile/OtherProfile';
import HomeScreen from '@screens/BottomTab/home/homeScreen/HomeScreen'
import OtherTaingPrfofile from '@screens/BottomTab/home/otherTaingPrfofile/OtherTaingPrfofile';
import WatchSaveUser from '@screens/BottomTab/home/watchSaveUser/WatchSaveUser';
import OtherWantPrfofile from '@screens/BottomTab/home/otherTaingPrfofile/OtherWantPrfofile';
import Followers from '@screens/BottomTab/profile/followerTab/Followers';
import MovieDetailScreen from '@screens/BottomTab/discover/movieDetail/MovieDetailScreen';
import WoodsScreen from '@screens/BottomTab/ranking/woodsScreen/WoodsScreen';
import SearchMovieDetail from '@screens/BottomTab/discover/movieDetail/SearchMovieDetail';
const Stack = createNativeStackNavigator();



const FeedTab: FunctionComponent = () => {
  const _routess = [
    { name: ScreenNameEnum.HOME_SCREEN, Component: HomeScreen },
    { name: ScreenNameEnum.OtherProfile, Component: OtherProfile },
    { name: ScreenNameEnum.Followers, Component: Followers },
    { name: ScreenNameEnum.OtherTaingPrfofile, Component: OtherTaingPrfofile },  //PROFILE1
    { name: ScreenNameEnum.WatchSaveUser, Component: WatchSaveUser },   // PROFILE3
    { name: ScreenNameEnum.OtherWantPrfofile, Component: OtherWantPrfofile },   // PROFILE2
    { name: ScreenNameEnum.MovieDetailScreen, Component: MovieDetailScreen },
    { name: ScreenNameEnum.WoodsScreen, Component: WoodsScreen },

    { name: ScreenNameEnum.SearchMovieDetail, Component: SearchMovieDetail },


    // more routes...
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

export default FeedTab;
