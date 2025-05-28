import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../../types/navigation';

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

export default function Dashboard() {
  const navigation = useNavigation<NavigationProps>();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState('');

  const abrirModal = (tipo: 'status'| 'reciclagem') =>{
    if (tipo === 'status') {
      setModalContent('Status da Coleta: Em andamento');
    } else if (tipo === 'reciclagem') {
      setModalContent('Reciclagem: Itens reciclados com sucesso!');
    }
    setModalVisible(true);
  };

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-xl font-bold">Dashboard</Text>
      <TouchableOpacity
        className="bg-green-500 p-4 rounded-lg mt-4 justify-end"
        onPress={() => navigation.navigate('Config')}
      >
        <Text className="text-white">Configurações</Text>
      </TouchableOpacity>

      {/* botoes arrumar */}
      <View>
      <TouchableOpacity
        className="bg-blue-500 p-4 rounded-lg mt-4"
        onPress={() => navigation.navigate('Coleta')}
        >
        <Text className="text-white">Solicitar Coleta</Text>
      </TouchableOpacity>

      <TouchableOpacity className='"bg-green-200 p-4 rounded-lg mt-4'
        onPress={() => abrirModal('status')}
        >
        <Text className="text-black">Status da Solicitação</Text>

      </TouchableOpacity>

      <TouchableOpacity
        className="bg-yellow-500 p-4 rounded-lg mt-4"
        onPress={() => abrirModal('reciclagem')}
        >
        <Text className="text-white">Reciclagem</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-purple-500 p-4 rounded-lg mt-4"
        onPress={() => navigation.navigate('Jardim')}
        >
        <Text className="text-white" >Participar do Jardim comunitário</Text>
      </TouchableOpacity>
      
      {/* Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-xl w-80">
            <Text className="text-lg mb-4">{modalContent}</Text>
            <TouchableOpacity
              className="bg-green-600 p-3 rounded-lg"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-white text-center">Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
        </View>
    </View>
  );
}
