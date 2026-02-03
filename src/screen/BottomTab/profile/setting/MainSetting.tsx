import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { t } from "i18next";

import { Color } from "@theme/color";
import font from "@theme/font";
import imageIndex from "@assets/imageIndex";

import ScreenNameEnum from "@routes/screenName.enum";
import StatusBarCustom from "@components/common/statusBar/StatusBarCustom";
import { HeaderCustom, SuccessMessageCustom } from "@components/index";
import LogoutModal from "@components/modal/logoutModal/logoutModal";

import { logoutApi } from "@redux/Api/authService";
import TokenService from "@services/TokenService";
import { persistor, RootState } from "@redux/store";
import { logout } from "@redux/feature/authSlice";
import { RootStackParamList } from "@navigators/type";

type MenuItem = {
  id: string;
  icon: ImageSourcePropType; // image source
  label: string;
  screenName: keyof typeof ScreenNameEnum | "SettingLogOut";
};
type MainSettingRouteProp = RouteProp<RootStackParamList>;

const MainSetting = () => {
  const navigation = useNavigation ();
const route = useRoute<MainSettingRouteProp>();
  const { toastTrue } = route?.params || {};

  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastIsGreen, setToastIsGreen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // ✅ i18n menu
  const menuData: MenuItem[] = useMemo(
    () => [
      {
        id: "streaming",
        icon: imageIndex.playCircle,
        label: t("setting.menu.streaming"),
        screenName: "StreamService",
      },
      {
        id: "account",
        icon: imageIndex.settingUser,
        label: t("setting.menu.account"),
        screenName: "AccountSetting",
      },
      {
        id: "playback",
        icon: imageIndex.settingPlay,
        label: t("setting.menu.playback"),
        screenName: "PlaybackSetting",
      },
      {
        id: "privacy",
        icon: imageIndex.settingPrivacy,
        label: t("setting.menu.privacy"),
        screenName: "PrivacySetting",
      },
      {
        id: "feature",
        icon: imageIndex.featureRequest,
        label: t("setting.menu.featureRequest"),
        screenName: "FeatureRequest",
      },
      {
        id: "help",
        icon: imageIndex.settingHelpImg,
        label: t("setting.menu.help"),
        screenName: "HelpSetting",
      },
      {
        id: "logout",
        icon: imageIndex.settingExit,
        label: t("setting.menu.logout"),
        screenName: "SettingLogOut",
      },
    ],
    []
  );

  useEffect(() => {
    if (!toastTrue) return;

    const timer = setTimeout(() => {
      setToastVisible(true);
      setToastIsGreen(true);
      setToastMessage(t("setting.toast.feedbackSuccess"));
    }, 500);

    // auto hide (optional)
    const hideTimer = setTimeout(() => {
      setToastVisible(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, [toastTrue]);

  const handleLogoutConfirm = async () => {
    setLogoutModalVisible(false);

    const authToken = token;
    dispatch(logout());

    try {
      if (authToken) {
        await logoutApi(authToken);
      }
    } finally {
      await TokenService.clearToken();
      await persistor.purge();

      navigation.reset({
        index: 0,
        routes: [{ name: ScreenNameEnum.LoginScreen }],
      });
    }
  };

  const onPressItem = (item: MenuItem) => {
    if (item.screenName === "SettingLogOut") {  
      setLogoutModalVisible(true);
      return;
    }

    if (item.screenName === "FeatureRequest") {
      navigation.navigate(ScreenNameEnum[item.screenName], {});
      return;
    }

    navigation.navigate(ScreenNameEnum[item.screenName]);
  };

  const renderItem = ({ item }: { item: MenuItem }) => (
    <TouchableOpacity onPress={() => onPressItem(item)} style={styles.menuItem} activeOpacity={0.8}>
      <Image source={item.icon} style={styles.icon} tintColor={Color.primary} />
      <Text allowFontScaling={false} style={styles.label}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBarCustom />

      <HeaderCustom title={t("setting.header")} backIcon={imageIndex.backArrow} />

      <View style={styles.menuBox}>
        <FlatList
          data={menuData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListFooterComponent={() => <View style={styles.separator} />}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={7}
          removeClippedSubviews
        />
      </View>

      {toastVisible && (
        <SuccessMessageCustom
          textColor={Color.whiteText}
          color={toastIsGreen ? Color.green : Color.red}
          message={toastMessage}
        />
      )}

      <LogoutModal
        title={t("setting.logout.title")}
        details={t("setting.logout.details")}
        visible={logoutModalVisible}
        onCancel={() => setLogoutModalVisible(false)}
        onConfirm={handleLogoutConfirm}
      />
    </SafeAreaView>
  );
};

export default React.memo(MainSetting);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
    paddingTop: 15,
  },
  menuBox: {
    borderWidth: 2,
    borderRadius: 8,
    width: "100%",
    paddingHorizontal: 16,
    backgroundColor: Color.background,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
  },
  icon: {
    resizeMode: "contain",
    height: 24,
    width: 24,
    marginRight: 10,
  },
  label: {
    color: Color.whiteText,
    fontSize: 16,
    fontFamily: font.PoppinsMedium,
  },
  separator: {
    height: 1,
    backgroundColor: Color.placeHolder,
  },
});
