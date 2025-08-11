// Configuracao.tsx

import UserService from '@/service/UserService';
import { RootStackParamList } from '@/types/navigation';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type ConfiguracaoNavigationProp = NativeStackNavigationProp<RootStackParamList, "Configuracoes">;

export function Configuracao() {
  const navigator = useNavigation<ConfiguracaoNavigationProp>();

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userCep, setUserCep] = useState('');
  const [telefone, setTelefone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Carrega os dados do usuário do AsyncStorage ao iniciar o componente
    const loadUserData = async () => {
      try {
        setLoading(true);
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setUserName(user.name || '');
          setUserEmail(user.email || '');
          setTelefone(user.phoneNumber || '');
          // Carrega o CEP do campo 'address'
          setUserCep(user.address || ''); 
          setPassword(user.password || '');
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleSave = async () => {
    // Valida se os campos obrigatórios estão preenchidos
    if (!userName || !userEmail || !userCep || !password || !telefone) {
      Alert.alert('Atenção', 'Todos os campos são obrigatórios.');
      return;
    }

    setLoading(true);

    try {
      // Obtém o ID do usuário para a chamada da API
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Erro', 'ID do usuário não encontrado. Faça login novamente.');
        return;
      }

      // Cria o objeto com os dados atualizados do usuário
      // CORRIGIDO: O campo do CEP é 'address', conforme a sua entidade Java
      const updatedUser = {
        name: userName,
        email: userEmail,
        address: userCep, 
        password: password,
        phoneNumber: telefone,
      };

      // Log para visualização do payload antes do envio
      console.log('Dados a serem enviados para o backend:', updatedUser);

      // Chama o serviço de API para atualizar o usuário
      await UserService.updateUser(userId as string, updatedUser);

      // Salva os dados atualizados no AsyncStorage para manter o estado local consistente
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
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
    <View style={styles.container}>
      <Text style={styles.title}>
        <FontAwesome5 name="cog" size={24} color="#4caf50" /> Configurações do Perfil
      </Text>

      <Text style={styles.label}>Nome</Text>
      <View style={styles.inputContainer}>
        <FontAwesome5 name="user" size={16} color="#999" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={userName}
          onChangeText={setUserName}
          placeholder="Seu nome completo"
        />
      </View>

      <Text style={styles.label}>CEP</Text>
      <View style={styles.inputContainer}>
        <FontAwesome5 name="map-marker-alt" size={18} color="#999" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={userCep}
          onChangeText={setUserCep}
          placeholder="00000-000"
          keyboardType="numeric"
          maxLength={9}
        />
      </View>

      <Text style={styles.label}>Telefone</Text>
      <View style={styles.inputContainer}>
        <MaterialIcons name="phone" size={18} color="#999" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={telefone}
          onChangeText={setTelefone}
          placeholder="(00) 00000-0000"
          keyboardType="phone-pad"
          maxLength={15}
        />
      </View>

      <Text style={styles.label}>E-mail</Text>
      <View style={styles.inputContainer}>
        <MaterialIcons name="email" size={18} color="#999" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={userEmail}
          onChangeText={setUserEmail}
          placeholder="seu.email@exemplo.com"
          keyboardType="email-address"
        />
      </View>

      <Text style={styles.label}>Senha</Text>
      <View style={styles.inputContainer}>
        <FontAwesome5 name="lock" size={18} color="#999" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="**********"
          secureTextEntry
        />
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f6f6',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 50,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  icon: {
    marginRight: 5,
    width: 20,
    textAlign: 'center',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#4caf50',
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
});
