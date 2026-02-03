import { Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Color } from '@theme/color'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import { RootState } from '@redux/store'
import { changePassword, loginUser_Api } from '@redux/Api/authService'
import font from '@theme/font'
import { SafeAreaView } from 'react-native-safe-area-context'
import StatusBarCustom from '@components/common/statusBar/StatusBarCustom'
import { Button, HeaderCustom, SuccessMessageCustom } from '@components/index'
import imageIndex from '@assets/imageIndex'
import { t } from 'i18next'


const ChangePassSetting = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const email = useSelector((state: RootState) => state.auth.userGetData?.email_id);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [secureCurrent, setSecureCurrent] = useState(true);
  const [secureNew, setSecureNew] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [toestMess, setToestMess] = useState(false)
  const [toestMessColorGreen, setToestMessGreen] = useState(false)
  const [toastMessage, setToastMessage] = useState('');

  const navigation = useNavigation();


  const toestMessFunc = ({ green = false, message = '' }) => {
    setToestMess(true);
    setToastMessage(message);

    if (green) setToestMessGreen(true);

    setTimeout(() => {
      setToestMess(false);
      setToestMessGreen(false);
      setToastMessage('');
    }, 2000);
  };

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toestMessFunc({ green: false, message: t("errorMessage.checkPassword") });
      return;
    }

    if (newPassword !== confirmPassword) {
      toestMessFunc({ green: false, message: t("errorMessage.confirmNotMatch") });

      return;
    }

    try {
      // 1. Current password verify (Login API)
      const tokenCheck = await loginUser_Api(email, currentPassword.trim());
      if (!tokenCheck) {
        toestMessFunc({ green: false, message: t("errorMessage.currentNotMatch") });

        return;
      }

      // 2. Change Password API
      const res = await changePassword(tokenCheck, newPassword.trim());
      if (res?.password_reset === "success") {

        toestMessFunc({ green: true, message: t("errorMessage.passwordChangeSuccess") });

        navigation.goBack();
      } else {
        // Alert.alert("Error", "Password change failed");
      }

    } catch (error) {
      // Alert.alert("Error", "कुछ गड़बड़ है, कृपया दोबारा कोशिश करें");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBarCustom />
      <HeaderCustom
        title=
        {t("login.changepassword")}
        backIcon={imageIndex.backArrow}
      />

      {/* Current Password */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder= {t("login.currentpassword")}
          placeholderTextColor={Color.placeHolder}
          secureTextEntry={secureCurrent}
          style={styles.input}
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />
        <TouchableOpacity onPress={() => setSecureCurrent(!secureCurrent)}>
          <Image style={styles.hideImage} source={secureCurrent ? imageIndex.eyes : imageIndex.view} />
        </TouchableOpacity>
      </View>

      {/* New Password */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder={t("login.newpassword")}
          placeholderTextColor={Color.placeHolder}
          secureTextEntry={secureNew}
          style={styles.input}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TouchableOpacity onPress={() => setSecureNew(!secureNew)}>
          <Image style={styles.hideImage} source={secureNew ? imageIndex.eyes : imageIndex.view} />
        </TouchableOpacity>
      </View>

      {/* Confirm Password */}
      <View style={styles.inputContainer}>
        <TextInput
          placeholder={t("login.confirmnewpassword")}
          placeholderTextColor={Color.placeHolder}
          secureTextEntry={secureConfirm}
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity onPress={() => setSecureConfirm(!secureConfirm)}>
          <Image style={styles.hideImage} source={secureConfirm ? imageIndex.eyes : imageIndex.view} />
        </TouchableOpacity>
      </View>

      {/* Save Button */}
      <View style={{ paddingHorizontal: 18, marginTop: 10 }}>
        <Button title={t("common.save")} onPress={handleSave} />
      </View>


      {toestMess && (
        <SuccessMessageCustom
          textColor={Color.whiteText}
          color={toestMessColorGreen ? Color.green : Color.red}
          message={toastMessage}
        />
      )}
    </SafeAreaView>
  )
}

export default ChangePassSetting

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.background,
    paddingTop: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: Color.grey700,
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
    height: 48,
    justifyContent: 'space-between',
    marginHorizontal: 15,
  },
  input: {
    flex: 1,
    color: Color.whiteText,
    fontSize: 16,
    lineHeight: 20,
    fontFamily: font.PoppinsRegular,
    height: 50,
  },
  hideImage: {
    height: 18,
    width: 18,
    resizeMode: 'contain',
    tintColor: Color.whiteText
  }
});
