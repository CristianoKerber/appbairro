// App.tsx ou HomeScreen.tsx

// Importações necessárias
import { RootStackParamList } from "@/types/navigation";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
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


type DashboardNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Dashboard"
>;

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

const Dashboard = () => {
  const [isInfovisible, setIsInfovisible] = useState(false);
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
          onPress={() => setIsModalVisible(true)} 
        >
          <Icon name="clock-outline" size={24} color="#2E7D32" />
          <Text style={[styles.buttonText, { color: '#2E7D32' }]}>
            Ver Status{'\n'}da Solicitação
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#2196F3" }]}
          onPress={() => setIsInfovisible(true)} 
        >
          <Icon name="recycle" size={24} color="#fff" />
          <Text style={styles.buttonText}>
            Informações{"\n"}sobre Reciclagem
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#388E3C" }]}
          onPress={() => console.log("Participar do Jardim Comunitário")}
        >
          <Icon name="sprout" size={24} color="#fff" />
          <Text style={styles.buttonText}>
            Participar do{"\n"}Jardim Comunitário
          </Text>
        </TouchableOpacity>
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
        visible={isInfovisible}
        onRequestClose={() => {
          setIsInfovisible(false);
          console.log('Modal de informações fechado.');
        }}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContentEnfeitado}>
            <View style={styles.modalHeader}>
              <Icon name="information-circle-outline" size={30} color="#2196F3" />
              <Text style={styles.modalTitleEnfeitado}>Guia de Reciclagem</Text>
            </View>
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.modalSection}>
                <Icon name="leaf" size={20} color="#388E3C" style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Por Que Reciclar?</Text>
                <Text style={styles.modalTextEnfeitado}>
                  Reciclar é vital para nosso planeta, pois reduz a quantidade de lixo em aterros,
                  economiza energia, conserva recursos naturais e gera empregos.
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Icon name="package-variant-closed" size={20} color="#00BCD4" style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Como Diferenciar?</Text>
                <Text style={styles.modalTextEnfeitado}>
                  • **Papel:** Jornais, revistas, caixas de papelão limpas. Evite papel higiênico, fotos.
                  {"\n"}
                  • **Plástico:** Garrafas PET, embalagens de produtos. Evite isopor em algumas regiões.
                  {"\n"}
                  • **Vidro:** Garrafas, potes de alimentos. Evite espelhos, louças, lâmpadas.
                  {"\n"}
                  • **Metal:** Latas de alumínio, panelas velhas. Evite pilhas, baterias, eletrônicos.
                  {"\n"}
                  • **Orgânico:** Restos de alimentos, borra de café. Evite carnes e laticínios em compostagem doméstica.
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Icon name="check-circle-outline" size={20} color="#4CAF50" style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Modo de Separar</Text>
                <Text style={styles.modalTextEnfeitado}>
                  1. **Separe por tipo:** Tenha lixeiras para cada categoria (papel, plástico, vidro, metal, orgânico).
                  {"\n"}
                  2. **Limpe e Seque:** Lave embalagens plásticas e de vidro. Papel e papelão devem estar secos.
                  {"\n"}
                  3. **Amasse e Compacte:** Reduza o volume de latas e garrafas para economizar espaço.
                  {"\n"}
                  4. **Cuidado com o Vidro:** Embale vidros quebrados em jornais ou caixas para segurança.
                  {"\n"}
                  5. **Descarte o Orgânico Separadamente:** Nunca misture com recicláveis secos.
                  {"\n"}
                  6. **Ponto de Coleta:** Verifique a coleta seletiva da sua região ou leve a um PEV.
                </Text>
              </View>
            </ScrollView>
            <Button title="Entendi" onPress={() => setIsInfovisible(false)} />
          </View>
        </View>
      </Modal>

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
          <View style={styles.modalContentEnfeitado}>
            <View style={styles.modalHeader}>
              <Icon name="information-outline" size={30} color="#C8E6C9" />
              <Text style={[styles.modalTitleEnfeitado, { color: '#2E7D32' }]}>Status da Coleta</Text>
            </View>
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Icon name="truck-delivery-outline" size={50} color="#30B7B0" />
              <Text style={[styles.modalTextEnfeitado, { fontSize: 16, marginTop: 10, fontWeight: 'bold' }]}>
                Sua coleta está
              </Text>
              <Text style={[styles.modalTextEnfeitado, { fontSize: 18, fontWeight: 'bold', color: '#30B7B0' }]}>
                Aguardando Confirmação!
              </Text>
              <Text style={[styles.modalTextEnfeitado, { marginTop: 10, textAlign: 'center', color: '#777' }]}>
                Você receberá uma notificação quando a coleta for confirmada.
              </Text>
            </View>
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
  modalContentEnfeitado: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15, // Cantos mais arredondados
    alignItems: 'center',
    elevation: 10, // Sombra mais forte para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    width: '85%', // Largura um pouco maior
    maxWidth: 450,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitleEnfeitado: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  modalScrollView: {
    maxHeight: 300,
    marginBottom: 15,
    width: '100%',
  },
  modalSection: {
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  sectionIcon: {
    marginRight: 5,
  },
  modalTextEnfeitado: {
    fontSize: 14,
    color: '#555',
    textAlign: 'left', 
  },
});

export default Dashboard;