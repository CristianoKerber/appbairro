import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import CadastroScreen from "@/components/cadastro";
import Dashboard from "@/components/dashboard";
import LoginScreen from "@/components/login";
import SolicitaColeta from "@/components/solicitaColeta";
import { RootStackParamList } from "@/types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <Stack.Navigator initialRouteName="LoginScreen" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="CadastroScreen" component={CadastroScreen} />
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="SolicitaColeta" component={SolicitaColeta} />
    </Stack.Navigator>
  );
}
