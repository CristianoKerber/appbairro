import CollectService from "@/service/CollectService";
import { RootStackParamList } from "@/types/navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PieChart } from "react-native-chart-kit";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type DashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, "Dashboard">;

const screenWidth = Dimensions.get("window").width;

interface PieChartDataItem {
    name: string;
    population: number;
    color: string;
    legendFontColor: string;
    legendFontSize: number;
}

const Dashboard = () => {
    const navigation = useNavigation<DashboardNavigationProp>();

    // Estados
    const [isInfoVisible, setIsInfoVisible] = useState(false);
    const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [collectStatus, setCollectStatus] = useState<string | null>(null);
    const [loadingGraph, setLoadingGraph] = useState(false);
    const [wasteTypeData, setWasteTypeData] = useState<PieChartDataItem[]>([]);
    const [userName, setUserName] = useState("");
    const [userId, setUserId] = useState<string | null>(null);

    // Lógica para carregar o nome do usuário e os dados do gráfico
    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                const id = await AsyncStorage.getItem("userId");
                const name = await AsyncStorage.getItem("userName");

                if (id) {
                    setUserId(id);
                    setUserName(name || "Usuário"); // Garante que o nome não seja nulo
                    fetchWasteTypeDistribution(id);
                }
            };
            loadData();
        }, [])
    );

    // Função para buscar status da coleta
    const fetchCollectStatus = async () => {
        setLoadingStatus(true);
        setCollectStatus(null);
        try {
            const response = await CollectService.getLatestCollectStatus();
            if (response && response.collected !== undefined) {
                const statusText = response.collected
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

    // Esta função agora usa o userId para filtrar os dados (se o serviço suportar)
    const fetchWasteTypeDistribution = async (id: string) => {
        setLoadingGraph(true);
        try {
            const items = await CollectService.getTotalCollectedInMonth(); // Passando o ID do usuário

            const colors = [
                "#3498db", // Azul
                "#2ecc71", // Verde
                "#f1c40f", // Amarelo
                "#e74c3c", // Vermelho
                "#9b59b6", // Roxo
                "#1abc9c", // Ciano
            ];
            const chartData: PieChartDataItem[] = items.map((item, index) => ({
                name: item.itemName,
                population: item.totalQuantity,
                color: colors[index % colors.length],
                legendFontColor: "#7F7F7F",
                legendFontSize: 12,
            }));

            setWasteTypeData(chartData);
        } catch (error) {
            console.error("Erro ao buscar itens coletados para gráfico:", error);
            setWasteTypeData([]);
        } finally {
            setLoadingGraph(false);
        }
    };

    const openStatusModal = () => {
        setIsStatusModalVisible(true);
        fetchCollectStatus();
    };

    const chartConfig = {
        backgroundColor: "#f5f7fa",
        backgroundGradientFrom: "#f5f7fa",
        backgroundGradientTo: "#f5f7fa",
        color: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
        // Adicione esta linha para garantir que o gráfico se ajuste corretamente
        paddingRight: 0,
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Icon name="leaf" size={40} color="#2E7D32" />
                <Text style={styles.title}>RECiclo</Text>
            </View>

            {/* Informações do usuário */}
            <View style={styles.userInfo}>
                <Text style={styles.user}>Bem-vindo, {userName}!</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Configuracoes")}
                    style={styles.settingsButton}
                >
                    <Icon name="cog" size={24} color="#34495e" />
                </TouchableOpacity>
            </View>

            {/* Container de botões */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.collectButton]}
                    onPress={() => navigation.navigate("SolicitaColeta")}
                >
                    <Icon name="truck-plus" size={30} color="#fff" />
                    <Text style={styles.buttonText}>
                        Solicitar{"\n"}Coleta
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.statusButton]}
                    onPress={openStatusModal}
                >
                    <Icon name="truck-fast" size={30} color="#fff" />
                    <Text style={styles.buttonText}>
                        Ver Status{"\n"}da Coleta
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.infoButton]}
                    onPress={() => setIsInfoVisible(true)}
                >
                    <Icon name="information-outline" size={30} color="#fff" />
                    <Text style={styles.buttonText}>
                        Guia de{"\n"}Reciclagem
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Gráfico de pizza com a distribuição dos resíduos */}
            <View style={styles.graphCard}>
                <Text style={styles.graphTitle}>
                    Resíduos Coletados (Últimos 30 dias)
                </Text>
                {loadingGraph ? (
                    <ActivityIndicator size="large" color="#2ecc71" style={styles.loadingGraph} />
                ) : wasteTypeData.length > 0 ? (
                    <PieChart
                        data={wasteTypeData}
                        width={screenWidth - 40}
                        height={220}
                        chartConfig={chartConfig}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        absolute
                    />
                ) : (
                    <Text style={styles.noDataText}>
                        Nenhum dado de coleta disponível no momento.
                    </Text>
                )}
            </View>

            {/* Modal - Guia de Reciclagem */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isInfoVisible}
                onRequestClose={() => setIsInfoVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Guia de Reciclagem</Text>
                            <TouchableOpacity onPress={() => setIsInfoVisible(false)}>
                                <Icon name="close-circle-outline" size={24} color="#e74c3c" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalScrollView}>
                            <View style={styles.modalSection}>
                                <Text style={styles.sectionTitle}>
                                    <Icon name="lightbulb-on-outline" size={18} color="#f1c40f" /> Por que Reciclar?
                                </Text>
                                <Text style={styles.modalText}>
                                    Reciclar é essencial para o meio ambiente! Ajuda a diminuir a quantidade de lixo em aterros sanitários, economiza energia e água, e preserva os recursos naturais do nosso planeta.
                                </Text>
                            </View>
                            <View style={styles.modalSection}>
                                <Text style={styles.sectionTitle}>
                                    <Icon name="bottle-tonic-plus-outline" size={18} color="#3498db" /> Como Separar?
                                </Text>
                                <Text style={styles.modalText}>
                                    - **Plástico**: Garrafas, tampinhas, embalagens de produtos de limpeza.
                                    {"\n"}- **Metal**: Latas de alumínio e aço, tampas de potes, arames.
                                    {"\n"}- **Papel**: Jornais, revistas, caixas de papelão.
                                    {"\n"}- **Vidro**: Garrafas de bebidas, potes de alimentos.
                                </Text>
                            </View>
                            <View style={styles.modalSection}>
                                <Text style={styles.sectionTitle}>
                                    <Icon name="check-circle-outline" size={18} color="#2ecc71" /> Dicas Importantes
                                </Text>
                                <Text style={styles.modalText}>
                                    - Limpe e seque as embalagens antes de descartar.
                                    {"\n"}- Amasse garrafas plásticas e latas para economizar espaço.
                                    {"\n"}- Separe os resíduos por tipo em sacos ou recipientes diferentes.
                                </Text>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Modal - Status da Coleta */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isStatusModalVisible}
                onRequestClose={() => setIsStatusModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Status da Coleta</Text>
                            <TouchableOpacity onPress={() => setIsStatusModalVisible(false)}>
                                <Icon name="close-circle-outline" size={24} color="#e74c3c" />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.statusModalBody}>
                            <Icon name="truck-fast-outline" size={50} color="#3498db" />
                            {loadingStatus ? (
                                <ActivityIndicator size="large" color="#3498db" style={{ marginTop: 20 }} />
                            ) : (
                                <>
                                    <Text style={styles.statusText}>Sua coleta mais recente:</Text>
                                    <Text style={styles.statusMessage}>{collectStatus}</Text>
                                    {collectStatus === "Aguardando Confirmação!" && (
                                        <Text style={styles.statusSubtitle}>Você receberá uma notificação quando a coleta for confirmada.</Text>
                                    )}
                                </>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingTop: 50,
        paddingHorizontal: 20,
        backgroundColor: "#f5f7fa",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#2ecc71",
        marginLeft: 10,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        paddingHorizontal: 10,
        marginBottom: 25,
    },
    user: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#2c3e50",
    },
    settingsButton: {
        padding: 8,
        backgroundColor: "#ecf0f1",
        borderRadius: 20,
    },
    buttonContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 20,
    },
    button: {
        width: "48%",
        height: 120,
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 15,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    collectButton: { backgroundColor: "#3498db" },
    statusButton: { backgroundColor: "#2ecc71" },
    infoButton: { backgroundColor: "#9b59b6" },
    historyButton: { backgroundColor: "#f1c40f" },
    buttonText: {
        color: "#fff",
        textAlign: "center",
        marginTop: 10,
        fontSize: 14,
        fontWeight: "bold",
    },
    graphCard: {
        backgroundColor: "#fff",
        borderRadius: 15,
        padding: 15,
        alignItems: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    graphTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#34495e",
        textAlign: "center",
    },
    loadingGraph: {
        padding: 20,
    },
    noDataText: {
        textAlign: "center",
        color: "#95a5a6",
        marginTop: 20,
    },
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: 25,
        borderRadius: 15,
        width: "90%",
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#ecf0f1",
        paddingBottom: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#2c3e50",
    },
    modalScrollView: {
        maxHeight: Dimensions.get("window").height * 0.5,
    },
    modalSection: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
        color: "#34495e",
    },
    modalText: {
        fontSize: 14,
        color: "#555",
        lineHeight: 20,
    },
    statusModalBody: {
        alignItems: "center",
        paddingVertical: 20,
    },
    statusText: {
        fontSize: 16,
        marginTop: 15,
        fontWeight: "bold",
        color: "#34495e",
    },
    statusMessage: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#2ecc71",
        textAlign: "center",
        marginTop: 5,
    },
    statusSubtitle: {
        marginTop: 10,
        textAlign: "center",
        color: "#7f8c8d",
        fontSize: 12,
        fontStyle: "italic",
    },
});

export default Dashboard;