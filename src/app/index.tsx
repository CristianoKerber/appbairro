import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import { AdminDashboard } from "@/components/admin";
import CadastroScreen from "@/components/cadastro";
import { CollectionsScreen } from "@/components/collection";
import { Configuracao } from "@/components/config";
import Dashboard from "@/components/dashboard";
import { HistoricoScreen } from "@/components/historico";
import LoginScreen from "@/components/login";
import SolicitaColeta from "@/components/solicitaColeta";
import { UsersScreen } from "@/components/users";
import { RootStackParamList } from "@/types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <Stack.Navigator
      initialRouteName="LoginScreen"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="CollectionsScreen" component={CollectionsScreen} />
      <Stack.Screen name="CadastroScreen" component={CadastroScreen} />
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="UsersScreen" component={UsersScreen} />
      <Stack.Screen name="SolicitaColeta" component={SolicitaColeta} />
      <Stack.Screen name="Configuracoes" component={Configuracao} />
      <Stack.Screen name="HistoricoScreen" component={HistoricoScreen} />
    </Stack.Navigator>
  );
}
