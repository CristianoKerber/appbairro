// App.tsx ou HomeScreen.tsx
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Circle, G, Svg } from "react-native-svg";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { RootStackParamList } from "../types/navigation";

const CircularProgress = ({ percentage }: { percentage: number }) => {
  const radius = 40;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (circumference * percentage) / 100;

  return (
    <Svg width={100} height={100}>
      <G rotation="-90" origin="50,50">
        <Circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#D1F0EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#30B7B0"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
        />
      </G>
    </Svg>
  );
};

type DashboardNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Dashboard"
>;
const Dashboard = () => {
  const navigation = useNavigation<DashboardNavigationProp>();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Icon name="leaf" size={30} color="#2E7D32" />
        <Text style={styles.title}>RECiclo</Text>
      </View>

      <View>
        <Icon name="home" size={30} color="#555" />
        <Text style={styles.user}>{/*home*/}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#00BCD4" }]}
        >
          <Icon name="delete" size={24} color="#fff" />
          <Text
            style={styles.buttonText}
            onPress={() => navigation.navigate("SolicitaColeta")}
          >
            Solicitar{"\n"}Coleta
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#C8E6C9" }]}
        >
          <Icon name="clock-outline" size={24} color="#2E7D32" />
          <Text style={[styles.buttonText, { color: "#2E7D32" }]}>
            Ver Status{"\n"}da Solicitação
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#2196F3" }]}
        >
          <Icon name="recycle" size={24} color="#fff" />
          <Text style={styles.buttonText}>
            Informações{"\n"}sobre Reciclagem
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#388E3C" }]}
        >
          <Icon name="sprout" size={24} color="#fff" />
          <Text style={styles.buttonText}>
            Participar do{"\n"}Jardim Comunitário
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statusBox}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>
          Sua coleta foi agendada para hoje às 16h.
        </Text>
      </View>

      <View style={styles.graphContainer}>
        <Text style={styles.graphTitle}>
          Sua Contribuição de Reciclagem Este Mês
        </Text>
        <View style={{ alignItems: "center" }}>
          <CircularProgress percentage={60} />
          <Text style={styles.graphPercentage}>60%</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  user: {
    color: "#555",
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  button: {
    width: 150,
    height: 80,
    borderRadius: 10,
    padding: 10,
    margin: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 5,
    fontSize: 13,
  },
  statusBox: {
    flexDirection: "row",
    backgroundColor: "#E8F5E9",
    borderRadius: 8,
    padding: 10,
    marginVertical: 20,
    alignItems: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    backgroundColor: "green",
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    color: "#333",
  },
  graphContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  graphTitle: {
    fontSize: 14,
    marginBottom: 10,
  },
  graphPercentage: {
    position: "absolute",
    top: 35,
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
});

export default Dashboard;
