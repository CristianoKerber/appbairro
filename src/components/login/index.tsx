import api from "@/service/api";
import { RootStackParamList } from "@/types/navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "LoginScreen"
>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    // Credenciais de admin fixas
    const adminEmail = "jeanvictor@admin.com";
    const adminPassword = "admin@123";
    
    setErrorMessage(""); // Limpa a mensagem de erro anterior

    // VALIDAÇÃO CONDICIONAL PARA O ADMIN
    if (email.trim() === adminEmail && password === adminPassword) {
      console.log("Login de Admin bem-sucedido.");
      // Armazena um token ou flag de admin se necessário
      await AsyncStorage.setItem("userRole", "admin");
      navigation.replace("AdminDashboard"); // Redireciona para a tela de admin
      return;
    }

    // Se não for admin, segue o fluxo de login normal com a API
    try {
      const response = await api.post("/api/users/login", {
        email: email.trim(),
        password: password,
      });

      console.log("Login de usuário bem-sucedido:", response.data);
      const { username, address, id } = response.data;

      await AsyncStorage.setItem("userName", username);
      await AsyncStorage.setItem("userAddress", address);
      // Para React Native, use AsyncStorage, não localStorage.
      await AsyncStorage.setItem("userId", id.toString());
      await AsyncStorage.setItem("userRole", "user"); // Define o papel como usuário padrão

      console.log("id:", id);
      navigation.replace("Dashboard"); // Redireciona para o dashboard do usuário

      setEmail("");
      setPassword("");
    } catch (error: any) {
      console.error("Erro no login:", error);

      if (error.response && error.response.status === 401) {
        setErrorMessage("Usuário ou senha incorretos.");
      } else {
        setErrorMessage("Erro ao conectar com o servidor.");
      }
    }
  };

  const goToCadastro = () => {
    navigation.navigate("CadastroScreen");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Bem-vindo!</Text>
        <Text style={styles.subtitle}>Faça login para continuar</Text>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        {/* Email */}
        <View style={styles.inputContainer}>
          <Icon name="email" size={20} color="#777" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        {/* Senha */}
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

        {/* Botão */}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        {/* Link para cadastro */}
        <TouchableOpacity style={styles.cadastroLink} onPress={goToCadastro}>
          <Text style={styles.cadastroText}>
            Não tem uma conta?{" "}
            <Text style={styles.cadastroTextBold}>Cadastre-se</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#555",
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
  cadastroLink: {
    marginTop: 20,
    padding: 10,
  },
  cadastroText: {
    color: "#555",
    fontSize: 16,
  },
  cadastroTextBold: {
    color: "#2196f3",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});