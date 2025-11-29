import { CheckCircle2, ChefHat, Clock, Search, XCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

type PedidoStatus = 'pendente' | 'preparando' | 'pronto' | 'entregue' | 'cancelado';

interface ItemPedido {
  id: string;
  nome: string;
  quantidade: number;
  preco: number;
}

interface Pedido {
  id: string;
  numero: number;
  mesa: number;
  itens: ItemPedido[];
  status: PedidoStatus;
  total: number;
  horario: string;
  observacoes?: string;
}

const pedidosIniciais: Pedido[] = [
  {
    id: '1',
    numero: 1,
    mesa: 5,
    itens: [
      { id: '1', nome: 'Vinho Tinto Reserva', quantidade: 1, preco: 89.9 },
      { id: '2', nome: 'Tábua de Queijos', quantidade: 1, preco: 45.0 },
    ],
    status: 'pendente',
    total: 134.9,
    horario: '19:30',
    observacoes: 'Cliente pediu vinho bem gelado',
  },
  {
    id: '2',
    numero: 2,
    mesa: 3,
    itens: [
      { id: '3', nome: 'Cerveja IPA Artesanal', quantidade: 2, preco: 18.0 },
      { id: '4', nome: 'Bruschetta', quantidade: 1, preco: 28.0 },
    ],
    status: 'preparando',
    total: 64.0,
    horario: '19:45',
  },
  {
    id: '3',
    numero: 3,
    mesa: 8,
    itens: [
      { id: '5', nome: 'Gin Tônica Premium', quantidade: 2, preco: 32.0 },
      { id: '6', nome: 'Carpaccio', quantidade: 1, preco: 42.0 },
    ],
    status: 'pronto',
    total: 106.0,
    horario: '20:00',
  },
  {
    id: '4',
    numero: 4,
    mesa: 12,
    itens: [{ id: '7', nome: 'Vinho Branco Seco', quantidade: 1, preco: 75.0 }],
    status: 'entregue',
    total: 75.0,
    horario: '18:50',
  },
];

export default function PedidosScreen() {
  const [pedidos, setPedidos] = useState<Pedido[]>(pedidosIniciais);
  const [busca, setBusca] = useState('');
  const colorScheme = useColorScheme();
  const darkMode = colorScheme === 'dark';

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

  const atualizarStatus = (pedidoId: string, novoStatus: PedidoStatus) => {
    setPedidos((prev) =>
      prev.map((p) => (p.id === pedidoId ? { ...p, status: novoStatus } : p))
    );
  };

  const pedidosFiltrados = pedidos.filter((pedido) =>
    pedido.numero.toString().includes(busca) ||
    pedido.mesa.toString().includes(busca) ||
    pedido.itens.some((item) =>
      item.nome.toLowerCase().includes(busca.toLowerCase())
    )
  );

  const estatisticas = {
    pendentes: pedidos.filter((p) => p.status === 'pendente').length,
    preparando: pedidos.filter((p) => p.status === 'preparando').length,
    prontos: pedidos.filter((p) => p.status === 'pronto').length,
  };

  const getStatusLabel = (status: PedidoStatus) => {
    const labels: Record<PedidoStatus, string> = {
      pendente: 'Pendente',
      preparando: 'Preparando',
      pronto: 'Pronto',
      entregue: 'Entregue',
      cancelado: 'Cancelado',
    };
    return labels[status];
  };

  const getStatusColor = (status: PedidoStatus) => {
    switch (status) {
      case 'preparando':
        return theme.warning;
      case 'pronto':
        return theme.success;
      default:
        return theme.border; // neutro para os demais
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: theme.foreground }]}>Gestão de Pedidos</Text>
        <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
          Acompanhe e gerencie os pedidos em tempo real 🍷
        </Text>

        {/* Estatísticas */}
        <View style={styles.statsRow}>
          {[
            { label: 'Pendentes', value: estatisticas.pendentes },
            { label: 'Em Preparo', value: estatisticas.preparando },
            { label: 'Prontos', value: estatisticas.prontos },
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
            placeholder="Buscar por número, mesa ou item..."
            placeholderTextColor={theme.mutedForeground}
            value={busca}
            onChangeText={setBusca}
            style={[styles.input, { color: theme.foreground }]}
          />
        </View>

        {/* Pedidos */}
        {pedidosFiltrados.length > 0 ? (
          pedidosFiltrados.map((pedido) => (
            <View
              key={pedido.id}
              style={[
                styles.card,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.pedidoTitle, { color: theme.foreground }]}>
                    Pedido #{pedido.numero} — Mesa {pedido.mesa}
                  </Text>
                  <View style={styles.horario}>
                    <Clock size={15} color={theme.mutedForeground} />
                    <Text style={[styles.horarioTexto, { color: theme.mutedForeground }]}>
                      {pedido.horario}
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
                          pedido.status === 'preparando' ||
                          pedido.status === 'pronto'
                            ? '#000'
                            : theme.mutedForeground,
                      },
                    ]}
                  >
                    {getStatusLabel(pedido.status)}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                {pedido.itens.map((item) => (
                  <View key={item.id} style={styles.itemRow}>
                    <Text style={[styles.itemName, { color: theme.foreground }]}>
                      {item.quantidade}x {item.nome}
                    </Text>
                    <Text style={[styles.itemPrice, { color: theme.primary }]}>
                      R$ {(item.preco * item.quantidade).toFixed(2)}
                    </Text>
                  </View>
                ))}

                {pedido.observacoes && (
                  <View style={[styles.observacoes, { backgroundColor: theme.background }]}>
                    <Text style={[styles.observacaoTexto, { color: theme.mutedForeground }]}>
                      💬 <Text style={{ color: theme.foreground }}>{pedido.observacoes}</Text>
                    </Text>
                  </View>
                )}

                <View style={[styles.totalRow, { borderTopColor: theme.border }]}>
                  <Text style={[styles.totalTexto, { color: theme.foreground }]}>
                    Total:{' '}
                    <Text style={{ color: theme.primary }}>R$ {pedido.total.toFixed(2)}</Text>
                  </Text>

                  <View style={styles.botoes}>
                    {pedido.status === 'pendente' && (
                      <TouchableOpacity
                        style={[
                          styles.botao,
                          { backgroundColor: darkMode ? theme.buttonDark : theme.buttonLight },
                        ]}
                        onPress={() => atualizarStatus(pedido.id, 'preparando')}
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
                    {pedido.status === 'preparando' && (
                      <TouchableOpacity
                        style={[
                          styles.botao,
                          { backgroundColor: darkMode ? theme.buttonDark : theme.buttonLight },
                        ]}
                        onPress={() => atualizarStatus(pedido.id, 'pronto')}
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
                    {(pedido.status === 'pendente' || pedido.status === 'preparando') && (
                      <TouchableOpacity
                        style={[
                          styles.botao,
                          { backgroundColor: darkMode ? theme.buttonDark : theme.buttonLight },
                        ]}
                        onPress={() => atualizarStatus(pedido.id, 'cancelado')}
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
          ))
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingTop: 40 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 20 },
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
  input: { flex: 1, paddingVertical: 6, fontSize: 14 },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pedidoTitle: { fontSize: 17, fontWeight: '600' },
  horario: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  horarioTexto: { fontSize: 12 },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  cardBody: { marginTop: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 3 },
  itemName: { fontSize: 14 },
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
  botoes: { flexDirection: 'row', gap: 8 },
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
});
