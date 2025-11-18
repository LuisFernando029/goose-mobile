// src/components/CardapioSection.tsx
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/theme';

export function CardapioSection({ title, icon, items, theme }: any) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        {icon}
        <Text style={[styles.title, { color: theme.foreground }]}>{title}</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={[
            styles.card,
            {
              backgroundColor: theme.secondary,
              borderColor: theme.border,
              shadowColor: theme.foreground,
              shadowOpacity: 0.07,
              shadowRadius: 6,
              elevation: 2,
            }
          ]}>
            <Text style={[styles.nome, { color: theme.cardForeground }]}>{item.nome}</Text>
            <Text style={[styles.descricao, { color: theme.mutedForeground }]}>{item.descricao}</Text>
            <Text style={[styles.preco, { color: theme.primary }]}>R$ {item.preco.toFixed(2)}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  descricao: {
    fontSize: 15,
    marginTop: 2,
    marginBottom: 2,
  },
  preco: {
    marginTop: 8,
    fontWeight: '700',
    fontSize: 16,
  },
});
