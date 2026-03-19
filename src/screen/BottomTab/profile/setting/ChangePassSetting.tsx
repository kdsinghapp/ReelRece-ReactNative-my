import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
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
import { useNetworkStatus } from '@hooks/useNetworkStatus'

const ChangePassSetting = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  const email = useSelector((state: RootState) => state.auth.userGetData?.email_id);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [secureCurrent, setSecureCurrent] = useState(true);
  const [secureNew, setSecureNew] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [toastMess, setToastMess] = useState(false)
  const [toastMessColorGreen, setToastMessGreen] = useState(false)
  const [toastMessage, setToastMessage] = useState('');

  const navigation = useNavigation();

  const toastMessFunc = ({ green = false, message = '' }) => {
    setToastMess(true);
    setToastMessage(message);

    if (green) setToastMessGreen(true);

    setTimeout(() => {
      setToastMess(false);
      setToastMessGreen(false);
      setToastMessage('');
    }, 2000);
  };

  const handleSave = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toastMessFunc({ green: false, message: t("errorMessage.checkPassword") });
      return;
    }

    if (newPassword !== confirmPassword) {
      toastMessFunc({ green: false, message: t("errorMessage.confirmNotMatch") });

      return;
    }

    try {
      if (!email) {
        toastMessFunc({ green: false, message: t("errorMessage.checkPassword") });
        return;
      }
      // 1. Current password verify (Login API)
      const tokenCheck = await loginUser_Api(email, currentPassword.trim());
      if (!tokenCheck?.success || !tokenCheck?.data) {
        toastMessFunc({ green: false, message: t("errorMessage.currentNotMatch") });
        return;
      }

      const authToken = tokenCheck.data;
      // 2. Change Password API
      const res = await changePassword(authToken, newPassword.trim());
      if (res?.password_reset === "success") {
        toastMessFunc({ green: true, message: t("errorMessage.passwordChangeSuccess") });
        navigation.goBack();
      }
    } catch (_error) {
      // handle error if needed
    }
  };
const isOnline = useNetworkStatus();
  return (
    <SafeAreaView edges={isOnline ? ['top'] : []}  style={styles.container}>
      <StatusBarCustom />
      <HeaderCustom
        title={t("login.changepassword")}
        backIcon={imageIndex.backArrow}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.formInner}>
              {/* Current Password */}
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder={t("login.currentpassword")}
                  placeholderTextColor={Color.placeHolder}
                  secureTextEntry={secureCurrent}
                  style={styles.input}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  returnKeyType="next"
                  blurOnSubmit={false}
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
                  autoComplete="off"
                  returnKeyType="next"
                  blurOnSubmit={false}
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
                  returnKeyType="done"
                  onSubmitEditing={() => Keyboard.dismiss()}
                />
                <TouchableOpacity onPress={() => setSecureConfirm(!secureConfirm)}>
                  <Image style={styles.hideImage} source={secureConfirm ? imageIndex.eyes : imageIndex.view} />
                </TouchableOpacity>
              </View>

      {/* Save Button */}
      <View style={styles.saveButtonWrap}>
        <Button title={t("common.save")} onPress={handleSave} />
      </View>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>


      {toastMess && (
        <SuccessMessageCustom
          textColor={Color.whiteText}
          color={toastMessColorGreen ? Color.green : Color.red}
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  formInner: {
    paddingHorizontal: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: Color.grey700,
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
    height: 47,
    justifyContent: 'space-between',
    marginHorizontal: 15,
  },
  input: {
    flex: 1,
    color: Color.whiteText,
    fontSize: 16,
     fontFamily: font.PoppinsRegular,
   },
  hideImage: {
    height: 18,
    width: 18,
    resizeMode: 'contain',
    tintColor: Color.whiteText,
  },
  saveButtonWrap: {
    paddingHorizontal: 18,
    marginTop: 10,
  },
});

