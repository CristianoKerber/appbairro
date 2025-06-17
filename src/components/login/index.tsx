// src/components/login.tsx

import { RootStackParamList } from "@/types/navigation";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  KeyboardAvoidingView, // Para ajustar a tela quando o teclado aparecer
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

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Função para lidar com o login
  const handleLogin = () => {
    setErrorMessage(""); 

    if (username === "user" && password === "123") {
      navigation.navigate("Dashboard"); 
      setUsername("");
      setPassword("");
    } else {
      setErrorMessage("Nome de usuário ou senha inválidos.")
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

        {/* Campo de Usuário */}
        <View style={styles.inputContainer}>
          <Icon name="account" size={20} color="#777" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Nome de Usuário"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            keyboardType="email-address" // Geralmente usernames são e-mails
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

        {/* Botão de Login */}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        {/* Opção para Cadastro */}
        <TouchableOpacity style={styles.cadastroLink} onPress={goToCadastro}>
          <Text style={styles.cadastroText}>
            Não tem uma conta? <Text style={styles.cadastroTextBold}>Cadastre-se</Text>
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
    backgroundColor: "#f0f4f8", // Fundo claro
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2e7d32", // Verde escuro
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
    color: "#d32f2f", // Vermelho
    marginBottom: 15,
    fontSize: 14,
    textAlign: "center",
    width: "100%",
    maxWidth: 400,
  },
  button: {
    backgroundColor: "#4caf50", // Verde vibrante
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
    color: "#2196f3", // Azul
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});