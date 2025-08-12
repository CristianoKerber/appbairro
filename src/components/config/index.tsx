// Configuracao.tsx

import { updateUser } from '@/service/UserService';
import { RootStackParamList } from '@/types/navigation';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
  
  // Novos estados para o endereço completo
  const [logradouro, setLogradouro] = useState('');
  const [bairro, setBairro] = useState('');
  const [localidade, setLocalidade] = useState('');
  const [uf, setUf] = useState('');
  const [numero, setNumero] = useState(''); // Novo estado para o número
  
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
          setUserCep(user.address.split(',')[0].trim() || ''); 
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

  const fetchAddressFromCep = async (cep: string) => {
    const cleanedCep = cep.replace(/[^0-9]/g, '');

    if (cleanedCep.length !== 8) {
      setLogradouro('');
      setBairro('');
      setLocalidade('');
      setUf('');
      setNumero('');
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
      const data: CepData = await response.json();
      
      if (data.erro) {
        Alert.alert('Erro', 'CEP não encontrado. Por favor, verifique o número e tente novamente.');
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
    if (!userName || !userEmail || !userCep || !password || !telefone) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.');
      return;
    }
    
    if (userCep.length === 8 && (!logradouro || !bairro || !localidade || !uf)) {
      Alert.alert('Atenção', 'Aguarde o preenchimento automático do endereço ou verifique o CEP e a sua conexão.');
      return;
    }

    // Nova validação para o número da residência
    if (logradouro && !numero) {
      Alert.alert('Atenção', 'Por favor, insira o número da sua residência.');
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
      
      // Incluído o número da residência na string do endereço
      const fullAddress = `${logradouro}, ${numero}, ${bairro}, ${localidade} - ${uf}`;

      const updatedUser = {
        username: userName,
        email: userEmail,
        address: fullAddress,
        password: password,
        phoneNumber: telefone,
      };

      console.log('Dados a serem enviados para o backend:', updatedUser);
      await updateUser(userId as string, updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify({ ...updatedUser, id: userId }));
      navigator.replace("Dashboard");
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
    <ScrollView style={styles.container}>
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
          placeholderTextColor="#999"
        />
      </View>

      <Text style={styles.label}>CEP</Text>
      <View style={styles.inputContainer}>
        <FontAwesome5 name="map-marker-alt" size={18} color="#999" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={userCep}
          onChangeText={setUserCep}
          onBlur={() => fetchAddressFromCep(userCep)}
          placeholder="00000-000"
          placeholderTextColor="#999"
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
            <FontAwesome5 name="hashtag" size={18} color="#999" style={styles.icon} />
            <TextInput
              style={styles.input}
              value={numero}
              onChangeText={setNumero}
              placeholder="Número da residência"
              placeholderTextColor="#999"
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

      <Text style={styles.label}>Telefone</Text>
      <View style={styles.inputContainer}>
        <MaterialIcons name="phone" size={18} color="#999" style={styles.icon} />
        <TextInput
          style={styles.input}
          value={telefone}
          onChangeText={setTelefone}
          placeholder="(00) 00000-0000"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          maxLength={11}
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
          placeholderTextColor="#999"
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
          placeholderTextColor="#999"
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f6f6',
    borderRadius: 10,
    paddingHorizontal: 10,
    minHeight: 50,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
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