import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
 import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
 import { SafeAreaView } from 'react-native-safe-area-context';
 import Toast from 'react-native-toast-message';
import toastConfig, { errorToast, successToast } from '@utils/customToast';
import { persistor, store } from '@redux/store';
import RegistrationRoutes from '@navigators/RegistrationRoutes';
 import "../.././src/i18n";
import NetworkStatusModal from '@components/NetworkStatusModal';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

// Custom theme define karein
const CustomTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'black',
    primary: 'rgb(255, 45, 85)',
    card: 'rgb(255, 255, 255)',
    text: 'rgb(28, 28, 30)',
    border: 'rgb(199, 199, 204)',
    notification: 'rgb(255, 69, 58)',
  },
};

const AppNavigator: React.FC = () => {
 const [isConnected, setIsConnected] = useState<boolean>(true);

  // NetInfo listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected ?? true);
      if(!state.isConnected){
        errorToast('No Internet! \n Please check your network connection')
      }else{
        successToast(`Back Online! \n Your internet connection has been restored`)
      }
    });

    return () => unsubscribe();
  }, []);
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GestureHandlerRootView style={{ flex: 1, }}>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }} edges={['bottom']}>
            {/* <NetworkStatusModal
            modalVisible={!isConnected}
            offlineText="No Internet! Please check your connection."
          />  */}
            <NavigationContainer
              theme={CustomTheme}
            >
              <RegistrationRoutes />
               <Toast config={toastConfig} />
            </NavigationContainer>
          </SafeAreaView>
        </GestureHandlerRootView>
      </PersistGate>
    </Provider>
  );
};

export default AppNavigator;
