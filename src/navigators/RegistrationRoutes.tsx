import 'react-native-gesture-handler';
import React, { memo } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import _routes from '@routes/routes';

const Stack = createNativeStackNavigator();
const RegistrationRoutes = memo(() => (
  <Stack.Navigator 
    screenOptions={{
      headerShown: false,
      gestureEnabled: true,
      gestureDirection: 'horizontal',
      freezeOnBlur: true,
    }}>
    {_routes()?.REGISTRATION_ROUTE.map(screen => (
      <Stack.Screen
        key={screen.name}
        name={screen.name}
        component={screen.Component}
      />
    ))}

  </Stack.Navigator>
));
RegistrationRoutes.displayName = 'RegistrationRoutes';

export default RegistrationRoutes;
