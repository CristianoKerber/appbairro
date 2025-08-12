import baseURL from '@/service/api';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import DatePicker from 'react-native-modern-datepicker';

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

export function HistoricoScreen() {
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
                const response = await fetch(`${baseURL}/api/collects/all`);
                if (!response.ok) {
                    throw new Error('Falha ao buscar coletas');
                }
                const data: CollectionRequest[] = await response.json();
                setAllCollections(data);
                setFilteredCollections(data); // Inicialmente mostra todos
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível carregar os dados de histórico.');
                console.error(error);
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
        if (!startDate || !endDate) {
            Alert.alert('Atenção', 'Selecione a data de início e de fim para filtrar.');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        const filtered = allCollections.filter(item => {
            const itemDate = new Date(item.collectDate);
            return itemDate >= start && itemDate <= end;
        });

        setFilteredCollections(filtered);
    };

    const processData = (data: CollectionRequest[]) => {
        // Lógica para contar requisições por bairro
        const bairros = data.reduce<Record<string, number>>((acc, item) => {
            // Supondo que o bairro esteja no formato '..., Bairro X, Cidade - UF'
            const parts = item.user.address.split(',');
            const bairro = parts[1] ? parts[1].trim() : 'Não informado';
            acc[bairro] = (acc[bairro] || 0) + 1;
            return acc;
        }, {});
        
        const bairrosChart = Object.keys(bairros).map((key, index) => {
            const colors = ['#4caf50', '#ffc107', '#00bcd4', '#e74c3c', '#9b59b6'];
            return {
                name: key,
                population: bairros[key],
                color: colors[index % colors.length],
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
            const colors = ['#4caf50', '#ffc107', '#00bcd4', '#e74c3c', '#9b59b6'];
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
        return <ActivityIndicator size="large" color="#4caf50" style={styles.loading} />;
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Análise de Coletas</Text>

            {/* Filtros de Data */}
            <View style={styles.filterContainer}>
                <Text style={styles.filterTitle}>Filtrar por Data</Text>
                <DatePicker
                    options={{
                        backgroundColor: '#090C08',
                        textHeaderColor: '#4CAF50',
                        textDefaultColor: '#FFFFFF',
                        selectedTextColor: '#fff',
                        mainColor: '#4CAF50',
                        textSecondaryColor: '#D6C7A1',
                        borderColor: 'rgba(122, 146, 165, 0.1)',
                    }}
                    mode="calendar"
                    minuteInterval={30}
                    style={{ borderRadius: 10 }}
                    onSelectedChange={(date: string) => {
                        const [year, month, day] = date.split('/');
                        setStartDate(`${year}-${month}-${day}`);
                    }}
                />
                <Text style={styles.dateLabel}>Data de Início: {startDate}</Text>
                <DatePicker
                    options={{
                        backgroundColor: '#090C08',
                        textHeaderColor: '#4CAF50',
                        textDefaultColor: '#FFFFFF',
                        selectedTextColor: '#fff',
                        mainColor: '#4CAF50',
                        textSecondaryColor: '#D6C7A1',
                        borderColor: 'rgba(122, 146, 165, 0.1)',
                    }}
                    mode="calendar"
                    minuteInterval={30}
                    style={{ borderRadius: 10, marginTop: 10 }}
                    onSelectedChange={(date: string) => {
                        const [year, month, day] = date.split('/');
                        setEndDate(`${year}-${month}-${day}`);
                    }}
                />
                <Text style={styles.dateLabel}>Data de Fim: {endDate}</Text>
                <TouchableOpacity onPress={handleFilterByDate} style={styles.filterButton}>
                    <Text style={styles.filterButtonText}>Aplicar Filtro</Text>
                </TouchableOpacity>
            </View>

            {/* Gráfico de Bairros */}
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

            {/* Gráfico de Itens Mais Solicitados */}
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
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    filterContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
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
        color: '#333',
    },
    dateLabel: {
        marginTop: 5,
        marginBottom: 10,
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    filterButton: {
        backgroundColor: '#4caf50',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 15,
    },
    filterButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    chartCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    noDataText: {
        textAlign: 'center',
        color: '#666',
        marginTop: 20,
    },
});