// App.tsx ou HomeScreen.tsx
import { RootStackParamList } from "@/types/navigation";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import {
  Button,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Circle, G, Svg } from "react-native-svg";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";


const CircularProgress = ({ percentage }: { percentage: number }) => {
  const radius = 40;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (circumference * Math.max(0, Math.min(100, percentage))) / 100;

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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigation = useNavigation<DashboardNavigationProp>();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Icon name="leaf" size={30} color="#2E7D32" />
        <Text style={styles.title}>RECiclo</Text>
      </View>

      <View style={styles.userInfo}> 
        <Icon name="home" size={30} color="#555" />
        <Text style={styles.user}>Bem-vindo, Usuário!</Text> 
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#00BCD4" }]}
          onPress={() => {
            console.log("Solicitar Coleta");
            navigation.navigate("SolicitaColeta"); 
          }}
        >
          <Icon name="delete" size={24} color="#fff" />
          <Text style={styles.buttonText}>
            Solicitar{"\n"}Coleta
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#C8E6C9' }]}
          onPress={() => setIsModalVisible(true)} // Ao clicar, abre o modal
        >
          <Icon name="clock-outline" size={24} color="#2E7D32" />
          <Text style={[styles.buttonText, { color: '#2E7D32' }]}>
            Ver Status{'\n'}da Solicitação
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#2196F3" }]}
          // Adicione a navegação ou lógica para este botão
          onPress={() => console.log("Informações sobre Reciclagem")}
        >
          <Icon name="recycle" size={24} color="#fff" />
          <Text style={styles.buttonText}>
            Informações{"\n"}sobre Reciclagem
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#388E3C" }]}
          // Adicione a navegação ou lógica para este botão
          onPress={() => console.log("Participar do Jardim Comunitário")}
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setIsModalVisible(false);
          console.log('Modal de status fechado.');
        }}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Status da Solicitação</Text>
            <Text style={styles.modalText}>
              exemploo
            </Text>
            <Button title="Fechar" onPress={() => setIsModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, 
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
  userInfo: { 
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  user: {
    color: "#555",
    marginLeft: 5, 
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10, 
    justifyContent: "center",
    marginBottom: 20,
  },
  button: {
    width: 150,
    height: 80,
    borderRadius: 10,
    padding: 10,
   
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    width: '100%', 
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
    flex: 1, 
  },
  graphContainer: {
    marginTop: 20,
    alignItems: "center",
    width: '100%',
  },
  graphTitle: {
    fontSize: 16, 
    marginBottom: 10,
    fontWeight: 'bold', 
    textAlign: 'center',
  },
  graphPercentage: {
    position: "absolute",
    top: 35,
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 5, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: '80%', 
    maxWidth: 400, 
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 14,
  },
});

export default Dashboard;