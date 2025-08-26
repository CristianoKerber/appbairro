import CollectService from "@/service/CollectService";
import { RootStackParamList } from "@/types/navigation";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PieChart } from "react-native-chart-kit";

// Define o tipo de navegação para a tela AdminDashboard
type AdminDashboardNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "AdminDashboard"
>;

// Obtém a largura da tela para ajustar o layout de forma responsiva
const screenWidth = Dimensions.get("window").width;
const isMobile = screenWidth < 768;

// Interface para o item de coleta
// A API retorna um formato ligeiramente diferente agora
interface MonthlyDistributionItem {
  itemName: string;
  totalQuantity: number;
}

// O componente principal do Dashboard do Administrador
export function AdminDashboard() {
  const navigation = useNavigation<AdminDashboardNavigationProp>();
  // Estado para os dados do gráfico
  const [chartData, setChartData] = useState<
    {
      name: string;
      population: number;
      color: string;
      legendFontColor: string;
      legendFontSize: number;
    }[]
  >([]);
  // Estado para controlar o carregamento dos dados
  const [loading, setLoading] = useState(true);
  // Estado para o tratamento de erros (substitui o Alert.alert)
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await CollectService.getAllCollects();

        if (!response.ok) {
          throw new Error(`Falha na busca de dados: ${response.statusText}`);
        }

        const data: MonthlyDistributionItem[] = await response.json();
        console.log("Dados recebidos da API:", data);

        // Gera uma paleta de cores dinamicamente para o gráfico
        const generateColor = () =>
          `#${Math.floor(Math.random() * 16777215).toString(16)}`;

        const formattedData = data.map((item) => {
          return {
            name: item.itemName,
            population: item.totalQuantity,
            color: generateColor(), // Cor gerada dinamicamente
            legendFontColor: "#7F7F7F",
            legendFontSize: 15,
          };
        });

        setChartData(formattedData);
      } catch (error) {
        // Tratamento de erro aprimorado
        const message =
          error instanceof Error ? error.message : "Erro desconhecido.";
        setErrorMessage(
          `Não foi possível carregar os dados do gráfico. Detalhes: ${message}`
        );
        console.error("Erro na busca de dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []); // O array de dependências vazio garante que a função é executada apenas uma vez

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Reciclo Admin</Text>

      {/* Exibe mensagem de erro se houver uma */}
      {errorMessage ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity
            onPress={() => setErrorMessage("")}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Layout responsivo para telas maiores e menores */}
      <View style={isMobile ? styles.contentMobile : styles.contentDesktop}>
        <View
          style={
            isMobile ? styles.menuContainerMobile : styles.menuContainerDesktop
          }
        >
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate("CollectionsScreen")}
          >
            <Text style={styles.buttonText}>Coletas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate("UsersScreen")}
          >
            <Text style={styles.buttonText}>Usuários</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate("HistoricoScreen")}
          >
            <Text style={styles.buttonText}>Histórico</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Resíduos Coletados</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#4caf50" />
          ) : chartData.length > 0 ? (
            <PieChart
              data={chartData}
              width={isMobile ? screenWidth - 40 : screenWidth * 0.6 - 40}
              height={220}
              chartConfig={{
                backgroundColor: "#fff",
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                decimalPlaces: 0,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          ) : (
            <Text>Nenhum dado de coleta disponível.</Text>
          )}
        </View>
      </View>
    </View>
  );
}

// Estilos do componente
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    padding: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#2c3e50",
  },
  // Estilos para layout desktop (side-by-side)
  contentDesktop: {
    flexDirection: "row",
    flex: 1,
  },
  // Estilos para layout mobile (column-based)
  contentMobile: {
    flexDirection: "column",
    flex: 1,
  },
  // Estilos para menu desktop
  menuContainerDesktop: {
    width: "30%",
    marginRight: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // Estilos para menu mobile
  menuContainerMobile: {
    width: "100%",
    marginBottom: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuButton: {
    backgroundColor: "#2ecc71",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  chartContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#34495e",
  },
  errorBox: {
    backgroundColor: "#e74c3c",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
  },
  errorText: {
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 5,
  },
  closeButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 12,
  },
});
