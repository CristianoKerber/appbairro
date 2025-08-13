// UsersScreen.tsx

import UserService from '@/service/UserService';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

interface User {
    id: number;
    username: string;
    email: string;
    address: string;
}

export function UsersScreen() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            
            console.log('Iniciando busca de usuários...');
            
            // A função getALLUsers já retorna os dados, não a resposta completa
            const data: User[] = await UserService.getALLUsers();
            
            console.log('Dados recebidos da API:', data);

            if (!data || data.length === 0) {
                Alert.alert('Aviso', 'Nenhum usuário encontrado.');
                setUsers([]);
                setFilteredUsers([]);
                return;
            }

            setUsers(data);
            setFilteredUsers(data);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar os usuários.');
            console.error('Erro na busca de dados:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleFilter = (text: string) => {
        setSearchTerm(text);
        const filtered = users.filter(user =>
            user.username.toLowerCase().includes(text.toLowerCase()) ||
            user.address.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredUsers(filtered);
    };

    const renderItem = ({ item }: { item: User }) => (
        <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.username}</Text>
            <Text style={styles.cardText}>Email: {item.email}</Text>
            <Text style={styles.cardText}>Endereço: {item.address}</Text>
        </View>
    );

    if (loading) {
        return <ActivityIndicator size="large" color="#4caf50" style={styles.loading} />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Usuários Cadastrados</Text>
            <TextInput
                style={styles.searchInput}
                placeholder="Filtrar por nome ou endereço..."
                value={searchTerm}
                onChangeText={handleFilter}
            />
            <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
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
    searchInput: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 20,
    },
    listContent: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    cardText: {
        fontSize: 14,
        color: '#6c757d',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
    },
});
