import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@screens/Auth/login/LoginTypes';
const useWelcome = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return {
    navigation
  };
};

export default useWelcome;
