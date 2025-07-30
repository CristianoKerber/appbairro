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
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import api from "@/service/api";
import { RootStackParamList } from "@/types/navigation";
import AsyncStorage from "@react-native-async-storage/async-storage";

type CadastroScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "CadastroScreen"
>;

export default function CadastroScreen() {
  const navigation = useNavigation<CadastroScreenNavigationProp>();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    cep: "",
    rua: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buscarEnderecoPorCep = async (inputCep: string) => {
    const cleanedCep = inputCep.replace(/\D/g, "");
    if (cleanedCep.length !== 8) return;

    setLoadingCep(true);
    setErrorMessage("");
    Keyboard.dismiss();

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
      const data = await res.json();

      if (data.erro) {
        setErrorMessage("CEP não encontrado.");
        handleChange("rua", "");
        handleChange("bairro", "");
        handleChange("cidade", "");
        handleChange("estado", "");
      } else {
        handleChange("rua", data.logradouro || "");
        handleChange("bairro", data.bairro || "");
        handleChange("cidade", data.localidade || "");
        handleChange("estado", data.uf || "");
      }
    } catch (err) {
      setErrorMessage("Erro ao buscar CEP.");
    } finally {
      setLoadingCep(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (form.cep.replace(/\D/g, "").length === 8) {
        buscarEnderecoPorCep(form.cep);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [form.cep]);

  const formatarTelefone = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    return cleaned
      .replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3")
      .substring(0, 15);
  };

  const validarCadastro = () => {
    const {
      username,
      email,
      password,
      confirmPassword,
      phoneNumber,
      cep,
      rua,
      numero,
      bairro,
      cidade,
      estado,
    } = form;

    if (
      !username || !email || !password || !confirmPassword ||
      !phoneNumber || !cep || !rua || !numero || !bairro || !cidade || !estado
    ) return "Preencha todos os campos obrigatórios.";

    if (password !== confirmPassword) return "As senhas não coincidem.";
    if (password.length < 6) return "Senha deve ter ao menos 6 caracteres.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "E-mail inválido.";
    if (phoneNumber.replace(/\D/g, "").length < 10) return "Telefone inválido.";
    if (cep.replace(/\D/g, "").length !== 8) return "CEP inválido.";

    return "";
  };
const handleCadastro = async () => {
  const erro = validarCadastro();
  if (erro) {
    setErrorMessage(erro);
    return;
  }

  const address = `${form.rua}, ${form.numero}${form.complemento ? ` - ${form.complemento}` : ""}, ${form.bairro}, ${form.cidade} - ${form.estado}, CEP ${form.cep}`;

  const payload = {
    username: form.username,
    password: form.password,
    email: form.email,
    phoneNumber: form.phoneNumber.replace(/\D/g, ""),
    address,
  };

  try {
    console.log("Cadastrando:", payload);

    await AsyncStorage.setItem("userName", payload.username);
    await AsyncStorage.setItem("userAddress", payload.address);

    api.post("/api/users/save", payload);


    navigation.replace("Dashboard");

    setForm({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      cep: "",
      rua: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
    });
    setErrorMessage("");

  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    setErrorMessage("Erro ao salvar dados. Tente novamente.");
  }
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crie Sua Conta</Text>
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      {[
        { placeholder: "Nome de Usuário", key: "username", icon: "account" },
        { placeholder: "E-mail", key: "email", icon: "email", keyboardType: "email-address" },
        { placeholder: "Senha", key: "password", icon: "lock", secure: true },
        { placeholder: "Confirmar Senha", key: "confirmPassword", icon: "lock-check", secure: true },
        {
          placeholder: "Número de Telefone",
          key: "phoneNumber",
          icon: "phone",
          keyboardType: "phone-pad",
          formatter: formatarTelefone,
        },
        { placeholder: "CEP", key: "cep", icon: "map-marker-radius", keyboardType: "numeric" },
        { placeholder: "Rua", key: "rua", icon: "map-marker" },
        { placeholder: "Número", key: "numero", icon: "numeric", keyboardType: "numeric" },
        { placeholder: "Complemento", key: "complemento", icon: "home-city-outline" },
        { placeholder: "Bairro", key: "bairro", icon: "map-marker-outline" },
        { placeholder: "Cidade", key: "cidade", icon: "city" },
        { placeholder: "UF", key: "estado", icon: "map-marker-check", maxLength: 2 },
      ].map((field) => (
        <View key={field.key} style={styles.inputContainer}>
          <Icon name={field.icon} size={20} color="#777" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder={field.placeholder}
            value={
              field.formatter
                ? field.formatter(form[field.key as keyof typeof form])
                : form[field.key as keyof typeof form]
            }
            onChangeText={(text) => handleChange(field.key, text)}
            keyboardType={field.keyboardType as any}
            secureTextEntry={field.secure}
            autoCapitalize={field.key === "email" || field.key === "username" ? "none" : "sentences"}
            maxLength={field.maxLength}
            editable={loadingCep && ["rua", "bairro", "cidade", "estado"].includes(field.key) ? false : true}
          />
          {field.key === "cep" && loadingCep && <ActivityIndicator size="small" color="#4caf50" />}
        </View>
      ))}

      <TouchableOpacity style={styles.button} onPress={handleCadastro}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.replace("LoginScreen")} style={styles.loginLink}>
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
