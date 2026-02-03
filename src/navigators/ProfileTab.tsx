import 'react-native-gesture-handler';
import React, { FunctionComponent } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import _routes from '@routes/routes';
import ScreenNameEnum from '@routes/screenName.enum';
import ProfileScreen from '@screens/BottomTab/profile/profileScreen/ProfileScreen';
import EditProfile from '@screens/BottomTab/profile/editProfile/EditProfile';
import Followers from '@screens/BottomTab/profile/followerTab/Followers';
import MainSetting from '@screens/BottomTab/profile/setting/MainSetting';
import AccountSetting from '@screens/BottomTab/profile/setting/AccountSetting';
import PlaybackSetting from '@screens/BottomTab/profile/setting/PlaybackSetting';
import HelpSetting from '@screens/BottomTab/profile/setting/HelpSetting';
import SettingLogOut from '@screens/BottomTab/profile/setting/SettingLogOut';
import ChangePassSetting from '@screens/BottomTab/profile/setting/ChangePassSetting';
import PrivacySetting from '@screens/BottomTab/profile/setting/PrivacySetting';
import HelpMessage from '@components/settingHelp/helpMessage';
import WatchSaveUser from '@screens/BottomTab/home/watchSaveUser/WatchSaveUser';
import OtherWantPrfofile from '@screens/BottomTab/home/otherTaingPrfofile/OtherWantPrfofile';
import OtherTaingPrfofile from '@screens/BottomTab/home/otherTaingPrfofile/OtherTaingPrfofile';
import GroupSearch from '@screens/BottomTab/watch/watchScreen/GroupSearch';
import StreamService from '@screens/BottomTab/profile/setting/StreamService';
import FeatureRequest from '@screens/BottomTab/profile/setting/FeatureRequest';
import MovieDetailScreen from '@screens/BottomTab/discover/movieDetail/MovieDetailScreen'
import WoodsScreen from '@screens/BottomTab/ranking/woodsScreen/WoodsScreen';
import SearchMovieDetail from '@screens/BottomTab/discover/movieDetail/SearchMovieDetail';
import OtherProfile from '@screens/BottomTab/home/otherProfile/OtherProfile';
const Stack = createNativeStackNavigator();

const ProfileTab: FunctionComponent = () => {
  const _routess = [
    { name: ScreenNameEnum.ProfileScreen, Component: ProfileScreen },
    { name: ScreenNameEnum.EditProfile, Component: EditProfile },
    { name: ScreenNameEnum.Followers, Component: Followers },
    { name: ScreenNameEnum.MainSetting, Component: MainSetting },
    { name: ScreenNameEnum.AccountSetting, Component: AccountSetting },
    { name: ScreenNameEnum.PlaybackSetting, Component: PlaybackSetting },
    { name: ScreenNameEnum.PrivacySetting, Component: PrivacySetting },
    { name: ScreenNameEnum.HelpSetting, Component: HelpSetting },
    { name: ScreenNameEnum.SettingLogOut, Component: SettingLogOut },
    { name: ScreenNameEnum.ChangePassSetting, Component: ChangePassSetting },
    { name: ScreenNameEnum.HelpMessage, Component: HelpMessage },
    { name: ScreenNameEnum.GroupSearch, Component: GroupSearch },
    { name: ScreenNameEnum.StreamService, Component: StreamService },
    { name: ScreenNameEnum.FeatureRequest, Component: FeatureRequest },
    { name: ScreenNameEnum.MovieDetailScreen, Component: MovieDetailScreen },
    { name: ScreenNameEnum.WoodsScreen, Component: WoodsScreen },
    { name: ScreenNameEnum.OtherTaingPrfofile, Component: OtherTaingPrfofile },
    { name: ScreenNameEnum.WatchSaveUser, Component: WatchSaveUser },  
    { name: ScreenNameEnum.OtherWantPrfofile, Component: OtherWantPrfofile }, 
    { name: ScreenNameEnum.SearchMovieDetail, Component: SearchMovieDetail },
    { name: ScreenNameEnum.OtherProfile, Component: OtherProfile },
    
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

export default ProfileTab;
