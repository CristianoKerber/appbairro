
import CollectService from "@/service/CollectService";
import { RootStackParamList } from "@/types/navigation";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
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
  const progress =
    circumference - (circumference * Math.max(0, Math.min(100, percentage))) / 100;

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
  // Estado dos modais
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);

  // Estado status da coleta
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [collectStatus, setCollectStatus] = useState<string | null>(null);

  // Estado gráfico
  const [loadingGraph, setLoadingGraph] = useState(false);
  const [percentageCollected, setPercentageCollected] = useState(0);

  const navigation = useNavigation<DashboardNavigationProp>();

  // Função para buscar status da coleta
  const fetchCollectStatus = async () => {
    setLoadingStatus(true);
    setCollectStatus(null);
    try {
      const response = await CollectService.getLatestCollectStatus();
      if (response && response.Collected !== undefined) {
        const statusText = response.Collected
          ? "Coleta Confirmada!"
          : "Aguardando Confirmação!";
        setCollectStatus(statusText);
      } else {
        setCollectStatus("Nenhuma coleta encontrada.");
      }
    } catch (error) {
      console.error("Erro ao buscar status da coleta:", error);
      setCollectStatus("Erro ao buscar status. Tente novamente.");
    } finally {
      setLoadingStatus(false);
    }
  };

  const [userName, setUserName] = useState('');

