import CollectService from '@/service/CollectService';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface User {
    id: number;
    username: string;
    address: string;
}

interface CollectionRequest {
    id: number;
    user: User | null;
    collectDate: string;
    itemName: string;
    itemDescription: string;
    quantity: number;
    collected: string; // 'true' ou 'false'
}

type CollectionsScreenNavigationProp = NativeStackNavigationProp<any, "CollectionsScreen">;

export function CollectionsScreen() {
    const navigation = useNavigation<CollectionsScreenNavigationProp>();
    const [allCollections, setAllCollections] = useState<CollectionRequest[]>([]);
    const [filteredCollections, setFilteredCollections] = useState<CollectionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const fetchCollections = async () => {
        try {
            setLoading(true);
            const data: CollectionRequest[] = await CollectService.getAllCollects();
            setAllCollections(data);
            applyFilter(data, filter);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar as coletas.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCollections();
    }, []);

    const applyFilter = (collectionsToFilter: CollectionRequest[], selectedFilter: string) => {
        if (selectedFilter === 'all') {
            setFilteredCollections(collectionsToFilter);
        } else if (selectedFilter === 'pending') {
            setFilteredCollections(collectionsToFilter.filter(item => item.collected === 'false'));
        } else if (selectedFilter === 'collected') {
            setFilteredCollections(collectionsToFilter.filter(item => item.collected === 'true'));
        }
    };

    useEffect(() => {
        applyFilter(allCollections, filter);
    }, [filter, allCollections]);

    const handleToggleCollected = async (item: CollectionRequest) => {
        try {
            const newStatus = item.collected === 'true' ? 'false' : 'true';
            const updatedItem = { ...item, collected: newStatus };

            const updatedAllCollections = allCollections.map(c =>
                c.id === item.id ? updatedItem : c
            );
            setAllCollections(updatedAllCollections);

            await CollectService.updateCollect(item.id, { ...updatedItem, collected: newStatus === 'true' });

        } catch (error) {
            setAllCollections(allCollections);
            Alert.alert('Erro', 'Não foi possível atualizar o status da coleta.');
            console.error(error);
        }
    };

    const renderItem = ({ item }: { item: CollectionRequest }) => (
        <View style={[styles.card, item.collected === 'true' ? styles.cardCollected : styles.cardPending]}>
            <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>Usuário: {item.user ? item.user.username : 'Não encontrado'}</Text>
                <Text style={styles.cardText}>Tipo: {item.itemName}</Text>
                <Text style={styles.cardText}>Descrição: {item.itemDescription}</Text>
                <Text style={styles.cardText}>Endereço: {item.user ? item.user.address : 'Não encontrado'}</Text>
            </View>
            <TouchableOpacity
                style={[
                    styles.collectButton,
                    item.collected === 'true' ? styles.collectButtonCollected : styles.collectButtonPending
                ]}
                onPress={() => handleToggleCollected(item)}
            >
                <Text style={styles.collectButtonText}>
                    {item.collected === 'true' ? 'Desmarcar' : 'Marcar como Coletado'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return <ActivityIndicator size="large" color="#2ecc71" style={styles.loading} />;
    }

    return (
        <View style={styles.container}>
            {/* Botão de voltar flutuante */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Icon name="arrow-back" size={24} color="#2c3e50" />
            </TouchableOpacity>

            <Text style={styles.title}>Coletas Solicitadas</Text>

            <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Filtrar:</Text>
                <Picker
                    selectedValue={filter}
                    style={styles.picker}
                    onValueChange={(itemValue: string) => setFilter(itemValue)}
                >
                    <Picker.Item label="Todas" value="all" />
                    <Picker.Item label="Pendentes" value="pending" />
                    <Picker.Item label="Coletadas" value="collected" />
                </Picker>
            </View>

            <FlatList
                data={filteredCollections}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Nenhuma coleta encontrada com este filtro.</Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
        padding: 20,
        paddingTop: 60,
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
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 25,
        color: '#2c3e50',
        textAlign: 'center',
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    filterLabel: {
        fontSize: 16,
        marginRight: 10,
        color: '#7f8c8d',
    },
    picker: {
        flex: 1,
        height: 50,
        color: '#2c3e50',
    },
    listContent: {
        paddingBottom: 20,
    },
    card: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        borderLeftWidth: 5,
    },
    cardPending: {
        borderLeftColor: '#f39c12',
    },
    cardCollected: {
        borderLeftColor: '#2ecc71',
    },
    cardInfo: {
        flex: 1,
        marginBottom: 15,
    },
    cardTitle: {
        fontSize: 19,
        fontWeight: '600',
        color: '#34495e',
        marginBottom: 5,
    },
    cardText: {
        fontSize: 14,
        color: '#7f8c8d',
        lineHeight: 20,
        marginBottom: 3,
    },
    collectButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4,
    },
    collectButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    collectButtonPending: {
        backgroundColor: '#3498db',
    },
    collectButtonCollected: {
        backgroundColor: '#e74c3c',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f7fa',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
        color: '#95a5a6',
    },
});