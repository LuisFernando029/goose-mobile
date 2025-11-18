"use client";

import {
    CheckCircle2,
    Clock,
    Table2,
    Users,
    XCircle,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

interface Mesa {
  id: number;
  numero: number;
  capacidade: number;
  status: "disponivel" | "ocupada" | "reservada";
  clientes?: number;
  horarioOcupacao?: string;
  nomeReserva?: string;
}

// Mock inicial
const mesasIniciais: Mesa[] = [
  { id: 1, numero: 1, capacidade: 4, status: "ocupada", clientes: 4, horarioOcupacao: "19:30" },
  { id: 2, numero: 2, capacidade: 2, status: "disponivel" },
  { id: 3, numero: 3, capacidade: 2, status: "ocupada", clientes: 2, horarioOcupacao: "20:00" },
  { id: 4, numero: 4, capacidade: 6, status: "reservada", nomeReserva: "João Silva" },
  { id: 5, numero: 5, capacidade: 6, status: "ocupada", clientes: 6, horarioOcupacao: "19:45" },
  { id: 6, numero: 6, capacidade: 4, status: "disponivel" },
  { id: 7, numero: 7, capacidade: 2, status: "disponivel" },
  { id: 8, numero: 8, capacidade: 4, status: "ocupada", clientes: 3, horarioOcupacao: "20:15" },
  { id: 9, numero: 9, capacidade: 8, status: "disponivel" },
  { id: 10, numero: 10, capacidade: 4, status: "disponivel" },
];

export default function MesasPage() {
  const [mesas, setMesas] = useState<Mesa[]>(mesasIniciais);

  const mesasDisponiveis = mesas.filter((m) => m.status === "disponivel").length;
  const mesasOcupadas = mesas.filter((m) => m.status === "ocupada").length;
  const mesasReservadas = mesas.filter((m) => m.status === "reservada").length;

  const liberarMesa = (id: number) => {
    setMesas((mesas) =>
      mesas.map((m) =>
        m.id === id
          ? { ...m, status: "disponivel", clientes: undefined, horarioOcupacao: undefined, nomeReserva: undefined }
          : m
      )
    );
  };

  const getStatusBadge = (mesa: Mesa) => {
    switch (mesa.status) {
      case "disponivel":
        return { text: "Disponível", color: "#22C55E" };
      case "ocupada":
        return { text: "Ocupada", color: "#DC2626" };
      case "reservada":
        return { text: "Reservada", color: "#EAB308" };
      default:
        return { text: mesa.status, color: "#9CA3AF" };
    }
  };

  const getStatusIcon = (mesa: Mesa) => {
    switch (mesa.status) {
      case "disponivel":
        return <CheckCircle2 size={18} color="#22C55E" />;
      case "ocupada":
        return <XCircle size={18} color="#DC2626" />;
      case "reservada":
        return <Clock size={18} color="#EAB308" />;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Gestão de Mesas</Text>
          <Text style={styles.subtitle}>Controle de ocupação e reservas</Text>
        </View>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>{mesas.length}</Text>
            <Table2 color="#9CA3AF" size={22} />
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Disponíveis</Text>
            <Text style={[styles.statValue, { color: "#22C55E" }]}>
              {mesasDisponiveis}
            </Text>
            <CheckCircle2 color="#22C55E" size={22} />
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Ocupadas</Text>
            <Text style={[styles.statValue, { color: "#DC2626" }]}>
              {mesasOcupadas}
            </Text>
            <XCircle color="#DC2626" size={22} />
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Reservadas</Text>
            <Text style={[styles.statValue, { color: "#EAB308" }]}>
              {mesasReservadas}
            </Text>
            <Clock color="#EAB308" size={22} />
          </View>
        </View>

        {/* Lista/Grid de Mesas */}
        <View style={styles.mesasContainer}>
          {mesas.map((mesa) => {
            const badge = getStatusBadge(mesa);

            return (
              <View
                key={mesa.id}
                style={[
                  styles.card,
                  { borderColor: badge.color + "55" },
                ]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Mesa {mesa.numero}</Text>
                  <View
                    style={[
                      styles.badge,
                      { borderColor: badge.color, backgroundColor: badge.color + "22" },
                    ]}
                  >
                    {getStatusIcon(mesa)}
                  </View>
                </View>

                <Text style={styles.cardCapacidade}>
                  <Users size={14} color="#9CA3AF" /> {mesa.capacidade} lugares
                </Text>

                <View style={styles.cardStatusContainer}>
                  <Text style={[styles.cardStatus, { color: badge.color }]}>
                    {badge.text}
                  </Text>
                </View>

                {/* Ocupada */}
                {mesa.status === "ocupada" && (
                  <View style={styles.cardExtra}>
                    <Text style={styles.extraText}>{mesa.clientes} clientes</Text>
                    <Text style={styles.extraText}>Desde {mesa.horarioOcupacao}</Text>
                  </View>
                )}

                {/* Reservada */}
                {mesa.status === "reservada" && (
                  <View style={styles.cardExtra}>
                    <Text style={styles.extraText}>{mesa.nomeReserva}</Text>
                  </View>
                )}

                {/* Botão Liberar */}
                {mesa.status !== "disponivel" && (
                  <TouchableOpacity
                    style={styles.liberarButton}
                    onPress={() => liberarMesa(mesa.id)}
                  >
                    <Text style={styles.liberarText}>Liberar Mesa</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

/* ---------- ESTILOS ---------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#18181B",
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  scroll: {
    paddingBottom: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    color: "#FFF",
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 12,
  },

  /* Estatísticas */
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#27272A",
    width: width * 0.44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3F3F46",
    padding: 14,
    marginBottom: 14,
  },
  statLabel: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },

  /* Grid/lista de mesas */
  mesasContainer: {
    alignItems: "center",
  },
  card: {
    backgroundColor: "#27272A",
    width: width * 0.9,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
  badge: {
    padding: 6,
    borderWidth: 1,
    borderRadius: 8,
  },

  cardCapacidade: {
    color: "#9CA3AF",
    fontSize: 13,
    marginBottom: 10,
  },

  cardStatusContainer: {
    marginBottom: 10,
  },
  cardStatus: {
    fontWeight: "700",
    fontSize: 14,
  },

  cardExtra: {
    marginBottom: 10,
  },
  extraText: {
    color: "#9CA3AF",
    fontSize: 13,
  },

  liberarButton: {
    backgroundColor: "#DC2626",
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  liberarText: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 13,
  },
});
