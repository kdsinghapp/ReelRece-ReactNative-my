import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,

  Dimensions,
} from 'react-native';
import React from 'react';
import styles from './style';
import useSignup from './useSignup';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Color } from '@theme/color';
import { Button, CustomStatusBar, InputFieldCustom } from '@components/index';
import LoadingModal from '@utils/Loader';
import imageIndex from '@assets/imageIndex';
import ScreenNameEnum from '@routes/screenName.enum';
import { t } from 'i18next';
export default function Signup() {
  const {
    navigation,
    SignupUser,
    loading,
    handleIdentityText,
    // handleUsernameText,
    handlePassText,
    handleConfirmPassText,
    // setConfirmPassword,
    confirmPasswordError,
    // setConfirmPasswordError,
    emailError,
    passwordError,
    email, password } = useSignup()
  const navigating = useNavigation()

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: "black"
    }}>
      <CustomStatusBar backgroundColor="transparent" translucent />

      {loading ? <LoadingModal /> : null}
      <ScrollView showsVerticalScrollIndicator={false} >

        <View
          style={[styles.viewCont, { marginTop: 50, }]}>
          <TouchableOpacity onPress={() => navigating.goBack()} >
            <Image source={imageIndex.backArrow} style={styles.backIcon} />
          </TouchableOpacity>
          <View style={[styles.appLogoContainer, { marginTop: 36 }]}>

            <Image
              source={imageIndex.appLogo}
              style={styles.imgLogo} resizeMode='contain'
            />
            <Image
                                   source={imageIndex.reelRecs}
                                   style={{
                                 height: 18,
                         width: 95,
                         marginTop: 6,
                         resizeMode: 'contain', // important for proper image fit
                                   }}  
                                 />
          </View>
          <View style={{ marginTop: 34 }}>
            <Text style={styles.loginHeading}>{t("login.create_account",)}</Text>

          </View>
          <View style={styles.inputView}>
            <InputFieldCustom
              text={email}
              onChangeText={handleIdentityText}
              placeholder={t("login.email",)}
            />
            {emailError ? <Text style={styles.redText}>{emailError}</Text> : null}


            {/* <InputFieldCustom
               text={username}
              onChangeText={handleUsernameText}
              placeholder={'UserName'}
            />
            {usernameError ? <Text style={Styles.redText}>{usernameError}</Text> : null} */}

            <InputFieldCustom
              text={password}
              onChangeText={handlePassText}
              placeholder={t("login.password",)}
              showEye={false}
            />
            <InputFieldCustom
              placeholder={t("login.confirmpassword",)}
              onChangeText={handleConfirmPassText}

              showEye={false}
            />
            {confirmPasswordError ? <Text style={styles.redText}>{confirmPasswordError}</Text> : null}
            {passwordError ? <Text style={styles.redText}>{passwordError}</Text> : null}

          </View>
          <View style={{
            marginTop: 36,
          }}>
            {/* <Button title='Sign up' onPress={SignupUser} /> */}
            <Button title={t("login.sign_up",)} onPress={SignupUser}
              textStyle={{
                color: Color.whiteText
              }}
            />

            {/* <Button title='Sign up' onPress={() => navigation.navigate(ScreenNameEnum.AddUsername)} /> */}
          </View>
          <Text style={styles.subTitle}>{t("login.or_continue_with",)}</Text>
          <View style={styles.otherLoginContainer}>
            <TouchableOpacity style={styles.iconButton}>
              <Image
                source={imageIndex.fb}
                style={styles.iconImage}
              />
            </TouchableOpacity>

            {/* Button 2 */}
            <TouchableOpacity style={styles.iconButton}>

              <Image
                source={imageIndex.google}
                style={styles.iconImage}
              />
            </TouchableOpacity>
            {/* Button 3 */}
            <TouchableOpacity style={styles.iconButton}>

              <Image
                source={imageIndex.apple}
                style={styles.iconImage}
              />
            </TouchableOpacity>
          </View>
          <View
            style={styles.titlView}>
            <Text style={styles.tite}>
            {t("login.already_have",)}
            </Text>
            <TouchableOpacity
              style={{}}
              onPress={() => {
                navigation.navigate(ScreenNameEnum.LoginScreen)
              }}>
              <Text style={styles.text}> {t("login.sign_in",)}</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>

    </SafeAreaView>
  );
}




