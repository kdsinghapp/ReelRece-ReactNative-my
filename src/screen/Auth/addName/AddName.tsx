
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React from 'react';
import imageIndex from '@assets/imageIndex';
import styles from './style';
import { useNavigation, useRoute } from '@react-navigation/native';
import useSignup from '@screens/Auth/signup/useSignup';
import CustomText from '@components/common/CustomText/CustomText';
import { Color } from '@theme/color';
import font from '@theme/font';
import ButtonCustom from '@components/common/button/ButtonCustom';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNetworkStatus } from '@hooks/useNetworkStatus';
import LoadingModal from '@utils/Loader';
import { CustomStatusBar, InputFieldCustom } from '@components/index';
import { t } from 'i18next';
import ScreenNameEnum from '@routes/screenName.enum';
import { useSelector } from 'react-redux';
import { RootState } from '@redux/store';

export default function AddName() {
  const {
    loading,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    firstNameError,
    lastNameError,
    handleUpdateName,
  } = useSignup()
  const token = useSelector((state: RootState) => state.auth.token);
  const route = useRoute();
  const { email, password } = route?.params || {};
  const navigating = useNavigation()
  const isOnline = useNetworkStatus()

  return (
    <SafeAreaView edges={isOnline ? ['top'] : []} style={{
      flex: 1,
      backgroundColor: "black"
    }}>
      <CustomStatusBar backgroundColor="transparent" translucent />

      {loading ? <LoadingModal /> : null}
      <ScrollView showsVerticalScrollIndicator={false} >

        <View
          style={styles.viewCont}>
          <TouchableOpacity onPress={() => navigating.goBack()} >
            <Image source={imageIndex.backArrow} style={styles.backIcon} />
          </TouchableOpacity>
          {/* Logo & App Name */}
          <View style={styles.logoContainer}>
            <Image
              source={imageIndex.appLogo}
              style={styles.imgLogo}
              resizeMode="contain"
            />
            <Image
              source={imageIndex.reelRecs}
              style={{
                height: 18,
                width: 95,
                marginTop: 6,
                resizeMode: 'contain',
              }}
            />
          </View>
          <View style={{ marginTop: 30 }}>

            <CustomText
              size={20}
              color={Color.whiteText}
              style={styles.loginHeading}
              font={font.PoppinsSemiBold}
            >
              {t("login.whatsyourname", "What’s your name?")}
            </CustomText>
          </View>
          <CustomText
            size={14}
            color={Color.whiteText}
            style={styles.titlSub}
            font={font.PoppinsRegular}

          >
            {t("login.howfriendsee", "This is how your friends will see you!")}
          </CustomText>
          <View style={styles.inputView}>

            <InputFieldCustom
              text={firstName}
              onChangeText={setFirstName}
              placeholder={t("login.firstname", "First name")}
            />
            {firstNameError ? (
              <CustomText
                size={14}
                color={'red'}
                style={styles.redText}
                font={font.PoppinsRegular}
              >
                {firstNameError}
              </CustomText>
            ) : null}

            <View style={{ marginTop: 0 }}>
              <InputFieldCustom
                text={lastName}
                onChangeText={setLastName}
                placeholder={t("login.lastname", "Last name")}
              />
              {lastNameError ? (
                <CustomText
                  size={14}
                  color={'red'}
                  style={styles.redText}
                  font={font.PoppinsRegular}
                >
                  {lastNameError}
                </CustomText>
              ) : null}
            </View>
          </View>
          <View style={{
            marginTop: 40
          }}>

            <ButtonCustom
              title={t("login.next", "Next")}
              onPress={() => {
                if (token) {
                  handleUpdateName(firstName, lastName, token);
                }
              }}
            />
          </View>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}
