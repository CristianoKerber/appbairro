import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import Dashboard from "@/components/dashboard";
import SolicitaColeta from "@/components/solicitaColeta";
import { RootStackParamList } from "@/types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
      <Stack.Navigator  initialRouteName="Dashboard">
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="SolicitaColeta" component={SolicitaColeta} />
      </Stack.Navigator>
  );
}
