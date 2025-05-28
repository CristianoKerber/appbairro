import { NavigationContainer } from '@react-navigation/native'; // <- Aqui está a correção
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import Dashboard from '../dashboard';

const Stack = createNativeStackNavigator();

export function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen name="Dashboard" component={Dashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
