import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { verifyResetOTP } from '@redux/Api/authService';
import ScreenNameEnum from '@routes/screenName.enum';
 
export default function useVerifyResetPassword() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [toastMess, setToastMess] = useState(false)
  const [toastMessColorGreen, setToastMessGreen] = useState(false)
  const [toastMessage, setToastMessage] = useState('');

  // const toastMessFunc = () => {
  //   setToastMess(true);
  //   setTimeout(() => {
  //     setToastMess(false);
  //   }, 2000); 
  // }



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




// rest password  email otp verify 
const handleVerify = async (codeArray, email) => {
  const code = codeArray.join('');
   if (code.length !== 4) {
    Toast.show({ type: 'error', text1: 'Please enter 4-digit code' });
   toastMessFunc({ message: 'Please enter 4 digit code' });
      setLoading(false);
    return;
  }

  try {
    setLoading(true);
    const res = await verifyResetOTP(email, code);

    if (res.success) {
      Toast.show({ type: 'success', text1: 'OTP Verified' });
     toastMessFunc({ green: true, message: 'OTP Verified' });
setTimeout(() => {
      navigation.navigate(ScreenNameEnum.NewPassword, { email });
  
}, 2000);
    } else {
    toastMessFunc({ green: false, message:  res.message });
      // Toast.show({ type: 'error', text1: res.message });
    }
  } catch (err) {
    Toast.show({ type: 'error', text1: 'Something went wrong' });
  } finally {
    setLoading(false);
  }
};

return {
  navigation,
  handleVerify,
  loading,
  toastMess,
  setToastMess,
  toastMessage, toastMessColorGreen,
};
}
