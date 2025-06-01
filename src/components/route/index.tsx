import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import Dashboard from "@/app";
import { RootStackParamList } from "@/types/navigation";
import SolicitaColeta from "../solicitaColeta";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="SolicitaColeta" component={SolicitaColeta} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
