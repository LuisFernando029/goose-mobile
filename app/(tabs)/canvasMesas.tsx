import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type MesaStatus = 'available' | 'busy' | 'reserved';
type TipoElemento = 'mesa' | 'referencia';

interface ElementoMapa {
  id: string;
  tipo: TipoElemento;
  label: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  seats?: number;
  status?: MesaStatus;
  lock?: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Cores refinadas
const statusColors = {
  available: {
    gradient: ['#10b981', '#059669'],
    shadow: '#10b98180',
    light: '#d1fae5'
  },
  busy: {
    gradient: ['#ef4444', '#dc2626'],
    shadow: '#ef444480',
    light: '#fecaca'
  },
  reserved: {
    gradient: ['#f59e0b', '#d97706'],
    shadow: '#f59e0b80',
    light: '#fef3c7'
  }
};

export default function CanvasMesasVisualizacao() {
  const [elementos, setElementos] = useState<ElementoMapa[]>([]);
  const [scale] = useState(1);
  const [pan] = useState({ x: 0, y: 0 });

  useEffect(() => {
    loadElementos();
  }, []);

  const loadElementos = async () => {
    try {
      const saved = await AsyncStorage.getItem('canvas:elementos');
      if (saved) {
        setElementos(JSON.parse(saved));
      } else {
        // Dados organizados para não sobrepor - agora com mais elementos para testar o scroll vertical
        setElementos([
          { 
            id: '1', 
            tipo: 'mesa', 
            label: 'Mesa 1', 
            x: 50, y: 50, 
            width: 160, height: 100, 
            seats: 4, 
            status: 'available', 
            lock: false 
          },
          { 
            id: '2', 
            tipo: 'mesa', 
            label: 'Mesa 2', 
            x: 250, y: 50, 
            width: 160, height: 100, 
            seats: 4, 
            status: 'busy', 
            lock: false 
          },
          { 
            id: '3', 
            tipo: 'mesa', 
            label: 'VIP', 
            x: 450, y: 50, 
            width: 180, height: 120, 
            seats: 6, 
            status: 'reserved', 
            lock: true 
          },
          { 
            id: '4', 
            tipo: 'referencia', 
            label: 'Entrada', 
            x: 50, y: 200, 
            width: 140, height: 60, 
            lock: false 
          },
          { 
            id: '5', 
            tipo: 'referencia', 
            label: 'Balcão', 
            x: 250, y: 200, 
            width: 180, height: 70, 
            lock: false 
          },
          { 
            id: '6', 
            tipo: 'mesa', 
            label: 'Mesa 4', 
            x: 450, y: 200, 
            width: 140, height: 90, 
            seats: 2, 
            status: 'available', 
            lock: false 
          },
          { 
            id: '7', 
            tipo: 'mesa', 
            label: 'Mesa 5', 
            x: 50, y: 350, 
            width: 160, height: 100, 
            seats: 4, 
            status: 'busy', 
            lock: false 
          },
          { 
            id: '8', 
            tipo: 'mesa', 
            label: 'Mesa 6', 
            x: 250, y: 350, 
            width: 160, height: 100, 
            seats: 4, 
            status: 'available', 
            lock: false 
          },
          // Elementos adicionais para testar scroll vertical
          { 
            id: '9', 
            tipo: 'mesa', 
            label: 'Mesa 7', 
            x: 50, y: 500, 
            width: 160, height: 100, 
            seats: 4, 
            status: 'available', 
            lock: false 
          },
          { 
            id: '10', 
            tipo: 'mesa', 
            label: 'Mesa 8', 
            x: 250, y: 500, 
            width: 160, height: 100, 
            seats: 4, 
            status: 'busy', 
            lock: false 
          },
          { 
            id: '11', 
            tipo: 'referencia', 
            label: 'Cozinha', 
            x: 450, y: 500, 
            width: 140, height: 60, 
            lock: false 
          },
          { 
            id: '12', 
            tipo: 'mesa', 
            label: 'Mesa 9', 
            x: 50, y: 650, 
            width: 160, height: 100, 
            seats: 4, 
            status: 'reserved', 
            lock: false 
          },
        ]);
      }
    } catch (error) {
      console.error('Erro ao carregar elementos:', error);
    }
  };

  // Header compacto e bem organizado
const renderHeader = () => (
  <View style={styles.headerCards}>
    <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
    
    <View style={styles.cardsContainer}>
      <View style={styles.mainCard}>
        <Text style={styles.cardsTitle}>Mapa do Restaurante</Text>
        <Text style={styles.cardsSubtitle}>Status ao vivo</Text>
      </View>
      
      <View style={styles.statsCard}>
        <View style={styles.statCardItem}>
          <Text style={styles.statCardNumber}>{elementos.filter(e => e.tipo === 'mesa').length}</Text>
          <Text style={styles.statCardLabel}>Mesas</Text>
        </View>
        <View style={styles.statCardDivider} />
        <View style={styles.statCardItem}>
          <Text style={styles.statCardNumber}>
            {elementos.filter(e => e.tipo === 'mesa' && e.status === 'available').length}
          </Text>
          <Text style={styles.statCardLabel}>Livre</Text>
        </View>
      </View>
    </View>

    <View style={styles.legendCards}>
      <View style={styles.legendCard}>
        <View style={[styles.legendCardDot, { backgroundColor: '#10b981' }]} />
        <Text style={styles.legendCardText}>Disponível</Text>
      </View>
      <View style={styles.legendCard}>
        <View style={[styles.legendCardDot, { backgroundColor: '#ef4444' }]} />
        <Text style={styles.legendCardText}>Ocupada</Text>
      </View>
      <View style={styles.legendCard}>
        <View style={[styles.legendCardDot, { backgroundColor: '#f59e0b' }]} />
        <Text style={styles.legendCardText}>Reservada</Text>
      </View>
    </View>
  </View>
);

  const renderMesa = (el: ElementoMapa) => {
    const statusColor = statusColors[el.status!];
    
    return (
      <View
        key={el.id}
        style={[
          styles.elementoContainer,
          {
            left: el.x,
            top: el.y,
            width: el.width || 160,
            height: el.height || 100,
          },
        ]}
      >
        <View style={[
          styles.mesa,
          {
            borderColor: el.lock ? '#dc2626' : 'rgba(255,255,255,0.1)',
            opacity: el.lock ? 0.8 : 1,
          }
        ]}>
          {/* Efeito de brilho sutil */}
          <View style={[
            styles.mesaGlow,
            { backgroundColor: statusColor.shadow }
          ]} />


          {/* Content com gradiente */}
          <View style={[
            styles.mesaContent,
            {
              backgroundColor: statusColor.gradient[0],
              shadowColor: statusColor.shadow,
              borderLeftColor: statusColor.gradient[1],
            }
          ]}>
            <Text style={styles.mesaLabel}>{el.label}</Text>
            <View style={styles.seatsContainer}>
              <Text style={styles.mesaSeats}>{el.seats}</Text>
              <Text style={styles.seatsIcon}>✦</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderReferencia = (el: ElementoMapa) => (
    <View
      key={el.id}
      style={[
        styles.elementoContainer,
        {
          left: el.x,
          top: el.y,
          width: el.width || 140,
          height: el.height || 60,
        },
      ]}
    >
      <View style={[
        styles.referencia,
        {
          borderColor: el.lock ? '#dc2626' : 'rgba(14, 165, 233, 0.6)',
          opacity: el.lock ? 0.8 : 1,
        }
      ]}>
    

        <View style={styles.referenciaContent}>
          <Text style={styles.referenciaText}>{el.label}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      {/* Área principal do canvas */}
      <View style={styles.mainContent}>
        <View style={styles.canvasHeader}>
          <Text style={styles.canvasTitle}>Layout do Espaço</Text>
          <Text style={styles.canvasSubtitle}>
            {elementos.length} elementos no mapa • Role para explorar
          </Text>
        </View>

        <View style={styles.canvasWrapper}>
          {/* ScrollView vertical para navegação geral */}
          <ScrollView 
            style={styles.verticalScroll}
            showsVerticalScrollIndicator={true}
          >
            {/* ScrollView horizontal dentro do vertical */}
            <ScrollView 
              style={styles.horizontalScroll}
              horizontal={true}
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={styles.canvasContentContainer}
            >
              <View style={styles.canvas}>
                {/* Grid de fundo */}
                <View style={styles.gridOverlay} />
                
                <View 
                  style={[
                    styles.transformContainer,
                    {
                      transform: [
                        { translateX: pan.x },
                        { translateY: pan.y },
                        { scale: scale }
                      ],
                    }
                  ]}
                >
                  {elementos.map((el) => 
                    el.tipo === 'mesa' ? renderMesa(el) : renderReferencia(el)
                  )}
                </View>
              </View>
            </ScrollView>
          </ScrollView>
        </View>
      </View>

      {/* Rodapé */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Toque e arraste para navegar • Atualizado agora
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    backgroundColor: '#1e293b',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: '#f1f5f9',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '400',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 4,
  },
  statItem: {
    alignItems: 'flex-end',
  },
  statNumber: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  statusLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    margin: 16,
    marginBottom: 8,
  },
  canvasHeader: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  canvasTitle: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  canvasSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '400',
  },
  canvasWrapper: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  // ScrollView vertical (principal)
  verticalScroll: {
    flex: 1,
  },
  // ScrollView horizontal (dentro do vertical)
  horizontalScroll: {
    flex: 1,
  },
  canvasContentContainer: {
    minWidth: 1000,  // Largura mínima para scroll horizontal
    minHeight: 900,  // Altura aumentada para scroll vertical
  },
  canvas: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0f0f0f',
    position: 'relative',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    backgroundImage: `
      linear-gradient(to right, rgba(30, 41, 59, 0.2) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(30, 41, 59, 0.2) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
  },
  transformContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  elementoContainer: {
    position: 'absolute',
  },
  mesa: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    padding: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  mesaGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 12,
    opacity: 0.1,
  },
  mesaContent: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  mesaLabel: {
    color: '#fafafa',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  seatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mesaSeats: {
    color: '#fafafa',
    fontSize: 13,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  seatsIcon: {
    color: '#fafafa',
    fontSize: 11,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  referencia: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(22, 32, 42, 0.9)',
    padding: 6,
    overflow: 'hidden',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  referenciaContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  referenciaText: {
    color: '#e0f2fe',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  lockButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  lockText: {
    fontSize: 9,
  },
  footer: {
    padding: 12,
    paddingBottom: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  footerText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '500',
  },
  headerCards: {
  backgroundColor: '#0f172a',
  paddingTop: 50,
  paddingBottom: 16,
  paddingHorizontal: 16,
},
cardsContainer: {
  flexDirection: 'row',
  gap: 12,
  marginBottom: 16,
},
mainCard: {
  flex: 2,
  backgroundColor: 'rgba(255,255,255,0.05)',
  padding: 16,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.1)',
},
statsCard: {
  flex: 1,
  backgroundColor: 'rgba(255,255,255,0.05)',
  padding: 8,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.1)',
  flexDirection: 'row',
  alignItems: 'center',
},
cardsTitle: {
  color: '#f1f5f9',
  fontSize: 18,
  fontWeight: '600',
  marginBottom: 2,
},
cardsSubtitle: {
  color: '#94a3b8',
  fontSize: 12,
  fontWeight: '400',
},
statCardItem: {
  flex: 1,
  alignItems: 'center',
},
statCardNumber: {
  color: '#f8fafc',
  fontSize: 16,
  fontWeight: '700',
  marginBottom: 2,
},
statCardLabel: {
  color: '#94a3b8',
  fontSize: 10,
  fontWeight: '500',
},
statCardDivider: {
  width: 1,
  height: 30,
  backgroundColor: 'rgba(255,255,255,0.1)',
},
legendCards: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  backgroundColor: 'rgba(255,255,255,0.03)',
  padding: 12,
  borderRadius: 10,
},
legendCard: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},
legendCardDot: {
  width: 12,
  height: 12,
  borderRadius: 6,
},
legendCardText: {
  color: '#cbd5e1',
  fontSize: 12,
  fontWeight: '500',
},
});