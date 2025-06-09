import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import CadastroScreen from "@/components/cadastro";
import Dashboard from "@/components/dashboard";
import SolicitaColeta from "@/components/solicitaColeta";
import { RootStackParamList } from "@/types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <Stack.Navigator initialRouteName="Cadastro">
      <Stack.Screen name="Cadastro" component={CadastroScreen} />
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="SolicitaColeta" component={SolicitaColeta} />
    </Stack.Navigator>
  );
}
