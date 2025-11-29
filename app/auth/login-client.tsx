import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { User, CreditCard } from "lucide-react-native";
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

export default function LoginClientScreen() {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");

  const handleLogin = async () => {
    if (!nome.trim() || !cpf.trim()) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    await AsyncStorage.setItem('userType', 'client');
    await AsyncStorage.setItem('clientData', JSON.stringify({
      nome: nome.trim(),
      cpf: cpf.replace(/\D/g, ''),
      mesa: null
    }));

    // Navegação correta para as tabs do cliente
    router.push('/(client)/mesas');
  };

  const formatCPF = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return text;
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#18181B" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>👤</Text>
          </View>

          <Text style={styles.title}>Área do Cliente</Text>
          <Text style={styles.subtitle}>Informe seus dados para reservar uma mesa</Text>
          <View style={styles.blueLine} />

          <View style={{ width: "100%", marginTop: 20 }}>
            <View style={styles.inputGroup}>
              <User size={20} color="#9CA3AF" style={styles.iconLeft} />
              <TextInput
                placeholder="Seu nome completo"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                value={nome}
                onChangeText={setNome}
              />
            </View>

            <View style={styles.inputGroup}>
              <CreditCard size={20} color="#9CA3AF" style={styles.iconLeft} />
              <TextInput
                placeholder="000.000.000-00"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                value={cpf}
                onChangeText={(text) => setCpf(formatCPF(text))}
                keyboardType="numeric"
                maxLength={14}
              />
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Continuar para Reservas</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.push('/')}
            >
              <Text style={styles.backText}>← Voltar para Início</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#27272A",
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    padding: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFF",
  },
  subtitle: {
    color: "#9CA3AF",
    fontSize: 14,
    marginTop: 4,
  },
  blueLine: {
    height: 2,
    width: 60,
    backgroundColor: "#2563EB",
    marginTop: 12,
    marginBottom: 8,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#52525B",
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 10,
    backgroundColor: "#18181B",
  },
  iconLeft: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: "#FFF",
    paddingVertical: 12,
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
  },
  backText: {
    color: "#9CA3AF",
    textAlign: "center",
    fontSize: 14,
  },
});