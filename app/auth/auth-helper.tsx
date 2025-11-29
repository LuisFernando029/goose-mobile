// app/auth/auth-helper.ts - ARQUIVO LOCAL SIMPLIFICADO
import AsyncStorage from '@react-native-async-storage/async-storage';

export const loginUser = async (credentials: {email: string, password: string}) => {
  // Simulação de login - substitua pela sua API real
  if (credentials.email === "admin@capone.com" && credentials.password === "admin123") {
    return {
      token: "admin-token",
      user: {
        id: "1",
        name: "Admin",
        email: "admin@capone.com",
        role: "admin"
      }
    };
  }
  throw new Error("Credenciais inválidas");
};

export const logoutUser = async () => {
  await AsyncStorage.multiRemove([
    'userToken', 
    'userData', 
    'userType',
    'clientData',
    '@Capone:mesas'
  ]);
};