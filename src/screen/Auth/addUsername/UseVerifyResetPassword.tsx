import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { verifyResetOTP } from '@redux/Api/authService';
import ScreenNameEnum from '@routes/screenName.enum';
 
export default function useVerifyResetPassword() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [toestMess, setToestMess] = useState(false)
  const [toestMessColorGreen, setToestMessGreen] = useState(false)
  const [toastMessage, setToastMessage] = useState('');

  // const toestMessFunc = () => {
  //   setToestMess(true);
  //   setTimeout(() => {
  //     setToestMess(false);
  //   }, 2000); 
  // }



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




// rest password  email otp verify 
const handleVerify = async (codeArray, email) => {
  const code = codeArray.join('');
   if (code.length !== 4) {
    Toast.show({ type: 'error', text1: 'Please enter 4-digit code' });
   toestMessFunc({ message: 'Please enter 4 digit code' });
      setLoading(false);
    return;
  }

  try {
    setLoading(true);
    const res = await verifyResetOTP(email, code);

    if (res.success) {
      Toast.show({ type: 'success', text1: 'OTP Verified' });
     toestMessFunc({ green: true, message: 'OTP Verified' });
setTimeout(() => {
      navigation.navigate(ScreenNameEnum.NewPassword, { email });
  
}, 2000);
    } else {
    toestMessFunc({ green: false, message:  res.message });
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
  toestMess,
  setToestMess,
  toastMessage, toestMessColorGreen,
};
}
