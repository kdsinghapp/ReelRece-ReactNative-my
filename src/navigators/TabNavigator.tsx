import React, { useState, useMemo, useCallback } from "react";
import { View, Text, Image, Keyboard } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import _routes from "@routes/routes";
import ScreenNameEnum from "@routes/screenName.enum";
import { RootState } from "@redux/store";
import { Color } from "@theme/color";
import font from "@theme/font";
import { Platform } from "react-native";

const Tab = createBottomTabNavigator();

// Memoized TabIcon to prevent unnecessary re-renders
const TabIcon = React.memo(({ focused, logo, logo1, label }) => (
  <>
    <Image
      source={focused ? logo1 : logo}
      style={{
        width: 22,
        height: 22,
        resizeMode: "contain",
        tintColor: focused ? Color.primary : Color.lightGrayText,
        marginTop: 20,
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
          width: 60,
        }}
      >
        {label}
      </Text>
    )}
  </>
));

export default function TabNavigator() {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const isMultiSelect = useSelector(
    (state: RootState) => state.multiSelect.isMultiSelectMode
  );

  // Keyboard listener
  React.useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Tab config
  const tabConfig = useMemo(
    () => ({
      hideTabBarOnRoutes: [ScreenNameEnum.WoodsScreen],
      transparentTabBar: [ScreenNameEnum.WatchWithFrind],
      absolutePositionTabBar: [ScreenNameEnum.WatchWithFrind],
    }),
    []
  );

const getTabBarStyle = useCallback(
  (routeName: string) => {
    const shouldHide = tabConfig?.hideTabBarOnRoutes?.includes(routeName);
    const shouldTransparent = tabConfig.transparentTabBar.includes(routeName);
    const shouldAbsolute = tabConfig.absolutePositionTabBar.includes(routeName);

    const hidden = isKeyboardVisible || isMultiSelect || shouldHide;

    return {
     height: hidden
  ? 0
  : Platform.OS === "android"
  ? 58   // ⬆️ was 64
  : 88,  // ⬆️ was 78

paddingTop: 3,               // ⬆️ was 8
paddingBottom: Platform.OS === "android" ? 12 : 20, // ⬆️ more space

      backgroundColor: shouldTransparent ? "transparent" : Color.background,
      position:
        shouldTransparent || shouldAbsolute ? "absolute" : "relative",
      borderTopWidth: 0,
      elevation: 0,
    };
  },
  [isKeyboardVisible, isMultiSelect, tabConfig]
);


  const tabScreens = useMemo(() => _routes().BOTTOMTAB_ROUTE, []);

  return (
    <View style={{ flex: 1, backgroundColor: Color.background }}>
    <Tab.Navigator
  initialRouteName={ScreenNameEnum.RankingTab}
  lazy
  detachInactiveScreens
  screenOptions={{
    headerShown: false,
    tabBarShowLabel: false,
    tabBarHideOnKeyboard: true,
    animationEnabled: false,
    sceneContainerStyle: { backgroundColor: Color.background },
  }}
>
  {tabScreens.map((screen) => (
    <Tab.Screen
      key={screen.name}
      name={screen.name}
      component={screen.Component}
      options={({ route }) => {
        const focusedRouteName =
          getFocusedRouteNameFromRoute(route) ?? route.name;

        return {
          tabBarStyle: getTabBarStyle(focusedRouteName),
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              logo={screen.logo}
              logo1={screen.logo1}
              label={screen.label}
            />
          ),
        };
      }}
    />
  ))}
</Tab.Navigator>

    </View>
  );
}
