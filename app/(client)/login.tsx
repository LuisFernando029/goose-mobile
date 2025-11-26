import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ChefHat, Mail, Phone, User } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = "http://192.168.0.20:4000/customers";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  const formatPhone = (text: string) => {
    // Remove tudo que não é número
    const cleaned = text.replace(/\D/g, "");

    // Limita a 11 dígitos
    const limited = cleaned.substring(0, 11);

    // Formata (XX) XXXXX-XXXX
    if (limited.length <= 2) {
      return limited;
    } else if (limited.length <= 7) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    } else {
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
    }
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhone(text);
    setFormData({ ...formData, phone: formatted });
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      Alert.alert("Erro", "Por favor, preencha seu nome");
      return false;
    }

    if (!formData.email.trim()) {
      Alert.alert("Erro", "Por favor, preencha seu e-mail");
      return false;
    }

    if (!validateEmail(formData.email)) {
      Alert.alert("Erro", "Por favor, insira um e-mail válido");
      return false;
    }

    if (formData.phone && formData.phone.replace(/\D/g, "").length < 10) {
      Alert.alert("Erro", "Por favor, insira um telefone válido");
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Remove formatação do telefone para enviar ao backend
      const phoneClean = formData.phone.replace(/\D/g, "");

      console.log("=== CADASTRANDO CLIENTE ===");
      console.log("URL:", API_URL);
      console.log("Data:", {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: phoneClean || null,
      });

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: phoneClean || null,
        }),
      });

      console.log("Response status:", response.status);

      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response:", errorText);

        if (response.status === 400 && errorText.includes("já existe")) {
          Alert.alert(
            "E-mail já cadastrado",
            "Este e-mail já está em uso. Tente fazer login."
          );
        } else {
          Alert.alert(
            "Erro",
            `Não foi possível criar a conta (${response.status})`
          );
        }
        return;
      }

      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        console.log("Cliente cadastrado:", data);

        // Salva os dados do cliente no AsyncStorage
        await AsyncStorage.setItem("customer", JSON.stringify(data));

        Alert.alert(
          "Cadastro realizado!",
          "Sua conta foi criada com sucesso",
          [
            {
              text: "OK",
              onPress: () => {
                // Navega para o cardápio
                router.replace("/(client)/cardapio");
              },
            },
          ]
        );
      } else {
        Alert.alert("Erro", "Resposta inválida do servidor");
      }
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      Alert.alert(
        "Erro",
        error instanceof Error
          ? error.message
          : "Erro ao criar conta. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        {/* Logo/Ícone */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <ChefHat color="#FFF" size={48} />
          </View>
          <Text style={styles.logoText}>Criar Conta</Text>
          <Text style={styles.subtitle}>
            Cadastre-se para fazer seus pedidos
          </Text>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          {/* Nome */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIconContainer}>
              <User color="#9CA3AF" size={20} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor="#9CA3AF"
              value={formData.name}
              onChangeText={(text) =>
                setFormData({ ...formData, name: text })
              }
              autoCapitalize="words"
              editable={!loading}
            />
          </View>

          {/* E-mail */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIconContainer}>
              <Mail color="#9CA3AF" size={20} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor="#9CA3AF"
              value={formData.email}
              onChangeText={(text) =>
                setFormData({ ...formData, email: text })
              }
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          {/* Telefone */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIconContainer}>
              <Phone color="#9CA3AF" size={20} />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Telefone (opcional)"
              placeholderTextColor="#9CA3AF"
              value={formData.phone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>

          {/* Botão Cadastrar */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Criar Conta</Text>
            )}
          </TouchableOpacity>

          {/* Link para Login */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem uma conta?</Text>
            <TouchableOpacity
              onPress={() => router.push("/auth/login")}
              disabled={loading}
            >
              <Text style={styles.footerLink}>Fazer Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#18181B",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#27272A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#3F3F46",
    paddingHorizontal: 16,
  },
  inputIconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
    paddingVertical: 16,
  },
  button: {
    backgroundColor: "#DC2626",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    gap: 4,
  },
  footerText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  footerLink: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "600",
  },
});