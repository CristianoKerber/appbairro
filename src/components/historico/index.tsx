import CollectService from '@/service/CollectService';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/Ionicons';

const screenWidth = Dimensions.get("window").width;

interface User {
    address: string;
}

interface CollectionRequest {
    id: number;
    user: User;
    itemName: string;
    quantity: number;
    collectDate: string; // Formato yyyy-MM-dd
}

type HistoricoScreenNavigationProp = NativeStackNavigationProp<any, "HistoricoScreen">;

// Objeto para armazenar as cores geradas para cada bairro
const bairroColors: Record<string, string> = {};

// Função para gerar uma cor hexadecimal aleatória
const generateRandomColor = () => {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return `#${randomColor.padStart(6, '0')}`;
};

export function HistoricoScreen() {
    const navigation = useNavigation<HistoricoScreenNavigationProp>();
    const [allCollections, setAllCollections] = useState<CollectionRequest[]>([]);
    const [filteredCollections, setFilteredCollections] = useState<CollectionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [bairrosData, setBairrosData] = useState<{
        name: string;
        population: number;
        color: string;
        legendFontColor: string;
        legendFontSize: number;
    }[]>([]);
    const [itensData, setItensData] = useState<{
        name: string;
        population: number;
        color: string;
        legendFontColor: string;
        legendFontSize: number;
    }[]>([]);

    useEffect(() => {
        const fetchAllCollections = async () => {
            try {
                setLoading(true);
                const data: CollectionRequest[] = await CollectService.getAllCollects();

                if (!data || data.length === 0) {
                    Alert.alert('Aviso', 'Nenhum dado de histórico de coletas encontrado.');
                    setAllCollections([]);
                    setFilteredCollections([]);
                    return;
                }

                setAllCollections(data);
                setFilteredCollections(data); // Inicialmente mostra todos
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível carregar os dados de histórico.');
                console.error('Erro ao buscar dados:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllCollections();
    }, []);

    useEffect(() => {
        processData(filteredCollections);
    }, [filteredCollections]);

    const handleFilterByDate = () => {
        const dateFormatRegex = /^\d{2}\/\d{2}\/\d{4}$/;

        if (!startDate || !endDate) {
            Alert.alert('Atenção', 'Preencha as duas datas para filtrar.');
            return;
        }

        if (!dateFormatRegex.test(startDate) || !dateFormatRegex.test(endDate)) {
            Alert.alert('Atenção', 'O formato da data deve ser DD/MM/AAAA.');
            return;
        }

        const [startDay, startMonth, startYear] = startDate.split('/').map(Number);
        const [endDay, endMonth, endYear] = endDate.split('/').map(Number);

        const start = new Date(startYear, startMonth - 1, startDay, 0, 0, 0);
        const end = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);

        if (start > end) {
            Alert.alert('Atenção', 'A data de início não pode ser posterior à data de fim.');
            return;
        }

        const filtered = allCollections.filter(item => {
            const [year, month, day] = item.collectDate.split('-').map(Number);
            const itemDate = new Date(year, month - 1, day, 0, 0, 0);

            return itemDate >= start && itemDate <= end;
        });

        if (filtered.length === 0) {
            Alert.alert('Aviso', 'Nenhuma coleta encontrada no período selecionado.');
        }

        setFilteredCollections(filtered);
    };

    const processData = (data: CollectionRequest[]) => {
        // Lógica para contar requisições por bairro
        const bairros = data.reduce<Record<string, number>>((acc, item) => {
            if (item.user?.address) {
                const parts = item.user.address.split(',');
                const bairro = parts[1] ? parts[1].trim() : 'Não informado';
                acc[bairro] = (acc[bairro] || 0) + 1;
            } else {
                const bairro = 'Não informado';
                acc[bairro] = (acc[bairro] || 0) + 1;
            }
            return acc;
        }, {});

        const bairrosChart = Object.keys(bairros).map(key => {
            // Se o bairro já tem uma cor, use-a. Se não, gere uma nova.
            if (!bairroColors[key]) {
                bairroColors[key] = generateRandomColor();
            }

            return {
                name: key,
                population: bairros[key],
                color: bairroColors[key],
                legendFontColor: '#7F7F7F',
                legendFontSize: 12,
            };
        });
        setBairrosData(bairrosChart);

        // Lógica para contar itens mais solicitados
        const itens = data.reduce<Record<string, number>>((acc, item) => {
            acc[item.itemName] = (acc[item.itemName] || 0) + item.quantity;
            return acc;
        }, {});

        const itensChart = Object.keys(itens).map((key, index) => {
            const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6', '#34495e', '#1abc9c'];
            return {
                name: key,
                population: itens[key],
                color: colors[index % colors.length],
                legendFontColor: '#7F7F7F',
                legendFontSize: 12,
            };
        });
        setItensData(itensChart);
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#3498db" style={styles.loading} />;
    }

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Icon name="arrow-back" size={24} color="#34495e" />
            </TouchableOpacity>

            <Text style={styles.title}>Análise de Coletas</Text>

            <View style={styles.filterContainer}>
                <Text style={styles.filterTitle}>Filtrar por Data</Text>
                <View style={styles.dateInputContainer}>
                    <TextInput
                        style={styles.dateInput}
                        onChangeText={setStartDate}
                        value={startDate}
                        placeholder="Data de Início (DD/MM/AAAA)"
                        keyboardType="default"
                        placeholderTextColor="#95a5a6"
                    />
                    <TextInput
                        style={styles.dateInput}
                        onChangeText={setEndDate}
                        value={endDate}
                        placeholder="Data de Fim (DD/MM/AAAA)"
                        keyboardType="default"
                        placeholderTextColor="#95a5a6"
                    />
                </View>
                <TouchableOpacity onPress={handleFilterByDate} style={styles.filterButton}>
                    <Text style={styles.filterButtonText}>Aplicar Filtro</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Coletas por Bairro</Text>
                {bairrosData.length > 0 ? (
                    <PieChart
                        data={bairrosData}
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
                    <Text style={styles.noDataText}>Nenhum dado de coletas por bairro encontrado.</Text>
                )}
            </View>

            <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Itens Mais Solicitados</Text>
                {itensData.length > 0 ? (
                    <PieChart
                        data={itensData}
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
                    <Text style={styles.noDataText}>Nenhum dado de itens mais solicitados.</Text>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
        padding: 20,
    },
    backButton: {
        position: 'absolute',
        top: 30,
        left: 20,
        zIndex: 10,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 25,
        color: '#2c3e50',
        textAlign: 'center',
        paddingTop: 40,
    },
    filterContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    filterTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#34495e',
        textAlign: 'center',
    },
    dateInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    dateInput: {
        backgroundColor: '#f0f2f5',
        padding: 12,
        borderRadius: 10,
        flex: 1,
        marginHorizontal: 5,
        textAlign: 'center',
        color: '#2c3e50',
        fontSize: 14,
    },
    filterButton: {
        backgroundColor: '#3498db',
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 15,
        shadowColor: '#3498db',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    filterButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    chartCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        textAlign: 'center',
        color: '#34495e',
    },
    noDataText: {
        textAlign: 'center',
        color: '#95a5a6',
        marginTop: 20,
        paddingBottom: 20,
    },
});