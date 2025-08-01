// SolicitaColeta.tsx

import CollectService from "@/service/CollectService"; // Keep this import
import CollectedItemService from "@/service/CollectedItemService";
import api from "@/service/api";
import { RootStackParamList } from "@/types/navigation";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type ColetaNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "SolicitaColeta"
>;

export default function SolicitaColeta() {
  const navigator = useNavigation<ColetaNavigationProp>();
  const [endereco, setEndereco] = useState("Rua dos Recicláveis, 456");
  const [dataColeta, setDataColeta] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [residuosSelecionados, setResiduosSelecionados] = useState<string[]>([]);

  const tiposResiduos = [
    { nome: "Papel", icon: "file-alt", cor: "#2aa7b7" },
    { nome: "Plástico", icon: "bottle-water", cor: "#4caf50" },
    { nome: "Vidro", icon: "wine-bottle", cor: "#4caf50" },
    { nome: "Metal", icon: "can", cor: "#7a9e4c" },
  ];

  const toggleResiduo = (nome: string) => {
    if (residuosSelecionados.includes(nome)) {
      setResiduosSelecionados(residuosSelecionados.filter((r) => r !== nome));
    } else {
      setResiduosSelecionados([...residuosSelecionados, nome]);
    }
  };

  const isButtonDisabled = residuosSelecionados.length === 0;

  const onChangeDate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dataColeta;
    setShowDatePicker(Platform.OS === "ios");
    setDataColeta(currentDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const formatarData = (date: Date) => {
    return date.toLocaleDateString("pt-BR");
  };

  const handleAgendarColeta = async () => {
    if (isButtonDisabled) {
      alert("Por favor, selecione pelo menos um tipo de resíduo para agendar a coleta.");
      return;
    }
try {
  const collectPayload = {
    Collected: false,
    collecteDate: dataColeta.toISOString().split("T")[0],
  };

  const collectResponse = await CollectService.createCollect(collectPayload);
  const collectId = collectResponse.id;

  if (!collectId) {
    throw new Error("ID da coleta não foi retornado pelo backend.");
  }

  // 2. Criar os itens coletados vinculados à coleta criada
  for (const nomeItem of residuosSelecionados) {
    const collectedItemPayload = {
      ItemName: nomeItem,
      ItemDescription: `Resíduo do tipo ${nomeItem}`,
      quantity: 1,
      collectedDate: dataColeta.toISOString().split("T")[0],
      collectId: collectId,
    };

    await CollectedItemService.createCollectedItem(collectedItemPayload);
  }

  api.post("api/collects/save", collectPayload);
  alert(
    `Coleta agendada para ${formatarData(dataColeta)} no endereço ${endereco} com os resíduos: ${residuosSelecionados.join(
      ", "
    )}.`
  );
  navigator.replace("Dashboard");
} catch (error) {
  console.error("Erro ao agendar coleta:", error);
  alert("Erro ao agendar a coleta. Tente novamente.");
}

  };

  useEffect(() => {
    const carregarEndereco = async () => {
      const enderecoSalvo = await AsyncStorage.getItem("userAddress");
      if (enderecoSalvo) {
        setEndereco(enderecoSalvo);
      }
    };
    carregarEndereco();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        <FontAwesome5 name="trash" size={24} color="#4caf50" /> Solicitar Coleta
      </Text>

      <Text style={styles.label}>Endereço</Text>
      <View style={styles.inputContainer}>
        <MaterialIcons name="location-on" size={20} color="#999" />
        <TextInput
          value={endereco}
          onChangeText={setEndereco}
          style={styles.input}
          placeholder="Seu endereço completo"
          editable={false}
        />
      </View>

      <Text style={styles.label}>Data de Coleta</Text>
      <TouchableOpacity onPress={showDatepicker} style={styles.inputContainer}>
        <MaterialIcons name="date-range" size={20} color="#999" />
        <TextInput
          value={formatarData(dataColeta)}
          style={styles.input}
          editable={false}
          placeholder="Selecione a data"
        />
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={dataColeta}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={onChangeDate}
          minimumDate={new Date()}
        />
      )}

      <Text style={styles.label}>Tipos de Resíduos</Text>
      <View style={styles.buttonsContainer}>
        {tiposResiduos.map((item) => (
          <TouchableOpacity
            key={item.nome}
            style={[
              styles.residuoBtn,
              {
                backgroundColor: item.cor,
                opacity: residuosSelecionados.includes(item.nome) ? 1 : 0.6,
              },
            ]}
            onPress={() => toggleResiduo(item.nome)}
          >
            <FontAwesome5
              name={item.icon as any}
              size={16}
              color="#fff"
              style={{ marginRight: 5 }}
            />
            <Text style={styles.btnText}>{item.nome}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={handleAgendarColeta}
        style={[
          styles.agendarBtn,
          {
            backgroundColor: isButtonDisabled ? "#ccc" : "#4caf50",
          },
        ]}
        disabled={isButtonDisabled}
      >
        <Text style={styles.agendarText}>Agendar Coleta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: "#333" },
  label: { fontSize: 16, fontWeight: "600", marginTop: 15, marginBottom: 5 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f6f6f6",
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 50,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  buttonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginVertical: 10,
  },
  residuoBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    padding: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  agendarBtn: {
    marginTop: 30,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  agendarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
