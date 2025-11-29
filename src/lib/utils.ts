// src/lib/api/utils.ts - VERSÃO FINAL CORRIGIDA
import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

// Combina múltiplos estilos
export function combineStyles(...styles: any[]) {
  return StyleSheet.flatten(styles.filter(Boolean));
}

// Utilitário para className (similar ao Tailwind)
export function classNames(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

// Helper para responsive width
export function wp(percentage: number): number {
  return (percentage * width) / 100;
}

// Helper para responsive height
export function hp(percentage: number): number {
  return (percentage * height) / 100;
}

// Verifica se é iOS
export const isIOS = Platform.OS === 'ios';

// Verifica se é Android
export const isAndroid = Platform.OS === 'android';

// Formatação de moeda brasileira
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Formatação de data
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-BR');
}

// Formatação de data e hora
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString('pt-BR');
}

// Validação de email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validação de CPF (básica)
export function isValidCPF(cpf: string): boolean {
  const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
  return cpfRegex.test(cpf);
}

// Formata CPF
export function formatCPF(cpf: string): string {
  const numbers = cpf.replace(/\D/g, '');
  if (numbers.length <= 11) {
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  return cpf;
}

// Debounce function COMPLETAMENTE CORRIGIDA para React Native
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// Versão alternativa mais simples do debounce (se a acima ainda der problema)
export function simpleDebounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: any = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// Storage helpers
export const storageKeys = {
  USER_TOKEN: 'userToken',
  USER_DATA: 'userData', 
  USER_TYPE: 'userType',
  CLIENT_DATA: 'clientData',
  MESAS_DATA: '@Capone:mesas'
} as const;

// Sleep function para testes
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}