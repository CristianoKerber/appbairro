import CollectService from '@/service/CollectService';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

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

    // Efeito para buscar os dados do backend
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
                Alert.alert('Erro', 'Não foi possível carregar os dados de histórico. Verifique o servidor e o serviço de coletas.');
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

    // Criar datas no fuso local
    const start = new Date(startYear, startMonth - 1, startDay, 0, 0, 0);
    const end = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);

    if (start > end) {
        Alert.alert('Atenção', 'A data de início não pode ser posterior à data de fim.');
        return;
    }

    const filtered = allCollections.filter(item => {
        // Converte 'YYYY-MM-DD' para data local (sem fuso UTC)
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
                // Tenta extrair o bairro como a segunda parte do endereço, após a primeira vírgula.
                // Isso assume um formato "Rua, Bairro, Cidade".
                const parts = item.user.address.split(',');
                const bairro = parts[1] ? parts[1].trim() : 'Não informado';
                acc[bairro] = (acc[bairro] || 0) + 1;
                console.log(`Endereço: ${item.user.address}, Bairro extraído: ${bairro}`);
            } else {
                const bairro = 'Não informado';
                acc[bairro] = (acc[bairro] || 0) + 1;
            }
            return acc;
        }, {});
        
        const bairrosChart = Object.keys(bairros).map((key, index) => {
            const colors = ['#4caf50', '#ffc107', '#00bcd4', '#e74c3c', '#9b59b6', '#3498db', '#2ecc71'];
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
            const colors = ['#4caf50', '#ffc107', '#00bcd4', '#e74c3c', '#9b59b6', '#3498db', '#2ecc71'];
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
                <View style={styles.dateInputContainer}>
                    <TextInput
                        style={styles.dateInput}
                        onChangeText={text => {
                            setStartDate(text);
                            // Aqui pode ser interessante resetar o filtro se uma das datas for alterada
                            // setFilteredCollections(allCollections);
                        }}
                        value={startDate}
                        placeholder="Data de Início (DD/MM/AAAA)"
                        keyboardType="default"
                        placeholderTextColor="#999"
                    />
                    <TextInput
                        style={styles.dateInput}
                        onChangeText={text => {
                            setEndDate(text);
                            // Aqui também, para manter a consistência
                            // setFilteredCollections(allCollections);
                        }}
                        value={endDate}
                        placeholder="Data de Fim (DD/MM/AAAA)"
                        keyboardType="default"
                        placeholderTextColor="#999"
                    />
                </View>
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
        textAlign: 'center',
    },
    dateInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    dateInput: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
        textAlign: 'center',
        color: '#333',
    },
    dateButton: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    dateButtonText: {
        color: '#333',
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
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
    },
    closeButton: {
        backgroundColor: '#e74c3c',
        padding: 10,
        borderRadius: 8,
        marginTop: 15,
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
