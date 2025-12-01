import { CheckCircle2, ChefHat, Clock, Search, XCircle, RefreshCw, Plus, X, Sandwich, Coffee, Cookie, Salad, MessageSquare } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

type PedidoStatus = 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

interface ItemPedido {
  id: number;
  quantity: number;
  unitPrice: string;
  notes: string | null;
  product: {
    id: number;
    name: string;
    description: string | null;
    price: string;
    category: string | null;
    image: string | null;
    isAvailable: boolean;
    quantity: number;
    createdAt: string;
  };
}

interface Pedido {
  id: number;
  customerName: string;
  status: PedidoStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  table: {
    id: string;
    label: string;
    seats: number;
    status: string;
    tipo: string;
    x: number;
    y: number;
    width: number;
    height: number;
    lock: boolean;
  } | null;
  items: ItemPedido[];
}

interface Mesa {
  id: string;
  label: string;
  seats: number;
  status: string;
  tipo: string;
}

interface Produto {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  price: string;
  isAvailable: boolean;
  quantity: number;
}

const BASE_URL = "http://192.168.15.68:4000";

const CATEGORIAS = [
  { nome: 'Lanches', key: 'lanches', icon: Sandwich, color: '#DC2626' },
  { nome: 'Bebidas', key: 'bebidas', icon: Coffee, color: '#2563EB' },
  { nome: 'Acompanhamentos', key: 'acompanhamentos', icon: Salad, color: '#059669' },
  { nome: 'Sobremesas', key: 'sobremesas', icon: Cookie, color: '#EAB308' },
];

