import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import ScreenNameEnum from '@routes/screenName.enum';

// Auth screens
import Welcome from '@screens/Auth/welcome/Welcome';
import Login from '@screens/Auth/login/Login';
import Signup from '@screens/Auth/signup/Signup';

// Main tab navigator
import SimplifiedTabNavigator from '@navigators/SimplifiedTabNavigator';

// Additional screens that stack on top of tabs
import MovieDetailScreen from '@screens/BottomTab/discover/movieDetail/MovieDetailScreen';
import OtherProfile from '@screens/BottomTab/home/otherProfile/OtherProfile';
import WoodsScreen from '@screens/BottomTab/ranking/woodsScreen/WoodsScreen';
import EditProfile from '@screens/BottomTab/profile/editProfile/EditProfile';
import MainSetting from '@screens/BottomTab/profile/setting/MainSetting';
import Notification from '@screens/BottomTab/home/homeScreen/Notification/Notification';

const Stack = createNativeStackNavigator();

const SimplifiedMainNavigator = React.memo(() => {
  return (
    <Stack.Navigator
      initialRouteName={ScreenNameEnum.WELCOME}
      screenOptions={{
        headerShown: false,
        // Simple animations
        animation: Platform.select({
          ios: 'slide_from_right',
          android: 'slide_from_right',
        }),
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      {/* Auth Flow */}
      <Stack.Screen name={ScreenNameEnum.WELCOME} component={Welcome} />
      <Stack.Screen name={ScreenNameEnum.LoginScreen} component={Login} />
      <Stack.Screen name={ScreenNameEnum.SignUpScreen} component={Signup} />

      {/* Main App - Tabs */}
      <Stack.Screen
        name={ScreenNameEnum.TabNavigator}
        component={SimplifiedTabNavigator}
        options={{
          gestureEnabled: false, // Disable swipe back from tabs
        }}
      />

      {/* Modal/Detail Screens - Stack on top of tabs */}
      <Stack.Screen
        name={ScreenNameEnum.MovieDetailScreen}
        component={MovieDetailScreen}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name={ScreenNameEnum.OtherProfile}
        component={OtherProfile}
      />
      <Stack.Screen
        name={ScreenNameEnum.WoodsScreen}
        component={WoodsScreen}
        options={{
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name={ScreenNameEnum.EditProfile}
        component={EditProfile}
      />
      <Stack.Screen
        name={ScreenNameEnum.MainSetting}
        component={MainSetting}
      />
      <Stack.Screen
        name={ScreenNameEnum.Notification}
        component={Notification}
        options={{
          animation: 'slide_from_bottom',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
});

SimplifiedMainNavigator.displayName = 'SimplifiedMainNavigator';

export default SimplifiedMainNavigator;