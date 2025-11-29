// src/lib/api/auth.ts - CORRIGIDO
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.15:4000';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  message?: string;
}

export async function registerUser(formData: RegisterData): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erro no registro");
    return data;
  } catch (error) {
    console.error('Erro no registro:', error);
    throw error;
  }
}

export async function loginUser(formData: LoginData): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Erro no login");
    
    // Salvar token e dados no AsyncStorage
    if (data.token) {
      await AsyncStorage.setItem('userToken', data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));
      await AsyncStorage.setItem('userType', data.user.role);
    }
    
    return data;
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([
      'userToken', 
      'userData', 
      'userType',
      'clientData',
      '@Capone:mesas'
    ]);
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
}

export async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('userToken');
  } catch (error) {
    console.error('Erro ao obter token:', error);
    return null;
  }
}

export async function getCurrentUser(): Promise<any | null> {
  try {
    const userData = await AsyncStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const token = await getAuthToken();
    return !!token;
  } catch (error) {
    return false;
  }
}

export async function getUserType(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem('userType');
  } catch (error) {
    console.error('Erro ao obter tipo de usuário:', error);
    return null;
  }
}