// SolicitaColeta.tsx

import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SolicitaColeta() {
  const [endereco, setEndereco] = useState('Rua dos Recicláveis, 456');
  const [data, setData] = useState('20/05/2024');
  const [residuosSelecionados, setResiduosSelecionados] = useState<string[]>([]);

  const tiposResiduos = [
    { nome: 'Papel', icon: 'file-alt', cor: '#2aa7b7' },
    { nome: 'Plástico', icon: 'bottle-water', cor: '#4caf50' },
    { nome: 'Vidro', icon: 'wine-bottle', cor: '#4caf50' },
    { nome: 'Metal', icon: 'can', cor: '#7a9e4c' },
  ];

  const toggleResiduo = (nome: string) => {
    if (residuosSelecionados.includes(nome)) {
      setResiduosSelecionados(residuosSelecionados.filter(r => r !== nome));
    } else {
      setResiduosSelecionados([...residuosSelecionados, nome]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        <FontAwesome5 name="trash" size={24} color="#4caf50" /> Solicitar Coleta
      </Text>

      <Text style={styles.label}>Endereço</Text>
      <View style={styles.inputContainer}>
        <MaterialIcons name="location-on" size={20} color="#999" />
        <TextInput value={endereco} onChangeText={setEndereco} style={styles.input} />
      </View>

      <Text style={styles.label}>Data de Coleta</Text>
      <View style={styles.inputContainer}>
        <MaterialIcons name="date-range" size={20} color="#999" />
        <TextInput value={data} onChangeText={setData} style={styles.input} />
      </View>

      <Text style={styles.label}>Tipos de Resíduos</Text>
      <View style={styles.buttonsContainer}>
        {tiposResiduos.map((item) => (
          <TouchableOpacity
            key={item.nome}
            style={[
              styles.residuoBtn,
              {
                backgroundColor: item.cor,
                opacity: residuosSelecionados.includes(item.nome) ? 1 : 0.5,
              },
            ]}
            onPress={() => toggleResiduo(item.nome)}
          >
            <FontAwesome5 name={item.icon as any} size={16} color="#fff" style={{ marginRight: 5 }} />
            <Text style={styles.btnText}>{item.nome}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.agendarBtn}>
        <Text style={styles.agendarText}>Agendar Coleta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  label: { fontSize: 16, fontWeight: '600', marginTop: 15, marginBottom: 5 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f6f6',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 50,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 10,
  },
  residuoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  agendarBtn: {
    marginTop: 20,
    backgroundColor: '#4caf50',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  agendarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
