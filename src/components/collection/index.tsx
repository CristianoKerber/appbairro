// CollectionsScreen.tsx
import CollectService from '@/service/CollectService';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

export function CollectionsScreen() {
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
            
            // Otimização: atualiza a lista localmente para uma resposta mais rápida
            const updatedAllCollections = allCollections.map(c => 
                c.id === item.id ? updatedItem : c
            );
            setAllCollections(updatedAllCollections);
            
            // Converte collected para boolean antes de enviar para o serviço
            await CollectService.updateCollect(item.id, { ...updatedItem, collected: newStatus === 'true' });
            
            // Removido o fetchCollections completo, pois a lista local já foi atualizada
        } catch (error) {
            // Se houver erro, reverta a alteração local
            setAllCollections(allCollections); 
            Alert.alert('Erro', 'Não foi possível atualizar o status da coleta.');
            console.error(error);
        }
    };

    const renderItem = ({ item }: { item: CollectionRequest }) => (
        <View style={[styles.card, item.collected === 'true' ? styles.cardCollected : styles.cardPending]}>
            <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>Usuário: {item.user ? item.user.username : 'Usuário não encontrado'}</Text>
                <Text style={styles.cardText}>Tipo de Resíduo: {item.itemName}</Text>
                <Text style={styles.cardText}>Descrição: {item.itemDescription}</Text>
                <Text style={styles.cardText}>Endereço: {item.user ? item.user.address : 'Endereço não encontrado'}</Text>
            </View>
            <TouchableOpacity
                style={styles.collectButton}
                onPress={() => handleToggleCollected(item)}
            >
                <Text style={styles.collectButtonText}>
                    {item.collected === 'true' ? 'Desmarcar' : 'Marcar como Coletado'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return <ActivityIndicator size="large" color="#4caf50" style={styles.loading} />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Coletas Solicitadas</Text>

            <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Filtrar por Status:</Text>
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
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: 10,
        elevation: 2,
    },
    filterLabel: {
        fontSize: 16,
        marginRight: 10,
        color: '#333',
    },
    picker: {
        flex: 1,
        height: 40,
    },
    listContent: {
        paddingBottom: 20,
    },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardPending: {
        backgroundColor: '#f8d7da',
        borderColor: '#dc3545',
        borderWidth: 1,
    },
    cardCollected: {
        backgroundColor: '#d4edda',
        borderColor: '#28a745',
        borderWidth: 1,
    },
    cardInfo: {
        flex: 1,
        marginRight: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    cardText: {
        fontSize: 14,
        color: '#6c757d',
    },
    collectButton: {
        backgroundColor: '#4caf50',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    collectButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#666',
    },
});