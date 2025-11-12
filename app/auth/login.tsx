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

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://192.168.0.15:4000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: senha }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Erro ao fazer login");

      // Salva token e usuário
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      // Redireciona
      router.replace("/(tabs)");
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
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            {/* <Image
              source={require("../../assets/caponelogo.jpg")}
              style={styles.logo}
              resizeMode="cover"
            /> */}
          </View>

          <Text style={styles.title}>Acesso Exclusivo</Text>
          <Text style={styles.subtitle}>Login para funcionários</Text>
          <View style={styles.redLine} />

          {/* Formulário */}
          <View style={{ width: "100%", marginTop: 20 }}>
            {/* Email */}
            <View style={styles.inputGroup}>
              <User size={20} color="#9CA3AF" style={styles.iconLeft} />
              <TextInput
                placeholder="seu.email@capone.com"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Senha */}
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

            {/* Botão */}
            <TouchableOpacity
              onPress={handleLogin}
              style={[styles.button, loading && { opacity: 0.8 }]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        </View>

        {/* Rodapé */}
        <Text style={styles.footer}>
          © {new Date().getFullYear()} Capone. Todos os direitos reservados.
        </Text>
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
    maxWidth: 380,
    alignItems: "center",
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#DC2626",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFF",
    marginTop: 10,
  },
  subtitle: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  redLine: {
    height: 2,
    width: 60,
    backgroundColor: "#DC2626",
    marginTop: 8,
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
    paddingVertical: 10,
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
  footer: {
    color: "#9CA3AF",
    fontSize: 12,
    textAlign: "center",
    marginTop: 30,
  },
});
