import { Beer, Coffee, UtensilsCrossed, Wine } from 'lucide-react-native';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Dimensions } from 'react-native';
import { Colors, Fonts } from '../constants/theme';
import { CardapioSection } from '../src/components/CardapioSection';

const menuData = {
  vinhos: [
    { id: 1, nome: "Vinho Tinto Reserva", descricao: "Cabernet Sauvignon, safra 2020", preco: 89.9, estoque: 15 },
    { id: 2, nome: "Vinho Branco Seco", descricao: "Chardonnay, safra 2021", preco: 75.0, estoque: 20 },
    { id: 3, nome: "Vinho Rosé", descricao: "Merlot Rosé, safra 2022", preco: 65.0, estoque: 12 },
    { id: 4, nome: "Espumante Brut", descricao: "Método tradicional", preco: 95.0, estoque: 8 },
  ],
  cervejas: [
    { id: 5, nome: "Cerveja Artesanal IPA", descricao: "American IPA, 500ml", preco: 18.0, estoque: 30 },
    { id: 6, nome: "Cerveja Pilsen", descricao: "Pilsen clássica, 350ml", preco: 12.0, estoque: 50 },
    { id: 7, nome: "Cerveja Stout", descricao: "Imperial Stout, 500ml", preco: 22.0, estoque: 15 },
  ],
  drinks: [
    { id: 8, nome: "Caipirinha", descricao: "Limão, cachaça artesanal", preco: 18.0, estoque: 100 },
    { id: 9, nome: "Gin Tônica", descricao: "Gin premium, tônica, limão siciliano", preco: 25.0, estoque: 100 },
    { id: 10, nome: "Negroni", descricao: "Gin, Campari, vermute", preco: 28.0, estoque: 100 },
  ],
  petiscos: [
    { id: 11, nome: "Tábua de Frios", descricao: "Queijos, salames, azeitonas", preco: 45.0, estoque: 20 },
    { id: 12, nome: "Bruschetta", descricao: "Tomate, manjericão, azeite", preco: 22.0, estoque: 30 },
    { id: 13, nome: "Porção de Azeitonas", descricao: "Mix de azeitonas temperadas", preco: 15.0, estoque: 40 },
  ],
};

export default function CardapioScreen() {
  const theme = Colors.dark;
  const maxWidth = 700;
  const screenWidth = Dimensions.get('window').width;
  const containerWidth = screenWidth > maxWidth ? maxWidth : screenWidth;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 32 }}>
        {/* Hero Section */}
        <View style={[
          styles.hero,
          {
            backgroundColor: theme.card,
            borderBottomColor: theme.border,
            width: containerWidth,
            shadowColor: theme.foreground,
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 2,
          }
        ]}>
          <Text style={[styles.title, { color: theme.foreground }]}>Cardápio da Adega</Text>
          <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
            Escolha sua bebida ou petisco favorito!
          </Text>
        </View>

        {/* Main Content */}
        <View style={[styles.main, { width: containerWidth }]}>
          <CardapioSection
            title="Vinhos"
            icon={<Wine size={28} color={theme.primary} />}
            items={menuData.vinhos}
            theme={theme}
          />
          <CardapioSection
            title="Cervejas Artesanais"
            icon={<Beer size={28} color={theme.primary} />}
            items={menuData.cervejas}
            theme={theme}
          />
          <CardapioSection
            title="Drinks"
            icon={<Coffee size={28} color={theme.primary} />}
            items={menuData.drinks}
            theme={theme}
          />
          <CardapioSection
            title="Petiscos"
            icon={<UtensilsCrossed size={28} color={theme.primary} />}
            items={menuData.petiscos}
            theme={theme}
          />
        </View>

        {/* Footer */}
        <View style={[
          styles.footer,
          {
            backgroundColor: theme.card,
            borderTopColor: theme.border,
            width: containerWidth,
            shadowColor: theme.foreground,
            shadowOpacity: 0.06,
            shadowRadius: 6,
            elevation: 1,
          }
        ]}>
          <Text style={[styles.footerText, { color: theme.mutedForeground }]}>
            © 2025 Adega. Todos os direitos reservados.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: {
    borderBottomWidth: 1,
    paddingVertical: 36,
    alignItems: 'center',
    marginBottom: 0,
    borderRadius: 18,
    marginTop: 12,
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.5,
    fontFamily: Fonts.sans,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: Colors.dark.mutedForeground,
    marginBottom: 4,
    fontFamily: Fonts.sans,
  },
  main: {
    paddingHorizontal: 16,
    paddingVertical: 28,
    gap: 32,
  },
  footer: {
    borderTopWidth: 1,
    paddingVertical: 24,
    alignItems: 'center',
    marginTop: 40,
    borderRadius: 16,
  },
  footerText: {
    fontSize: 16,
    fontFamily: Fonts.sans,
  },
});