export default function PedidosScreen() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const darkMode = colorScheme === 'dark';

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [selectedItems, setSelectedItems] = useState<{ productId: number; quantity: number; name: string; price: string }[]>([]);
  const [loadingModal, setLoadingModal] = useState(false);
  const [buscaProduto, setBuscaProduto] = useState('');
  const [observacao, setObservacao] = useState('');

  const theme = {
    background: darkMode ? '#18181B' : '#F9FAFB',
    card: darkMode ? '#27272A' : '#FFFFFF',
    border: darkMode ? '#3F3F46' : '#E5E7EB',
    foreground: darkMode ? '#F5F5F5' : '#111827',
    mutedForeground: darkMode ? '#9CA3AF' : '#6B7280',
    primary: '#DC2626',
    success: '#22C55E',
    warning: '#FACC15',
    destructive: '#EF4444',
    buttonDark: '#18181B',
    buttonLight: '#FFFFFF',
  };

  useEffect(() => {
    loadPedidos();
  }, []);

  const loadPedidos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/orders`);

      if (!response.ok) {
        throw new Error(`Erro ao buscar pedidos: ${response.status}`);
      }

      const data = await response.json();
      setPedidos(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      Alert.alert("Erro", `Não foi possível carregar os pedidos: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const loadMesas = async () => {
    try {
      const response = await fetch(`${BASE_URL}/tables`);
      if (!response.ok) throw new Error('Erro ao carregar mesas');
      
      const data = await response.json();
      const mesasData = data.filter((m: Mesa) => m.tipo === 'mesa');
      setMesas(mesasData);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível carregar as mesas');
    }
  };

  const loadProdutos = async () => {
    try {
      const response = await fetch(`${BASE_URL}/products`);
      if (!response.ok) throw new Error('Erro ao carregar produtos');
      
      const data = await response.json();
      const produtosDisponiveis = data.filter((p: Produto) => p.isAvailable && p.quantity > 0);
      setProdutos(produtosDisponiveis);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível carregar os produtos');
    }
  };

  const openModal = async () => {
    setModalVisible(true);
    setLoadingModal(true);
    await Promise.all([loadMesas(), loadProdutos()]);
    setLoadingModal(false);
  };

  const closeModal = () => {
    setModalVisible(false);
    setCustomerName('');
    setSelectedTable(null);
    setSelectedItems([]);
    setBuscaProduto('');
    setObservacao('');
  };

  const addItem = (produto: Produto) => {
    const existingItem = selectedItems.find(item => item.productId === produto.id);
    
    if (existingItem) {
      setSelectedItems(prev =>
        prev.map(item =>
          item.productId === produto.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setSelectedItems(prev => [
        ...prev,
        { productId: produto.id, quantity: 1, name: produto.name, price: produto.price }
      ]);
    }
  };

  const removeItem = (productId: number) => {
    setSelectedItems(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setSelectedItems(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const getProdutosPorCategoria = (categoriaKey: string) => {
    const produtosDaCategoria = produtos.filter(p => 
      p.category?.toLowerCase() === categoriaKey.toLowerCase()
    );

    // Filtra pela busca se houver texto digitado
    if (buscaProduto.trim()) {
      return produtosDaCategoria.filter(p =>
        p.name.toLowerCase().includes(buscaProduto.toLowerCase()) ||
        p.description?.toLowerCase().includes(buscaProduto.toLowerCase())
      );
    }

    return produtosDaCategoria;
  };

  const getProdutosFiltrados = () => {
    if (!buscaProduto.trim()) {
      return [];
    }

    return produtos.filter(p =>
      p.name.toLowerCase().includes(buscaProduto.toLowerCase()) ||
      p.description?.toLowerCase().includes(buscaProduto.toLowerCase())
    );
  };

  const criarPedido = async () => {
    if (!customerName.trim()) {
      Alert.alert('Erro', 'Nome do cliente é obrigatório');
      return;
    }

    if (selectedItems.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um item ao pedido');
      return;
    }

    try {
      setLoadingModal(true);

      const body = {
        customerName: customerName.trim(),
        tableId: selectedTable || undefined,
        notes: observacao.trim() || null,
        items: selectedItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };

      const response = await fetch(`${BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar pedido');
      }

      const novoPedido = await response.json();

      setPedidos(prev => [novoPedido, ...prev]);
      Alert.alert('Sucesso', 'Pedido criado com sucesso!');
      closeModal();
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoadingModal(false);
    }
  };

  const calcularTotalModal = () => {
    return selectedItems.reduce((total, item) => {
      return total + (Number(item.price) * item.quantity);
    }, 0);
  };

  const atualizarStatus = async (pedidoId: number, novoStatus: PedidoStatus) => {
    try {
      const response = await fetch(`${BASE_URL}/orders/${pedidoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: novoStatus }),
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar status');
      }

      const updatedOrder = await response.json();

      setPedidos((prev) =>
        prev.map((p) => (p.id === pedidoId ? { ...p, ...updatedOrder } : p))
      );

      Alert.alert('Sucesso', 'Status do pedido atualizado!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      Alert.alert('Erro', `Não foi possível atualizar o status do pedido: ${errorMessage}`);
      console.error('Erro ao atualizar status:', err);
    }
  };

  const calcularTotal = (items: ItemPedido[]) => {
    return items.reduce((total, item) => {
      return total + (Number(item.unitPrice) * item.quantity);
    }, 0);
  };

  const formatarHorario = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const pedidosFiltrados = pedidos.filter((pedido) =>
    pedido.id.toString().includes(busca) ||
    pedido.customerName.toLowerCase().includes(busca.toLowerCase()) ||
    pedido.table?.label.toLowerCase().includes(busca.toLowerCase()) ||
    pedido.items.some((item) =>
      item.product.name.toLowerCase().includes(busca.toLowerCase())
    )
  );

  const estatisticas = {
    pendentes: pedidos.filter((p) => p.status === 'pending').length,
    preparando: pedidos.filter((p) => p.status === 'preparing').length,
    prontos: pedidos.filter((p) => p.status === 'ready').length,
  };

  const getStatusLabel = (status: PedidoStatus) => {
    const labels: Record<PedidoStatus, string> = {
      pending: 'Pendente',
      preparing: 'Preparando',
      ready: 'Pronto',
      delivered: 'Entregue',
      cancelled: 'Cancelado',
    };
    return labels[status];
  };

  const getStatusColor = (status: PedidoStatus) => {
    switch (status) {
      case 'preparing':
        return theme.warning;
      case 'ready':
        return theme.success;
      case 'cancelled':
        return theme.destructive;
      case 'delivered':
        return theme.mutedForeground;
      default:
        return theme.border;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.mutedForeground }]}>
            Carregando pedidos...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && pedidos.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.centerContent}>
          <Text style={[styles.errorTitle, { color: theme.destructive }]}>
            Erro ao carregar pedidos
          </Text>
          <Text style={[styles.errorText, { color: theme.mutedForeground }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={loadPedidos}
          >
            <RefreshCw size={20} color="#FFF" />
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const produtosFiltrados = getProdutosFiltrados();
  const temBusca = buscaProduto.trim().length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.foreground }]}>Gestão de Pedidos</Text>
            <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
              Acompanhe e gerencie os pedidos em tempo real 🍷
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.refreshIconButton, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={loadPedidos}
            disabled={loading}
          >
            <RefreshCw size={20} color={theme.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Botão Novo Pedido */}
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={openModal}
        >
          <Plus color="#FFF" size={18} />
          <Text style={styles.addButtonText}>Novo Pedido</Text>
        </TouchableOpacity>

        {/* Estatísticas */}
        <View style={styles.statsRow}>
          {[{
            label: 'Pendentes',
            value: estatisticas.pendentes
          }, 
          {
            label: 'Em Preparo',
            value: estatisticas.preparando
          },
          {
            label: 'Prontos',
            value: estatisticas.prontos
          }
          ].map((stat, index) => (
            <View
              key={index}
              style={[
                styles.statCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.statLabel, { color: theme.mutedForeground }]}>
                {stat.label}
              </Text>
              <Text style={[styles.statValue, { color: theme.primary }]}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* Busca */}
        <View
          style={[
            styles.searchCard,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Search color={theme.mutedForeground} size={18} />
          <TextInput
            placeholder="Buscar por número, cliente, mesa ou item..."
            placeholderTextColor={theme.mutedForeground}
            value={busca}
            onChangeText={setBusca}
            style={[styles.input, { color: theme.foreground }]}
          />
        </View>

        {/* Pedidos */}
        {pedidosFiltrados.length > 0 ? (
          pedidosFiltrados.map((pedido) => {
            const total = calcularTotal(pedido.items);
            
            return (
              <View
                key={pedido.id}
                style={[
                  styles.card,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pedidoTitle, { color: theme.foreground }]}>
                      Pedido #{pedido.id} 
                      {pedido.table && ` — ${pedido.table.label}`}
                    </Text>
                    <Text style={[styles.customerName, { color: theme.mutedForeground }]}>
                      Cliente: {pedido.customerName}
                    </Text>
                    <View style={styles.horario}>
                      <Clock size={15} color={theme.mutedForeground} />
                      <Text style={[styles.horarioTexto, { color: theme.mutedForeground }]}>
                        {formatarHorario(pedido.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: getStatusColor(pedido.status) },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        {
                          color:
                            pedido.status === 'preparing' ||
                            pedido.status === 'ready'
                              ? '#000'
                              : '#FFF',
                        },
                      ]}
                    >
                      {getStatusLabel(pedido.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardBody}>
                  {pedido.items.map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                      <Text style={[styles.itemName, { color: theme.foreground }]}>
                        {item.quantity}x {item.product.name}
                      </Text>
                      <Text style={[styles.itemPrice, { color: theme.primary }]}>
                        R$ {(Number(item.unitPrice) * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  ))}

                  {pedido.notes && (
                    <View style={[styles.observacoes, { backgroundColor: theme.background }]}>
                      <Text style={[styles.observacaoTexto, { color: theme.mutedForeground }]}>
                        💬 <Text style={{ color: theme.foreground }}>{pedido.notes}</Text>
                      </Text>
                    </View>
                  )}

                  <View style={[styles.totalRow, { borderTopColor: theme.border }]}>
                    <Text style={[styles.totalTexto, { color: theme.foreground }]}>
                      Total:{' '}
                      <Text style={{ color: theme.primary }}>R$ {total.toFixed(2)}</Text>
                    </Text>

                    <View style={styles.botoes}>
                      {pedido.status === 'pending' && (
                        <TouchableOpacity
                          style={[
                            styles.botao,
                            { backgroundColor: darkMode ? theme.buttonDark : theme.buttonLight },
                          ]}
                          onPress={() => atualizarStatus(pedido.id, 'preparing')}
                        >
                          <ChefHat size={16} color={darkMode ? '#FFF' : '#000'} />
                          <Text
                            style={[
                              styles.botaoTexto,
                              { color: darkMode ? '#FFF' : '#000' },
                            ]}
                          >
                            Iniciar
                          </Text>
                        </TouchableOpacity>
                      )}
                      {pedido.status === 'preparing' && (
                        <TouchableOpacity
                          style={[
                            styles.botao,
                            { backgroundColor: darkMode ? theme.buttonDark : theme.buttonLight },
                          ]}
                          onPress={() => atualizarStatus(pedido.id, 'ready')}
                        >
                          <CheckCircle2 size={16} color={darkMode ? '#FFF' : '#000'} />
                          <Text
                            style={[
                              styles.botaoTexto,
                              { color: darkMode ? '#FFF' : '#000' },
                            ]}
                          >
                            Pronto
                          </Text>
                        </TouchableOpacity>
                      )}
                      {pedido.status === 'ready' && (
                        <TouchableOpacity
                          style={[
                            styles.botao,
                            { backgroundColor: darkMode ? theme.buttonDark : theme.buttonLight },
                          ]}
                          onPress={() => atualizarStatus(pedido.id, 'delivered')}
                        >
                          <CheckCircle2 size={16} color={darkMode ? '#FFF' : '#000'} />
                          <Text
                            style={[
                              styles.botaoTexto,
                              { color: darkMode ? '#FFF' : '#000' },
                            ]}
                          >
                            Entregar
                          </Text>
                        </TouchableOpacity>
                      )}
                      {(pedido.status === 'pending' || pedido.status === 'preparing') && (
                        <TouchableOpacity
                          style={[
                            styles.botao,
                            { backgroundColor: darkMode ? theme.buttonDark : theme.buttonLight },
                          ]}
                          onPress={() => atualizarStatus(pedido.id, 'cancelled')}
                        >
                          <XCircle size={16} color={darkMode ? '#FFF' : '#000'} />
                          <Text
                            style={[
                              styles.botaoTexto,
                              { color: darkMode ? '#FFF' : '#000' },
                            ]}
                          >
                            Cancelar
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Text style={[styles.empty, { color: theme.mutedForeground }]}>
              Nenhum pedido encontrado
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal Novo Pedido */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.foreground }]}>Novo Pedido</Text>
              <TouchableOpacity onPress={closeModal}>
                <X size={24} color={theme.mutedForeground} />
              </TouchableOpacity>
            </View>

            {loadingModal ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.mutedForeground }]}>
                  Carregando dados...
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.modalBody}>
                {/* Nome do Cliente */}
                <Text style={[styles.modalLabel, { color: theme.foreground }]}>
                  Nome do Cliente *
                </Text>
                <TextInput
                  style={[styles.modalInput, { 
                    backgroundColor: theme.background, 
                    color: theme.foreground,
                    borderColor: theme.border 
                  }]}
                  placeholder="Digite o nome do cliente"
                  placeholderTextColor={theme.mutedForeground}
                  value={customerName}
                  onChangeText={setCustomerName}
                />

                {/* Seleção de Mesa */}
                <Text style={[styles.modalLabel, { color: theme.foreground }]}>
                  Mesa (Opcional)
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.mesasScroll}>
                  <TouchableOpacity
                    style={[
                      styles.mesaChip,
                      !selectedTable && styles.mesaChipSelected,
                      { 
                        backgroundColor: !selectedTable ? theme.primary : theme.background,
                        borderColor: theme.border 
                      }
                    ]}
                    onPress={() => setSelectedTable(null)}
                  >
                    <Text style={[styles.mesaChipText, { color: !selectedTable ? '#FFF' : theme.foreground }]}>
                      Sem mesa
                    </Text>
                  </TouchableOpacity>
                  {mesas.map((mesa) => {
                    const mesaOcupada = mesa.status === 'busy';
                    const mesaReservada = mesa.status === 'reserved';
                    
                    return (
                      <TouchableOpacity
                        key={mesa.id}
                        style={[
                          styles.mesaChip,
                          selectedTable === mesa.id && styles.mesaChipSelected,
                          { 
                            backgroundColor: selectedTable === mesa.id ? theme.primary : theme.background,
                            borderColor: mesaOcupada ? '#DC2626' : mesaReservada ? '#EAB308' : theme.border,
                          }
                        ]}
                        onPress={() => setSelectedTable(mesa.id)}
                      >
                        <Text style={[styles.mesaChipText, { color: selectedTable === mesa.id ? '#FFF' : theme.foreground }]}>
                          {mesa.label}
                          {mesaOcupada && ' 🔴'}
                          {mesaReservada && ' 🟡'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Observações */}
                <Text style={[styles.modalLabel, { color: theme.foreground }]}>
                  Observações (Opcional)
                </Text>
                <View style={[styles.observacaoContainer, { backgroundColor: theme.background, borderColor: theme.border }]}
                >
                  <MessageSquare size={18} color={theme.mutedForeground} />
                  <TextInput
                    style={[styles.observacaoInput, { color: theme.foreground }]}
                    placeholder="Ex: Sem cebola, pouco sal..."
                    placeholderTextColor={theme.mutedForeground}
                    value={observacao}
                    onChangeText={setObservacao}
                    multiline
                    numberOfLines={3}
                    maxLength={200}
                  />
                </View>
                {observacao.length > 0 && (
                  <Text style={[styles.observacaoCounter, { color: theme.mutedForeground }]}>
                    {observacao.length}/200 caracteres
                  </Text>
                )}

                {/* Busca de Produtos */}
                <Text style={[styles.modalLabel, { color: theme.foreground }]}>
                  Adicionar Itens *
                </Text>
                <View
                  style={[
                    styles.searchCard,
                    { backgroundColor: theme.background, borderColor: theme.border, marginBottom: 16 },
                  ]}
                >
                  <Search color={theme.mutedForeground} size={18} />
                  <TextInput
                    placeholder="Buscar produto..."
                    placeholderTextColor={theme.mutedForeground}
                    value={buscaProduto}
                    onChangeText={setBuscaProduto}
                    style={[styles.input, { color: theme.foreground }]}
                  />
                  {buscaProduto.length > 0 && (
                    <TouchableOpacity onPress={() => setBuscaProduto('')}>
                      <X size={18} color={theme.mutedForeground} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Resultados da Busca / Categorias */}
                {temBusca ? (
                  produtosFiltrados.length > 0 ? (
                    <View style={styles.categoriaSection}>
                      <View style={styles.categoriaHeaderModal}>
                        <Search size={20} color={theme.primary} />
                        <Text style={[styles.categoriaTituloModal, { color: theme.foreground }]}>
                          Resultados da Busca
                        </Text>
                        <View style={[styles.categoriaBadgeModal, { backgroundColor: `${theme.primary}20` }]}>
                          <Text style={[styles.categoriaBadgeTextModal, { color: theme.primary }]}
                          >
                            {produtosFiltrados.length}
                          </Text>
                        </View>
                      </View>

                      {produtosFiltrados.map((produto) => {
                        const categoria = CATEGORIAS.find(c => c.key === produto.category?.toLowerCase());
                        const corCategoria = categoria?.color || theme.primary;
                        
                        return (
                          <TouchableOpacity
                            key={produto.id}
                            style={[styles.produtoItem, { backgroundColor: theme.background, borderColor: theme.border }]}
                            onPress={() => addItem(produto)}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.produtoNome, { color: theme.foreground }]}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                              >
                                {produto.name}
                              </Text>
                              {produto.description && (
                                <Text style={[styles.produtoDescricao, { color: theme.mutedForeground }]}
                                  numberOfLines={1}
                                >
                                  {produto.description}
                                </Text>
                              )}
                              {produto.category && (
                                <Text style={[styles.produtoCategoria, { color: corCategoria }]}>
                                  {produto.category}
                                </Text>
                              )}
                              <View style={styles.produtoFooter}>
                                <Text style={[styles.produtoPreco, { color: corCategoria }]}>
                                  R$ {Number(produto.price).toFixed(2)}
                                </Text>
                                <Text style={[styles.produtoEstoque, { color: theme.mutedForeground }]}>
                                  Estoque: {produto.quantity}
                                </Text>
                              </View>
                            </View>
                            <TouchableOpacity 
                              style={[styles.addItemButton, { backgroundColor: corCategoria }]}
                              onPress={() => addItem(produto)}
                            >
                              <Plus size={20} color="#FFF" />
                            </TouchableOpacity>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : (
                    <View style={styles.emptySearch}>
                      <Search size={40} color={theme.mutedForeground} />
                      <Text style={[styles.emptySearchText, { color: theme.mutedForeground }]}>
                        Nenhum produto encontrado
                      </Text>
                    </View>
                  )
                ) : (
                  /* Produtos por Categoria */
                  CATEGORIAS.map((categoria) => {
                    const produtosCategoria = getProdutosPorCategoria(categoria.key);
                    const CategoriaIcon = categoria.icon;

                    if (produtosCategoria.length === 0) return null;

                    return (
                      <View key={categoria.key} style={styles.categoriaSection}>
                        <View style={styles.categoriaHeaderModal}>
                          <CategoriaIcon size={20} color={categoria.color} />
                          <Text style={[styles.categoriaTituloModal, { color: theme.foreground }]}>
                            {categoria.nome}
                          </Text>
                          <View style={[styles.categoriaBadgeModal, { backgroundColor: `${categoria.color}20` }]}>
                            <Text style={[styles.categoriaBadgeTextModal, { color: categoria.color }]}
                            >
                              {produtosCategoria.length}
                            </Text>
                          </View>
                        </View>

                        {produtosCategoria.map((produto) => (
                          <TouchableOpacity
                            key={produto.id}
                            style={[styles.produtoItem, { backgroundColor: theme.background, borderColor: theme.border }]}
                            onPress={() => addItem(produto)}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={[styles.produtoNome, { color: theme.foreground }]}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                              >
                                {produto.name}
                              </Text>
                              {produto.description && (
                                <Text style={[styles.produtoDescricao, { color: theme.mutedForeground }]}
                                  numberOfLines={1}
                                >
                                  {produto.description}
                                </Text>
                              )}
                              <View style={styles.produtoFooter}>
                                <Text style={[styles.produtoPreco, { color: categoria.color }]}>
                                  R$ {Number(produto.price).toFixed(2)}
                                </Text>
                                <Text style={[styles.produtoEstoque, { color: theme.mutedForeground }]}>
                                  Estoque: {produto.quantity}
                                </Text>
                              </View>
                            </View>
                            <TouchableOpacity 
                              style={[styles.addItemButton, { backgroundColor: categoria.color }]}
                              onPress={() => addItem(produto)}
                            >
                              <Plus size={20} color="#FFF" />
                            </TouchableOpacity>
                          </TouchableOpacity>
                        ))}
                      </View>
                    );
                  })
                )}

                {/* Itens Selecionados */}
                {selectedItems.length > 0 && (
                  <>
                    <Text style={[styles.modalLabel, { color: theme.foreground, marginTop: 24 }]}
                    >
                      Itens do Pedido ({selectedItems.length})
                    </Text>
                    {selectedItems.map((item) => (
                      <View 
                        key={item.productId} 
                        style={[styles.selectedItem, { backgroundColor: theme.background, borderColor: theme.border }]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.selectedItemName, { color: theme.foreground }]}>
                            {item.name}
                          </Text>
                          <Text style={[styles.selectedItemPrice, { color: theme.primary }]}
                          >
                            R$ {(Number(item.price) * item.quantity).toFixed(2)}
                          </Text>
                        </View>
                        <View style={styles.quantityControls}>
                          <TouchableOpacity
                            style={[styles.quantityButton, { backgroundColor: theme.border }]}
                            onPress={() => updateQuantity(item.productId, item.quantity - 1)}
                          >
                            <Text style={{ color: theme.foreground }}>−</Text>
                          </TouchableOpacity>
                          <Text style={[styles.quantityText, { color: theme.foreground }]}>
                            {item.quantity}
                          </Text>
                          <TouchableOpacity
                            style={[styles.quantityButton, { backgroundColor: theme.border }]}
                            onPress={() => updateQuantity(item.productId, item.quantity + 1)}
                          >
                            <Text style={{ color: theme.foreground }}>+</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.removeButton, { backgroundColor: theme.destructive }]}
                            onPress={() => removeItem(item.productId)}
                          >
                            <X size={16} color="#FFF" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}

                    {/* Total */}
                    <View style={[styles.modalTotal, { borderTopColor: theme.border }]}>
                      <Text style={[styles.modalTotalText, { color: theme.foreground }]}
                      >
                        Total do Pedido:
                      </Text>
                      <Text style={[styles.modalTotalValue, { color: theme.primary }]}
                      >
                        R$ {calcularTotalModal().toFixed(2)}
                      </Text>
                    </View>
                  </>
                )}
              </ScrollView>
            )}

            {/* Botões de Ação */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.background, borderColor: theme.border }]}
                onPress={closeModal}
              >
                <Text style={[styles.cancelButtonText, { color: theme.foreground }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, { backgroundColor: theme.primary }]}
                onPress={criarPedido}
                disabled={loadingModal}
              >
                {loadingModal ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.confirmButtonText}>Criar Pedido</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scroll: { padding: 16, paddingTop: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 4 },
  refreshIconButton: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  addButton: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#FFF',
    marginLeft: 6,
    fontWeight: '600',
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statLabel: { fontSize: 13, marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: 'bold' },
  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 16,
  },
  input: { flex: 1, paddingVertical: 6, fontSize: 14, marginLeft: 8 },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  pedidoTitle: { fontSize: 17, fontWeight: '600', marginBottom: 2 },
  customerName: { fontSize: 13, marginBottom: 4 },
  horario: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  horarioTexto: { fontSize: 12 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  cardBody: { marginTop: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3 },
  itemName: { fontSize: 14, flex: 1 },
  itemPrice: { fontSize: 14, fontWeight: '600' },
  observacoes: { borderRadius: 8, padding: 8, marginTop: 8 },
  observacaoTexto: { fontSize: 13 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  totalTexto: { fontSize: 15, fontWeight: 'bold' },
  botoes: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  botaoTexto: { fontSize: 13, fontWeight: '600' },
  empty: { textAlign: 'center', paddingVertical: 32, fontSize: 14 },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  mesasScroll: {
    marginBottom: 8,
  },
  mesaChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  mesaChipSelected: {
    borderWidth: 2,
  },
  mesaChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoriaSection: {
    marginBottom: 20,
  },
  categoriaHeaderModal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  categoriaTituloModal: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  categoriaBadgeModal: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoriaBadgeTextModal: {
    fontSize: 11,
    fontWeight: '600',
  },
  produtoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  produtoNome: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  produtoDescricao: {
    fontSize: 12,
    marginBottom: 4,
  },
  produtoCategoria: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  produtoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  produtoPreco: {
    fontSize: 14,
    fontWeight: '700',
  },
  produtoEstoque: {
    fontSize: 11,
  },
  addItemButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySearch: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptySearchText: {
    fontSize: 14,
    marginTop: 12,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  selectedItemName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedItemPrice: {
    fontSize: 14,
    fontWeight: '700',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  modalTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
  },
  modalTotalText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalTotalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalLoading: {
    padding: 40,
    alignItems: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
  },
  confirmButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  observacaoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  observacaoInput: {
    flex: 1,
    fontSize: 14,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  observacaoCounter: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 8,
  },
});
