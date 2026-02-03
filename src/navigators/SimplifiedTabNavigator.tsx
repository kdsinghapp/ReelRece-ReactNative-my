import React, { useMemo } from 'react';
import { View, Image, Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';
import { Color } from '@theme/color';
import font from '@theme/font';
import imageIndex from '@assets/imageIndex';
import ScreenNameEnum from '@routes/screenName.enum';

// Direct screen imports - NO NESTED NAVIGATORS
import HomeScreen from '@screens/BottomTab/home/homeScreen/FixedHomeScreen';
import DiscoverScreen from '@screens/BottomTab/discover/discoverScreen/DiscoverScreen';
import RankingScreen from '@screens/BottomTab/ranking/rankingScreen/RankingScreen';
import WatchScreen from '@screens/BottomTab/watch/watchScreen/WatchScreen';
import ProfileScreen from '@screens/BottomTab/profile/profileScreen/ProfileScreen';

const Tab = createBottomTabNavigator();

// Simple tab icon component
const TabIcon = React.memo(({ focused, logo, logo1, label }: { focused: boolean; logo: string; logo1: string; label: string }) => (
  <View style={{ alignItems: 'center' }}>
    <Image
      source={focused ? logo1 : logo}
      style={{
        width: 22,
        height: 22,
        resizeMode: "contain",
        tintColor: focused ? Color.primary : Color.lightGrayText,
      }}
    />
    {label && (
      <Text
        allowFontScaling={false}
        numberOfLines={1}
        style={{
          fontFamily: focused ? font.PoppinsBold : font.PoppinsRegular,
          color: focused ? Color.primary : Color.lightGrayText,
          fontSize: 12,
          marginTop: 4,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    )}
  </View>
));

const SimplifiedTabNavigator = React.memo(() => {
  const isMultiSelect = useSelector(
    (state: RootState) => state.multiSelect?.isMultiSelectMode || false
  );

  // Simple tab configuration - no nested navigators
  const tabs = useMemo(() => [
    {
      name: ScreenNameEnum.HOME_SCREEN,
      component: HomeScreen,
      label: "Feed",
      logo: imageIndex.home,
      logo1: imageIndex.homeActive,
    },
    {
      name: ScreenNameEnum.DiscoverScreen,
      component: DiscoverScreen,
      label: "Discover",
      logo: imageIndex.discover,
      logo1: imageIndex.discoverActive,
    },
    {
      name: ScreenNameEnum.RankingScreen,
      component: RankingScreen,
      label: "Ranking",
      logo: imageIndex.rankingTab,
      logo1: imageIndex.rankingActive,
    },
    {
      name: ScreenNameEnum.WatchScreen,
      component: WatchScreen,
      label: "Watch+",
      logo: imageIndex.usersGroup,
      logo1: imageIndex.usersGroupActive,
    },
    {
      name: ScreenNameEnum.ProfileScreen,
      component: ProfileScreen,
      label: "Profile",
      logo: imageIndex.UserProfile,
      logo1: imageIndex.profileActive,
    },
  ], []);

  return (
    <Tab.Navigator
      initialRouteName={ScreenNameEnum.RankingScreen}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: Color.background,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          paddingTop: 10,
          display: isMultiSelect ? 'none' : 'flex',
        },
        tabBarActiveTintColor: Color.primary,
        tabBarInactiveTintColor: Color.lightGrayText,
        // Prevent unnecessary re-renders
        lazy: true,
        unmountOnBlur: false, // Keep screens mounted but unfocused
      }}
    >
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarLabel: tab.label,
            tabBarIcon: ({ focused }) => (
              <TabIcon
                focused={focused}
                logo={tab.logo}
                logo1={tab.logo1}
              />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
});

SimplifiedTabNavigator.displayName = 'SimplifiedTabNavigator';

export default SimplifiedTabNavigator;