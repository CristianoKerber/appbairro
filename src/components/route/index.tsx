import Dashboard from "@/app";
import { NavigationContainer } from "@react-navigation/native"; // <- Aqui está a correção
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

const Stack = createNativeStackNavigator();

export function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen name="app" component={Dashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
