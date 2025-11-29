// app/auth/login-admin.tsx - VERSÃO FINAL
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Lock, User } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function LoginAdminScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@capone.com");
  const [senha, setSenha] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      if (email === "admin@capone.com" && senha === "admin123") {
        await AsyncStorage.setItem('userType', 'admin');
        await AsyncStorage.setItem('userToken', 'admin-token');
        await AsyncStorage.setItem('userData', JSON.stringify({
          id: "1",
          name: "Administrador",
          email: "admin@capone.com",
          role: "admin"
        }));
        
        router.replace('/(admin)/(tabs)');
      } else {
        throw new Error('Credenciais inválidas para administrador');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#18181B" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>👨‍💼</Text>
          </View>

          <Text style={styles.title}>Acesso Administrativo</Text>
          <Text style={styles.subtitle}>Login restrito para funcionários</Text>
          <View style={styles.redLine} />

          <View style={{ width: "100%", marginTop: 20 }}>
            <View style={styles.inputGroup}>
              <User size={20} color="#9CA3AF" style={styles.iconLeft} />
              <TextInput
                placeholder="admin@capone.com"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Lock size={20} color="#9CA3AF" style={styles.iconLeft} />
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              style={[styles.button, loading && { opacity: 0.8 }]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Entrar como Admin</Text>
              )}
            </TouchableOpacity>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
    backgroundColor: '#DC2626',
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
  redLine: {
    height: 2,
    width: 60,
    backgroundColor: "#DC2626",
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
    backgroundColor: "#DC2626",
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
  errorText: {
    color: "#EF4444",
    textAlign: "center",
    marginTop: 8,
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