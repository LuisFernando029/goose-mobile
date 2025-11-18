import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  StatusBar,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Card, Badge } from 'react-native-paper';
import Animated from 'react-native-reanimated';

import { ThemedView } from '../components/themed-view';
import { ThemedText } from '../components/themed-text';
import FuncionarioDialog from './FuncionarioDialog';
import ParallaxScrollView from '../components/parallax-scroll-view';

// Mock data inicial (mantido igual)
const funcionariosIniciais = [
  {
    id: 1,
    nome: "Carlos Mendes",
    email: "carlos.mendes@adega.com",
    telefone: "(11) 91234-5678",
    cargo: "Gerente",
    dataAdmissao: "2023-01-10",
    salario: 5500.0,
    status: "ativo",
  },
  // ... outros funcionários
];

export default function FuncionariosScreen() {
  const [funcionarios, setFuncionarios] = useState(funcionariosIniciais);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState(null);

  const filteredFuncionarios = funcionarios.filter(
    (funcionario) =>
      funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      funcionario.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      funcionario.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddFuncionario = (funcionario) => {
    const newFuncionario = {
      ...funcionario,
      id: Math.max(...funcionarios.map((f) => f.id), 0) + 1,
    };
    setFuncionarios([...funcionarios, newFuncionario]);
    setDialogOpen(false);
  };

  const handleEditFuncionario = (funcionario) => {
    setFuncionarios(funcionarios.map((f) => (f.id === funcionario.id ? funcionario : f)));
    setDialogOpen(false);
    setEditingFuncionario(null);
  };

  const handleDeleteFuncionario = (id) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este funcionário?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Excluir", 
          style: "destructive",
          onPress: () => setFuncionarios(funcionarios.filter((f) => f.id !== id))
        },
      ]
    );
  };

  const openEditDialog = (funcionario) => {
    setEditingFuncionario(funcionario);
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingFuncionario(null);
    setDialogOpen(true);
  };

  const funcionariosAtivos = funcionarios.filter((f) => f.status === "ativo").length;
  const totalFolhaPagamento = funcionarios.filter((f) => f.status === "ativo").reduce((acc, f) => acc + f.salario, 0);

  const renderFuncionarioCard = ({ item: funcionario }) => (
    <Card style={styles.funcionarioCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.funcionarioInfo}>
            <View style={styles.nameRow}>
              <ThemedText type="subtitle" style={styles.funcionarioName}>
                {funcionario.nome}
              </ThemedText>
              <Badge 
                style={[
                  styles.statusBadge,
                  funcionario.status === "ativo" ? styles.ativoBadge : styles.inativoBadge
                ]}
              >
                <ThemedText style={styles.badgeText}>
                  {funcionario.status === "ativo" ? "Ativo" : "Inativo"}
                </ThemedText>
              </Badge>
            </View>
            <Badge style={styles.cargoBadge} mode="outlined">
              <ThemedText style={styles.cargoText}>{funcionario.cargo}</ThemedText>
            </Badge>
            <View style={styles.contactInfo}>
              <View style={styles.contactRow}>
                <Icon name="email" size={16} color="#666" />
                <ThemedText style={styles.contactText}>{funcionario.email}</ThemedText>
              </View>
              <View style={styles.contactRow}>
                <Icon name="phone" size={16} color="#666" />
                <ThemedText style={styles.contactText}>{funcionario.telefone}</ThemedText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Admissão:</ThemedText>
            <ThemedText style={styles.detailValue}>
              {new Date(funcionario.dataAdmissao).toLocaleDateString("pt-BR")}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Salário:</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.salarioValue}>
              R$ {funcionario.salario.toFixed(2)}
            </ThemedText>
          </View>
          <View style={styles.actionsRow}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => openEditDialog(funcionario)}
            >
              <Icon name="pencil" size={16} color="#3b82f6" />
              <ThemedText style={styles.editButtonText}>Editar</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteFuncionario(funcionario.id)}
            >
              <Icon name="delete" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  // Header image para o ParallaxScrollView
  const HeaderImage = () => (
    <ThemedView style={styles.headerImage}>
      <Icon name="account-group" size={48} color="#ffffff" />
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ParallaxScrollView
        headerImage={<HeaderImage />}
        headerBackgroundColor={{ light: '#3b82f6', dark: '#1e40af' }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText type="title">Gestão de Funcionários</ThemedText>
            <ThemedText type="default" style={styles.subtitle}>
              Cadastro e controle de equipe
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={openAddDialog}>
            <Icon name="plus" size={20} color="white" />
            <ThemedText style={styles.addButtonText}>Novo Funcionário</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Card.Content>
              <View style={styles.statRow}>
                <View>
                  <ThemedText style={styles.statLabel}>Total de Funcionários</ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.statValue}>
                    {funcionarios.length}
                  </ThemedText>
                </View>
                <Icon name="account-group" size={24} color="#3b82f6" />
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <View style={styles.statRow}>
                <View>
                  <ThemedText style={styles.statLabel}>Funcionários Ativos</ThemedText>
                  <ThemedText type="defaultSemiBold" style={[styles.statValue, styles.activeValue]}>
                    {funcionariosAtivos}
                  </ThemedText>
                </View>
                <Icon name="account-check" size={24} color="#3b82f6" />
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content>
              <View style={styles.statRow}>
                <View>
                  <ThemedText style={styles.statLabel}>Folha de Pagamento</ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.statValue}>
                    R$ {totalFolhaPagamento.toLocaleString("pt-BR")}
                  </ThemedText>
                </View>
                <Icon name="cash" size={24} color="#3b82f6" />
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Busca */}
        <Card style={styles.searchCard}>
          <Card.Content>
            <View style={styles.searchContainer}>
              <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                placeholder="Buscar funcionários por nome, cargo ou email..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                style={styles.searchInput}
                placeholderTextColor="#999"
              />
            </View>
          </Card.Content>
        </Card>

        {/* Lista de funcionários */}
        <FlatList
          data={filteredFuncionarios}
          renderItem={renderFuncionarioCard}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Icon name="account-question" size={48} color="#999" />
              <ThemedText style={styles.emptyText}>Nenhum funcionário encontrado</ThemedText>
            </View>
          }
        />
      </ParallaxScrollView>

      {/* Diálogo para adicionar/editar funcionário */}
      <FuncionarioDialog
        visible={dialogOpen}
        onClose={() => setDialogOpen(false)}
        funcionario={editingFuncionario}
        onSave={editingFuncionario ? handleEditFuncionario : handleAddFuncionario}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 18,
  },
  activeValue: {
    color: '#3b82f6',
  },
  searchCard: {
    marginBottom: 24,
    elevation: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  listContainer: {
    gap: 16,
    paddingBottom: 32,
  },
  funcionarioCard: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  funcionarioInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  funcionarioName: {
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ativoBadge: {
    backgroundColor: '#10b981',
  },
  inativoBadge: {
    backgroundColor: '#6b7280',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  cargoBadge: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    backgroundColor: 'transparent',
    borderColor: '#3b82f6',
  },
  cargoText: {
    color: '#3b82f6',
    fontSize: 12,
  },
  contactInfo: {
    gap: 6,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    opacity: 0.7,
  },
  cardDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 14,
  },
  salarioValue: {
    color: '#3b82f6',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
});