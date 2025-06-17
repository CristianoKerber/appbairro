// CadastroScreen.tsx

import { RootStackParamList } from "@/types/navigation"; // Importa a tipagem do local correto
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type CadastroScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "CadastroScreen"
>;

export default function CadastroScreen() {
  const navigation = useNavigation<CadastroScreenNavigationProp>();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);

  const buscarEnderecoPorCep = async (inputCep: string) => {
    const cleanedCep = inputCep.replace(/\D/g, "");

    if (cleanedCep.length !== 8) {
      setRua("");
      setBairro("");
      setCidade("");
      setEstado("");
      return;
    }

    setLoadingCep(true);
    setErrorMessage("");
    Keyboard.dismiss();

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
        setErrorMessage("");
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      setErrorMessage("Erro ao buscar CEP. Verifique sua conexão.");
      setRua("");
      setBairro("");
      setCidade("");
      setEstado("");
    } finally {
      setLoadingCep(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      if (cep.replace(/\D/g, "").length === 8) {
        buscarEnderecoPorCep(cep);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [cep]);

  const formatarTelefone = (text: string) => {
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
    console.log("--- handleCadastro iniciado ---");
    setErrorMessage("");

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
      console.log("Validação falhou: Campos obrigatórios ausentes");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("As senhas não coincidem.");
      console.log("Validação falhou: Senhas não coincidem");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("A senha deve ter pelo menos 6 caracteres.");
      console.log("Validação falhou: Senha curta");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Por favor, insira um e-mail válido.");
      console.log("Validação falhou: E-mail inválido");
      return;
    }
    if (phoneNumber.replace(/\D/g, "").length < 10) {
      setErrorMessage(
        "Número de telefone inválido (mínimo 10 dígitos com DDD)."
      );
      console.log("Validação falhou: Telefone inválido");
      return;
    }
    if (cep.replace(/\D/g, "").length !== 8) {
      setErrorMessage("CEP inválido. Digite 8 dígitos.");
      console.log("Validação falhou: CEP inválido");
      return;
    }

    console.log("Todas as validações passaram. Tentando cadastro...");

    const fullAddress = `${rua}, ${numero}${
      complemento ? ` - ${complemento}` : ""
    }, ${bairro}, ${cidade} - ${estado}, CEP ${cep}`;

    const userData = {
      username,
      password,
      email,
      phoneNumber: phoneNumber.replace(/\D/g, ""),
      address: fullAddress,
      // dateOfBirth não incluído, conforme solicitado
    };

    console.log("Dados para cadastro:", userData);

    navigation.replace("Dashboard")

    // Limpar campos após o cadastro (opcional)
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
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crie Sua Conta</Text>

      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}

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

      <View style={styles.inputContainer}>
        <Icon name="phone" size={20} color="#777" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Número de Telefone (DDD) XXXXX-XXXX"
          value={formatarTelefone(phoneNumber)}
          onChangeText={(text) => setPhoneNumber(text.replace(/\D/g, ""))}
          keyboardType="phone-pad"
          maxLength={15}
        />
      </View>

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
          maxLength={9}
        />
        {loadingCep && <ActivityIndicator size="small" color="#4caf50" />}
      </View>

      <View style={styles.inputContainer}>
        <Icon name="map-marker" size={20} color="#777" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Rua"
          value={rua}
          onChangeText={setRua}
          editable={!loadingCep}
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

      <TouchableOpacity style={styles.button} onPress={handleCadastro}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginLink}
        onPress={() => navigation.replace("LoginScreen")} 
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
    marginBottom: 0,
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