// AdminDashboard.tsx

import baseURL from '@/service/api';
import { RootStackParamList } from '@/types/navigation';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
 
type AdminDashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, "AdminDashboard">;

const screenWidth = Dimensions.get("window").width;

interface CollectItem {
    id: number;
    itemName: string;
    quantity: number;
}

export function AdminDashboard() {
    const navigation = useNavigation<AdminDashboardNavigationProp>();
    const [chartData, setChartData] = useState<{
        name: string;
        population: number;
        color: string;
        legendFontColor: string;
        legendFontSize: number;
    }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChartData = async () => {
            try {
                console.log(`Buscando dados em: ${baseURL}/api/collects/all`); // Log para verificar a URL
                const response = await fetch(`${baseURL}/api/collects/all`);
                
                if (!response.ok) {
                    throw new Error('Falha ao buscar dados de coletas');
                }
                
                const data: CollectItem[] = await response.json();
                console.log('Dados recebidos da API:', data); // Log para verificar os dados

                // Lógica para processar os dados e formatar para o gráfico de pizza
                const itemCounts = data.reduce((acc: { [key: string]: number }, item) => {
                    acc[item.itemName] = (acc[item.itemName] || 0) + item.quantity;
                    return acc;
                }, {});

                console.log('Contagem de itens para o gráfico:', itemCounts); // Log para verificar a contagem

                const formattedData = Object.keys(itemCounts).map((key, index) => {
                    const colors = ['#4caf50', '#ffc107', '#00bcd4', '#e74c3c', '#9b59b6'];
                    return {
                        name: key,
                        population: itemCounts[key],
                        color: colors[index % colors.length],
                        legendFontColor: '#7F7F7F',
                        legendFontSize: 15,
                    };
                });
                
                setChartData(formattedData);
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível carregar os dados do gráfico.');
                console.error('Erro na busca de dados:', error); // Log do erro
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Reciclo Admin</Text>

            <View style={styles.content}>
                <View style={styles.menuContainer}>
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
                    ) : (
                        chartData.length > 0 ? (
                            <PieChart
                                data={chartData}
                                width={screenWidth - 40}
                                height={220}
                                chartConfig={{
                                    backgroundColor: '#fff',
                                    backgroundGradientFrom: '#fff',
                                    backgroundGradientTo: '#fff',
                                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                }}
                                accessor="population"
                                backgroundColor="transparent"
                                paddingLeft="15"
                                absolute
                            />
                        ) : (
                            <Text>Nenhum dado de coleta disponível.</Text>
                        )
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    header: {
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    content: {
        flexDirection: 'row',
        flex: 1,
    },
    menuContainer: {
        width: '30%',
        marginRight: 20,
    },
    menuButton: {
        backgroundColor: '#4caf50',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    chartContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});
