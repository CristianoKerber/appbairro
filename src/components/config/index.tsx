// Configuracao.tsx

import { updateUser } from '@/service/UserService';
import { RootStackParamList } from '@/types/navigation';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

type ConfiguracaoNavigationProp = NativeStackNavigationProp<RootStackParamList, "Configuracoes">;

interface CepData {
    logradouro: string;
    bairro: string;
    localidade: string;
    uf: string;
    erro?: boolean;
}

export function Configuracao() {
    const navigator = useNavigation<ConfiguracaoNavigationProp>();

    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userCep, setUserCep] = useState('');
    const [telefone, setTelefone] = useState('');
    const [password, setPassword] = useState('');

    const [logradouro, setLogradouro] = useState('');
    const [bairro, setBairro] = useState('');
    const [localidade, setLocalidade] = useState('');
    const [uf, setUf] = useState('');
    const [numero, setNumero] = useState('');

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                setLoading(true);
                const userData = await AsyncStorage.getItem('user');
                if (userData) {
                    const user = JSON.parse(userData);
                    setUserName(user.username || '');
                    setUserEmail(user.email || '');
                    setTelefone(user.phoneNumber || '');
                    setPassword(user.password || '');
                    
                    if (user.address) {
                        const parts = user.address.split(',');
                        if (parts.length >= 4) {
                            setUserCep(''); // O CEP não é salvo na string de endereço, então não podemos recuperá-lo aqui.
                            setLogradouro(parts[0]?.trim() || '');
                            setNumero(parts[1]?.trim() || '');
                            setBairro(parts[2]?.trim() || '');
                            const cidadeUf = parts[3]?.split('-').map((s: string) => s.trim());
                            setLocalidade(cidadeUf[0] || '');
                            setUf(cidadeUf[1] || '');
                        }
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar dados do usuário:', error);
            } finally {
                setLoading(false);
            }
        };
        loadUserData();
    }, []);

    const fetchAddressFromCep = async (cep: string) => {
        const cleanedCep = cep.replace(/[^0-9]/g, '');

        if (cleanedCep.length !== 8) {
            setLogradouro('');
            setBairro('');
            setLocalidade('');
            setUf('');
            return;
        }

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
            const data: CepData = await response.json();

            if (data.erro) {
                Alert.alert('Erro', 'CEP não encontrado. Por favor, verifique o número.');
                setLogradouro('');
                setBairro('');
                setLocalidade('');
                setUf('');
                return;
            }

            setLogradouro(data.logradouro);
            setBairro(data.bairro);
            setLocalidade(data.localidade);
            setUf(data.uf);

        } catch (error) {
            console.error('Erro ao buscar CEP:', error);
            Alert.alert('Erro', 'Houve um problema ao buscar o CEP. Tente novamente mais tarde.');
        }
    };

    const handleSave = async () => {
        if (!userName || !userEmail || !userCep || !password || !telefone || !numero) {
            Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
            return;
        }

        if (userCep.length === 8 && (!logradouro || !bairro || !localidade || !uf)) {
            Alert.alert('Atenção', 'Aguarde o preenchimento automático do endereço ou verifique o CEP e a sua conexão.');
            return;
        }

        setLoading(true);

        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                Alert.alert('Erro', 'ID do usuário não encontrado. Faça login novamente.');
                navigator.replace("LoginScreen");
                return;
            }

            const fullAddress = `${logradouro}, ${numero}, ${bairro}, ${localidade} - ${uf}`;

            const updatedUser = {
                username: userName,
                email: userEmail,
                address: fullAddress,
                password: password,
                phoneNumber: telefone,
            };

            await updateUser(userId as string, updatedUser);
            await AsyncStorage.setItem('user', JSON.stringify({ ...updatedUser, id: userId }));
            Alert.alert('Sucesso', 'Suas informações foram salvas com sucesso!');

        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            Alert.alert('Erro', 'Houve um problema ao salvar suas informações. Verifique sua conexão ou tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.clear();
            Alert.alert('Sessão encerrada', 'Você saiu da sua conta.');
            navigator.replace("LoginScreen");
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    return (
        <View style={styles.fullScreenContainer}>
            <ScrollView contentContainerStyle={styles.container}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigator.goBack()}
                >
                    <Icon name="arrow-back" size={24} color="#34495e" />
                </TouchableOpacity>

                <View style={styles.titleContainer}>
                    <FontAwesome5 name="cog" size={24} color="#3498db" />
                    <Text style={styles.title}>Configurações do Perfil</Text>
                </View>

                <Text style={styles.label}>Nome</Text>
                <View style={styles.inputContainer}>
                    <FontAwesome5 name="user" size={16} color="#95a5a6" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        value={userName}
                        onChangeText={setUserName}
                        placeholder="Seu nome completo"
                        placeholderTextColor="#95a5a6"
                    />
                </View>

                <Text style={styles.label}>E-mail</Text>
                <View style={styles.inputContainer}>
                    <MaterialIcons name="email" size={18} color="#95a5a6" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        value={userEmail}
                        onChangeText={setUserEmail}
                        placeholder="seu.email@exemplo.com"
                        placeholderTextColor="#95a5a6"
                        keyboardType="email-address"
                    />
                </View>

                <Text style={styles.label}>Telefone</Text>
                <View style={styles.inputContainer}>
                    <MaterialIcons name="phone" size={18} color="#95a5a6" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        value={telefone}
                        onChangeText={setTelefone}
                        placeholder="(00) 00000-0000"
                        placeholderTextColor="#95a5a6"
                        keyboardType="phone-pad"
                        maxLength={11}
                    />
                </View>
                
                <Text style={styles.label}>Senha</Text>
                <View style={styles.inputContainer}>
                    <FontAwesome5 name="lock" size={18} color="#95a5a6" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="**********"
                        placeholderTextColor="#95a5a6"
                        secureTextEntry
                    />
                </View>

                <View style={styles.divider} />
                <Text style={styles.subTitle}>Endereço</Text>

                <Text style={styles.label}>CEP</Text>
                <View style={styles.inputContainer}>
                    <FontAwesome5 name="map-marker-alt" size={18} color="#95a5a6" style={styles.icon} />
                    <TextInput
                        style={styles.input}
                        value={userCep}
                        onChangeText={setUserCep}
                        onBlur={() => fetchAddressFromCep(userCep)}
                        placeholder="00000-000"
                        placeholderTextColor="#95a5a6"
                        keyboardType="numeric"
                        maxLength={8}
                    />
                </View>

                {logradouro !== '' && (
                    <>
                        <Text style={styles.label}>Logradouro</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={logradouro}
                                editable={false}
                            />
                        </View>

                        <Text style={styles.label}>Número</Text>
                        <View style={styles.inputContainer}>
                            <FontAwesome5 name="hashtag" size={18} color="#95a5a6" style={styles.icon} />
                            <TextInput
                                style={styles.input}
                                value={numero}
                                onChangeText={setNumero}
                                placeholder="Número da residência"
                                placeholderTextColor="#95a5a6"
                                keyboardType="numeric"
                            />
                        </View>

                        <Text style={styles.label}>Bairro</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={bairro}
                                editable={false}
                            />
                        </View>

                        <Text style={styles.label}>Cidade/Estado</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={`${localidade} - ${uf}`}
                                editable={false}
                            />
                        </View>
                    </>
                )}

                <TouchableOpacity
                    onPress={handleSave}
                    style={[styles.button, styles.saveButton, loading && styles.buttonDisabled]}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Salvar Alterações</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleLogout}
                    style={[styles.button, styles.logoutButton]}
                >
                    <Text style={styles.buttonText}>Sair</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    container: {
        padding: 20,
        paddingTop: 60,
    },
    backButton: {
        position: 'absolute',
        top: 40,
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
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 25,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginLeft: 10,
        color: '#2c3e50',
    },
    subTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#34495e',
        textAlign: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 15,
        marginBottom: 5,
        color: '#34495e',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 15,
        minHeight: 50,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        color: '#2c3e50',
    },
    icon: {
        width: 20,
        textAlign: 'center',
    },
    button: {
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    saveButton: {
        backgroundColor: '#2ecc71',
    },
    logoutButton: {
        backgroundColor: '#e74c3c',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    divider: {
        height: 1,
        backgroundColor: '#ecf0f1',
        marginVertical: 20,
    },
});