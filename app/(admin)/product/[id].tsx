import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  Alert, ActivityIndicator, ScrollView, Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Save, Trash2 } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- CONFIGURAÇÃO ---
// Use o MESMO IP que está funcionando no seu cardapio.tsx
const MEU_IP = '10.188.227.122'; 
const NODE_PORT = '4000';
const API_URL = `http://${MEU_IP}:${NODE_PORT}`;

// --- CORES DO TEMA ---
const colors = {
  background: '#18181B', // Fundo escuro (Zinc-900)
  surface: '#27272A',    // Cards (Zinc-800)
  inputBg: '#3F3F46',    // Input (Zinc-700)
  primary: '#DC2626',    // Vermelho (Red-600)
  text: '#FFFFFF',
  textSecondary: '#A1A1AA',
  border: '#3F3F46',
  danger: '#EF4444',
};

export default function EditProductScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  // Verifica se é criação de produto novo
  const isNew = id === 'new';

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // --- CAMPOS DO FORMULÁRIO ---
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState(''); // Quantidade (Foco principal)
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(''); // ID da categoria selecionada
  
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    loadScreenData();
  }, [id]);

  const loadScreenData = async () => {
    setIsLoading(true);
    try {
      // 1. Busca Categorias (Necessário para Novo e Editar)
      const catRes = await fetch(`${API_URL}/categories`);
      const catData = await catRes.json();
      setCategories(catData);

      // 2. Se for NOVO, para por aqui (não busca produto)
      if (isNew) {
        setIsLoading(false);
        return; 
      }

      // 3. Se for EDITAR, busca os dados do produto
      const prodRes = await fetch(`${API_URL}/products/${id}`);
      
      if (!prodRes.ok) {
        throw new Error(`Erro API: ${prodRes.status}`);
      }
      
      const product = await prodRes.json();

      // Preenche os campos
      setName(product.name || '');
      setQuantity(String(product.quantity || 0)); // Garante string para o input
      setPrice(String(product.price || 0));
      setDescription(product.description || '');
      
      // Tenta achar o ID da categoria
      // Se seu backend retorna objeto category: { id: 1, name: '...' }
      // ou se retorna apenas category_id: 1
      const catId = product.category_id || product.category?.id || '';
      setCategoryId(String(catId));

    } catch (error) {
      console.log('ERRO AO CARREGAR:', error);
      Alert.alert('Erro', 'Falha ao carregar dados do produto.');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    // Validação básica
    if (!name || !price) {
      Alert.alert('Atenção', 'Nome e Preço são obrigatórios');
      return;
    }

    setIsSaving(true);
    try {
      const method = isNew ? 'POST' : 'PUT';
      const url = isNew ? `${API_URL}/products` : `${API_URL}/products/${id}`;

      // Monta o objeto para enviar ao Node
      // Importante: Converter strings numéricas para números reais
      const payload = {
        name,
        quantity: parseInt(quantity) || 0,        // Converte para Inteiro
        price: parseFloat(price.replace(',', '.')), // Converte para Float (aceita virgula)
        description,
        // Envia o ID da categoria se selecionado, senão envia null ou 1 (Geral)
        category_id: categoryId ? parseInt(categoryId) : null 
      };

      console.log('Enviando:', payload); // Debug no console

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        Alert.alert(
          'Sucesso', 
          isNew ? 'Produto criado!' : 'Produto atualizado!', 
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        const errText = await response.text();
        throw new Error(errText || 'Erro ao salvar no servidor');
      }
    } catch (error) {
      console.log('ERRO AO SALVAR:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir',
      'Tem certeza que deseja apagar este produto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
              if (res.ok) {
                Alert.alert('Sucesso', 'Produto excluído.', [{ text: 'OK', onPress: () => router.back() }]);
              } else {
                throw new Error('Falha ao excluir');
              }
            } catch (e) {
              Alert.alert('Erro', 'Não foi possível excluir.');
            }
          }
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.title}>
          {isNew ? 'Novo Produto' : 'Editar Produto'}
        </Text>
        
        {!isNew ? (
          <TouchableOpacity onPress={handleDelete} style={styles.iconBtn}>
            <Trash2 size={24} color={colors.danger} />
          </TouchableOpacity>
        ) : (
          <View style={{width: 40}} /> 
        )}
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        
        {/* NOME (Principal) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome do Item</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholderTextColor={colors.textSecondary}
            placeholder="Ex: Coca-Cola Lata"
          />
        </View>

        {/* QUANTIDADE / ESTOQUE (Principal) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Quantidade em Estoque</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* PREÇO E CATEGORIA (Linha Dupla) */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Preço (R$)</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        {/* LISTA DE CATEGORIAS (Seleção) */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Categoria</Text>
          <View style={styles.categoriesContainer}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryPill,
                  // Verifica se o ID bate (convertendo pra string pra garantir)
                  String(categoryId) === String(cat.id) && styles.categoryPillActive
                ]}
                onPress={() => setCategoryId(String(cat.id))}
              >
                <Text style={[
                  styles.categoryText,
                  String(categoryId) === String(cat.id) && styles.categoryTextActive
                ]}>
                  {cat.name || cat.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* DESCRIÇÃO */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descrição (Opcional)</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Save size={20} color="#FFF" style={{marginRight: 8}} />
              <Text style={styles.saveText}>
                {isNew ? 'Criar Produto' : 'Salvar Alterações'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 20, borderBottomWidth: 1, borderColor: colors.border 
  },
  title: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  iconBtn: { padding: 8 },

  form: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  row: { flexDirection: 'row' },
  
  label: { 
    color: colors.textSecondary, marginBottom: 8, fontSize: 14, fontWeight: '600' 
  },
  input: { 
    backgroundColor: colors.inputBg, color: colors.text, 
    padding: 16, borderRadius: 12, fontSize: 16, 
    borderWidth: 1, borderColor: colors.border 
  },

  categoriesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryPill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border
  },
  categoryPillActive: {
    backgroundColor: colors.primary, borderColor: colors.primary
  },
  categoryText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  categoryTextActive: { color: '#FFF' },

  footer: { 
    padding: 20, borderTopWidth: 1, borderColor: colors.border, 
    backgroundColor: colors.background 
  },
  saveButton: { 
    backgroundColor: colors.primary, flexDirection: 'row', 
    justifyContent: 'center', alignItems: 'center', 
    padding: 16, borderRadius: 12 
  },
  saveText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});