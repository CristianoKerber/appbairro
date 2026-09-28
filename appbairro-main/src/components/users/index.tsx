// UsersScreen.tsx

import UserService from '@/service/UserService';
import { RootStackParamList } from "@/types/navigation";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Importe os ícones

interface User {
    id: number;
    username: string;
    email: string;
    address: string;
}

type UserScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "CadastroScreen" // Ou qualquer tela para a qual você deseja voltar
>;

export function UsersScreen() {
    const navigation = useNavigation<UserScreenNavigationProp>();
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            
            console.log('Iniciando busca de usuários...');
            
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
            user.address.toLowerCase().includes(text.toLowerCase()) ||
            user.email.toLowerCase().includes(text.toLowerCase()) // Adicione filtro por email
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
        return <ActivityIndicator size="large" color="#007AFF" style={styles.loading} />;
    }

    return (
        <View style={styles.container}>
            {/* Botão de voltar flutuante */}
            <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => navigation.goBack()}
            >
                <Icon name="arrow-back" size={24} color="#007AFF" /> 
            </TouchableOpacity>

            <Text style={styles.title}>Usuários Cadastrados</Text>
            
            <View style={styles.searchInputContainer}>
                <Icon name="search" size={20} color="#888" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Filtrar por nome, endereço ou email..."
                    placeholderTextColor="#888"
                    value={searchTerm}
                    onChangeText={handleFilter}
                />
            </View>

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
        backgroundColor: '#f5f7fa', // Fundo mais claro e suave
        paddingTop: 60, // Aumenta o padding para o título e botões superiores
    },
    backButton: {
        position: 'absolute', // Torna o botão flutuante
        top: 30, // Posição superior
        left: 20, // Posição à esquerda
        zIndex: 10, // Garante que fique acima de outros elementos
        backgroundColor: '#fff',
        borderRadius: 20, // Borda arredondada
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 26, // Ligeiramente menor para equilibrar com o botão
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#2c3e50',
        textAlign: 'center',
    },
    searchInputContainer: {
        flexDirection: 'row', // Para alinhar o ícone e o input
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingHorizontal: 15,
        borderRadius: 25,
        marginHorizontal: 20, // Mantém o espaçamento lateral
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1, // Faz o input ocupar o espaço restante
        height: 48, // Altura fixa para o input
        fontSize: 16,
        color: '#333',
    },
    listContent: {
        paddingHorizontal: 20, // Adiciona padding horizontal à lista
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 12, // Bordas um pouco menos arredondadas
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    cardTitle: {
        fontSize: 19,
        fontWeight: '600',
        color: '#34495e', // Cor de texto um pouco mais escura
        marginBottom: 4,
    },
    cardText: {
        fontSize: 14,
        color: '#7f8c8d',
        lineHeight: 20, // Espaçamento entre as linhas
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f7fa',
    },
});