useEffect(() => {
  const fetchUserName = async () => {
    const name = await AsyncStorage.getItem("userName");
    if (name) setUserName(name);
  };

  fetchUserName();
}, []);
  const fetchCollectedItemsForGraph = async () => {
    setLoadingGraph(true);
    try {
      const items = await CollectService.getTotalCollectedInMonth();

      const totalQuantity = items.reduce(
        (sum: number, item: { quantity: number }) => sum + (item.quantity || 0),
        0
      );

      const metaMensal = 100; 
      const percentage = Math.min(100, (totalQuantity / metaMensal) * 100);

      setPercentageCollected(percentage);
    } catch (error) {
      console.error("Erro ao buscar itens coletados para gráfico:", error);
      setPercentageCollected(0);
    } finally {
      setLoadingGraph(false);
    }
  };

  useEffect(() => {
    fetchCollectedItemsForGraph();
  }, []);
  const openStatusModal = () => {
    setIsStatusModalVisible(true);
    fetchCollectStatus();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="leaf" size={30} color="#2E7D32" />
        <Text style={styles.title}>RECiclo</Text>
      </View>

      {/* Informações do usuário */}
      <View style={styles.userInfo}>
        <Icon name="home" size={30} color="#555" />
        <Text style={styles.user}>Bem-vindo, {userName}!</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("Configuracoes")}
          style={{ padding: 10, backgroundColor: "#ffffffff", borderRadius: 5 }}
        >
          <Icon name="cog" size={20} color="#555" />
        </TouchableOpacity>
      </View>


      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#00BCD4" }]}
          onPress={() => navigation.navigate("SolicitaColeta")}
        >
          <Icon name="delete" size={24} color="#fff" />
          <Text style={styles.buttonText}>Solicitar{"\n"}Coleta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#C8E6C9" }]}
          onPress={openStatusModal}
        >
          <Icon name="clock-outline" size={24} color="#2E7D32" />
          <Text style={[styles.buttonText, { color: "#2E7D32" }]}>
            Ver Status{"\n"}da Solicitação
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#2196F3" }]}
          onPress={() => setIsInfoVisible(true)}
        >
          <Icon name="recycle" size={24} color="#fff" />
          <Text style={styles.buttonText}>Informações{"\n"}sobre Reciclagem</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#388E3C" }]}
          onPress={() => console.log("Participar do Jardim Comunitário")}
        >
          <Icon name="sprout" size={24} color="#fff" />
          <Text style={styles.buttonText}>Participar do{"\n"}Jardim Comunitário</Text>
        </TouchableOpacity>
      </View>

      {/* Gráfico circular da contribuição */}
      <View style={styles.graphContainer}>
        <Text style={styles.graphTitle}>Sua Contribuição de Reciclagem Este Mês</Text>
        <View style={{ alignItems: "center" }}>
          {loadingGraph ? (
            <ActivityIndicator size="large" color="#30B7B0" />
          ) : (
            <>
              <CircularProgress percentage={percentageCollected} />
              <Text style={styles.graphPercentage}>
                {percentageCollected.toFixed(0)}%
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Modal - Guia de Reciclagem */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isInfoVisible}
        onRequestClose={() => setIsInfoVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContentEnfeitado}>
            <View style={styles.modalHeader}>
              <Icon name="information-circle-outline" size={30} color="#2196F3" />
              <Text style={styles.modalTitleEnfeitado}>Guia de Reciclagem</Text>
            </View>
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.modalSection}>
                <Icon
                  name="leaf"
                  size={20}
                  color="#388E3C"
                  style={styles.sectionIcon}
                />
                <Text style={styles.sectionTitle}>Por Que Reciclar?</Text>
                <Text style={styles.modalTextEnfeitado}>
                  Reciclar é vital para nosso planeta, pois reduz a quantidade de
                  lixo em aterros, economiza energia, conserva recursos naturais e
                  gera empregos.
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Icon
                  name="package-variant-closed"
                  size={20}
                  color="#00BCD4"
                  style={styles.sectionIcon}
                />
                <Text style={styles.sectionTitle}>Como Diferenciar?</Text>
                <Text style={styles.modalTextEnfeitado}>
                  • <Text style={{fontWeight:'bold'}}>Papel:</Text> Jornais, revistas,
                  caixas de papelão limpas. Evite papel higiênico, fotos.
                  {"\n"}• <Text style={{fontWeight:'bold'}}>Plástico:</Text> Garrafas PET,
                  embalagens de produtos. Evite isopor em algumas regiões.
                  {"\n"}• <Text style={{fontWeight:'bold'}}>Vidro:</Text> Garrafas,
                  potes de alimentos. Evite espelhos, louças, lâmpadas.
                  {"\n"}• <Text style={{fontWeight:'bold'}}>Metal:</Text> Latas de
                  alumínio, panelas velhas. Evite pilhas, baterias, eletrônicos.
                  {"\n"}• <Text style={{fontWeight:'bold'}}>Orgânico:</Text> Restos de
                  alimentos, borra de café. Evite carnes e laticínios em compostagem doméstica.
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Icon
                  name="check-circle-outline"
                  size={20}
                  color="#4CAF50"
                  style={styles.sectionIcon}
                />
                <Text style={styles.sectionTitle}>Modo de Separar</Text>
                <Text style={styles.modalTextEnfeitado}>
                  1. <Text style={{fontWeight:'bold'}}>Separe por tipo:</Text> Tenha
                  lixeiras para cada categoria (papel, plástico, vidro, metal,
                  orgânico).
                  {"\n"}2. <Text style={{fontWeight:'bold'}}>Limpe e Seque:</Text> Lave
                  embalagens plásticas e de vidro. Papel e papelão devem estar secos.
                  {"\n"}3. <Text style={{fontWeight:'bold'}}>Amasse e Compacte:</Text>
                  Reduza o volume de latas e garrafas para economizar espaço.
                  {"\n"}4. <Text style={{fontWeight:'bold'}}>Cuidado com o Vidro:</Text>{" "}
                  Embale vidros quebrados em jornais ou caixas para segurança.
                  {"\n"}5. <Text style={{fontWeight:'bold'}}>Descarte o Orgânico Separadamente:</Text>{" "}
                  Nunca misture com recicláveis secos.
                  {"\n"}6. <Text style={{fontWeight:'bold'}}>Ponto de Coleta:</Text>{" "}
                  Verifique a coleta seletiva da sua região ou leve a um PEV.
                </Text>
              </View>
            </ScrollView>
            <Button title="Entendi" onPress={() => setIsInfoVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Modal - Status da Coleta */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isStatusModalVisible}
        onRequestClose={() => {
          setIsStatusModalVisible(false);
          setCollectStatus(null);
        }}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContentEnfeitado}>
            <View style={styles.modalHeader}>
              <Icon name="information-outline" size={30} color="#C8E6C9" />
              <Text style={[styles.modalTitleEnfeitado, { color: "#2E7D32" }]}>
                Status da Coleta
              </Text>
            </View>
            <View style={{ alignItems: "center", paddingVertical: 20 }}>
              <Icon name="truck-delivery-outline" size={50} color="#30B7B0" />
              {loadingStatus ? (
                <ActivityIndicator size="large" color="#30B7B0" />
              ) : (
                <>
                  <Text style={{ fontSize: 16, marginTop: 10, fontWeight: "bold" }}>
                    Sua coleta está
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#30B7B0",
                      textAlign: "center",
                    }}
                  >
                    {collectStatus}
                  </Text>
                  <Text style={{ marginTop: 10, textAlign: "center", color: "#777" }}>
                    {collectStatus === "Aguardando Confirmação!"
                      ? "Você receberá uma notificação quando a coleta for confirmada."
                      : ""}
                  </Text>
                </>
              )}
            </View>
            <Button title="Fechar" onPress={() => setIsStatusModalVisible(false)} />
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
    flexDirection: "row",
    alignItems: "center",
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
    borderRadius: 15,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    width: '85%',
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
