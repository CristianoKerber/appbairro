// CadastroScreen.tsx

import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react"; // Importe useEffect
import {
  ActivityIndicator,
  Alert, // Para mostrar um spinner de carregamento
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// --- Tipagem de Navegação (Ajuste conforme sua RootStackParamList) ---
type RootStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  Dashboard: undefined;
  // ... outras rotas do seu aplicativo
};

type CadastroScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Cadastro"
>;

export default function CadastroScreen() {
  const navigation = useNavigation<CadastroScreenNavigationProp>();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // --- Novos estados para CEP e endereço detalhado ---
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState(""); // Número do endereço
  const [complemento, setComplemento] = useState(""); // Complemento do endereço
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState(""); // Sigla do estado

  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingCep, setLoadingCep] = useState(false); // Estado para o loading do CEP

  // --- Função para buscar endereço pelo CEP ---
  const buscarEnderecoPorCep = async (inputCep: string) => {
    // Remove qualquer caractere não numérico do CEP
    const cleanedCep = inputCep.replace(/\D/g, "");

    if (cleanedCep.length !== 8) {
      // O CEP deve ter 8 dígitos
      setRua("");
      setBairro("");
      setCidade("");
      setEstado("");
      // setErrorMessage('CEP inválido. Digite 8 dígitos.'); // Opcional: mostrar erro aqui
      return;
    }

    setLoadingCep(true); // Ativa o loading
    setErrorMessage(""); // Limpa mensagens de erro anteriores
    Keyboard.dismiss(); // Fecha o teclado

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanedCep}/json/`
      );
      const data = await response.json();

      if (data.erro) {
        setErrorMessage(
          "CEP não encontrado. Por favor, verifique ou preencha manualmente."
        );
        setRua("");
        setBairro("");
        setCidade("");
        setEstado("");
      } else {
        setRua(data.logradouro || "");
        setBairro(data.bairro || "");
        setCidade(data.localidade || "");
        setEstado(data.uf || "");
        setErrorMessage(""); // Limpa o erro se o CEP foi encontrado
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      setErrorMessage("Erro ao buscar CEP. Verifique sua conexão.");
      setRua("");
      setBairro("");
      setCidade("");
      setEstado("");
    } finally {
      setLoadingCep(false); // Desativa o loading
    }
  };

  // --- useEffect para buscar CEP quando o campo mudar (com delay opcional) ---
  useEffect(() => {
    // Debounce: só busca depois de um pequeno tempo sem digitação
    const handler = setTimeout(() => {
      if (cep.replace(/\D/g, "").length === 8) {
        // Só busca se o CEP estiver completo
        buscarEnderecoPorCep(cep);
      }
    }, 500); // 500ms de atraso

    return () => {
      clearTimeout(handler); // Limpa o timer se o CEP mudar antes do atraso
    };
  }, [cep]); // Dependência: executa sempre que o 'cep' mudar

  // --- Funções para o DatePicker ---
  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(Platform.OS === "ios");
    setDateOfBirth(currentDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const formatarData = (date: Date) => {
    return date.toLocaleDateString("pt-BR");
  };

  // --- Formatar o número de telefone (opcional) ---
  const formatarTelefone = (text: string) => {
    // Remove tudo que não for número
    const cleaned = text.replace(/\D/g, "");
    let formatted = "";

    if (cleaned.length > 0) {
      formatted += `(${cleaned.substring(0, 2)}`;
    }
    if (cleaned.length > 2) {
      formatted += `) ${cleaned.substring(2, 7)}`;
    }
    if (cleaned.length > 7) {
      formatted += `-${cleaned.substring(7, 11)}`;
    }
    return formatted;
  };

  const handleCadastro = () => {
    setErrorMessage("");

    // --- Validações de Campos ---
    // Note que o 'address' do seu backend será composto por rua, numero, complemento, bairro, cidade, estado
    // Então aqui você deve verificar todos esses campos
    if (
      !username ||
      !password ||
      !confirmPassword ||
      !email ||
      !phoneNumber ||
      !cep ||
      !rua ||
      !numero ||
      !bairro ||
      !cidade ||
      !estado
    ) {
      setErrorMessage(
        "Por favor, preencha todos os campos obrigatórios, incluindo o endereço completo."
      );
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Por favor, insira um e-mail válido.");
      return;
    }
    if (phoneNumber.replace(/\D/g, "").length < 10) {
      // Validação do telefone
      setErrorMessage(
        "Número de telefone inválido (mínimo 10 dígitos com DDD)."
      );
      return;
    }
    if (cep.replace(/\D/g, "").length !== 8) {
      setErrorMessage("CEP inválido. Digite 8 dígitos.");
      return;
    }
    // Poderíamos adicionar validação para o 'numero' ser numérico, etc.

    // --- Montar o objeto de endereço completo para o backend ---
    const fullAddress = `${rua}, ${numero}${
      complemento ? ` - ${complemento}` : ""
    }, ${bairro}, ${cidade} - ${estado}, CEP ${cep}`;

    // --- Lógica de envio para o Backend ---
    const userData = {
      username,
      password,
      email,
      phoneNumber: phoneNumber.replace(/\D/g, ""), // Envie apenas os números para o backend
      address: fullAddress, // Envie o endereço completo formatado
      dateOfBirth: dateOfBirth.toISOString().split("T")[0], // Formato 'YYYY-MM-DD'
    };

    console.log("Dados para cadastro:", userData);

    // --- Simulação de sucesso para demonstração ---
    Alert.alert("Sucesso!", "Cadastro realizado com sucesso!", [
      { text: "OK", onPress: () => navigation.replace("Dashboard") },
    ]);

    // Opcional: Limpar campos após o cadastro
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setEmail("");
    setPhoneNumber("");
    setCep("");
    setRua("");
    setNumero("");
    setComplemento("");
    setBairro("");
    setCidade("");
    setEstado("");
    setDateOfBirth(new Date());
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crie Sua Conta</Text>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

      {/* Campo Username */}
      <View style={styles.inputContainer}>
        <Icon name="account" size={20} color="#777" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Nome de Usuário"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>

      {/* Campo E-mail */}
      <View style={styles.inputContainer}>
        <Icon name="email" size={20} color="#777" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Campo Senha */}
      <View style={styles.inputContainer}>
        <Icon name="lock" size={20} color="#777" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      {/* Campo Confirmar Senha */}
      <View style={styles.inputContainer}>
        <Icon name="lock-check" size={20} color="#777" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Confirmar Senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>

      {/* Campo Telefone */}
      <View style={styles.inputContainer}>
        <Icon name="phone" size={20} color="#777" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Número de Telefone (DDD) XXXXX-XXXX"
          value={formatarTelefone(phoneNumber)} // Exibe formatado
          onChangeText={(text) => setPhoneNumber(text.replace(/\D/g, ""))} // Armazena apenas números
          keyboardType="phone-pad"
          maxLength={15} // Ex: (XX) XXXXX-XXXX
        />
      </View>

      {/* --- Campo CEP --- */}
      <View style={styles.inputContainer}>
        <Icon
          name="map-marker-radius"
          size={20}
          color="#777"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="CEP"
          value={cep}
          onChangeText={setCep}
          keyboardType="numeric"
          maxLength={9} // 8 dígitos + hífen
        />
        {loadingCep && <ActivityIndicator size="small" color="#4caf50" />}
      </View>

      {/* --- Campos de Endereço Preenchidos (ou editáveis) --- */}
      <View style={styles.inputContainer}>
        <Icon name="map-marker" size={20} color="#777" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Rua"
          value={rua}
          onChangeText={setRua}
          editable={!loadingCep} // Editável se não estiver buscando CEP
        />
      </View>
      <View style={styles.rowContainer}>
        <View style={[styles.inputContainer, styles.rowInputHalf]}>
          <Icon name="numeric" size={20} color="#777" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Número"
            value={numero}
            onChangeText={setNumero}
            keyboardType="numeric"
          />
        </View>
        <View
          style={[
            styles.inputContainer,
            styles.rowInputHalf,
            { marginLeft: 10 },
          ]}
        >
          <Icon
            name="home-city-outline"
            size={20}
            color="#777"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Complemento"
            value={complemento}
            onChangeText={setComplemento}
          />
        </View>
      </View>
      <View style={styles.inputContainer}>
        <Icon
          name="map-marker-outline"
          size={20}
          color="#777"
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Bairro"
          value={bairro}
          onChangeText={setBairro}
          editable={!loadingCep}
        />
      </View>
      <View style={styles.rowContainer}>
        <View style={[styles.inputContainer, styles.rowInputHalf]}>
          <Icon name="city" size={20} color="#777" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Cidade"
            value={cidade}
            onChangeText={setCidade}
            editable={!loadingCep}
          />
        </View>
        <View
          style={[
            styles.inputContainer,
            styles.rowInputHalf,
            { marginLeft: 10 },
          ]}
        >
          <Icon
            name="map-marker-check"
            size={20}
            color="#777"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="UF"
            value={estado}
            onChangeText={setEstado}
            maxLength={2}
            autoCapitalize="characters"
            editable={!loadingCep}
          />
        </View>
      </View>

      {/* Campo Data de Nascimento (com DatePicker) */}
      <TouchableOpacity onPress={showDatepicker} style={styles.inputContainer}>
        <Icon name="calendar" size={20} color="#777" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Data de Nascimento"
          value={formatarData(dateOfBirth)}
          editable={false}
        />
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          testID="datePicker"
          value={dateOfBirth}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangeDate}
          maximumDate={new Date()} // Impede seleção de datas futuras
        />
      )}

      {/* Botão Cadastrar */}
      <TouchableOpacity style={styles.button} onPress={handleCadastro}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

      {/* Opção para Voltar ao Login */}
      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => navigation.replace("Dashboard")}
      >
        <Text style={styles.loginText}>Já tem uma conta? Faça Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f0f4f8",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2e7d32",
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: "100%",
    maxWidth: 400,
    height: 55,
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 400,
    marginBottom: 15,
  },
  rowInputHalf: {
    flex: 1,
    marginBottom: 0, // Remover margem inferior para não duplicar
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  errorText: {
    color: "#d32f2f",
    marginBottom: 15,
    fontSize: 14,
    textAlign: "center",
    width: "100%",
    maxWidth: 400,
  },
  button: {
    backgroundColor: "#4caf50",
    borderRadius: 10,
    paddingVertical: 15,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    marginTop: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loginLink: {
    marginTop: 20,
    padding: 10,
  },
  loginText: {
    color: "#2196f3",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
