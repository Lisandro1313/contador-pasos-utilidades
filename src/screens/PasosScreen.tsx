import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { usePedometer } from '../hooks/usePedometer';

function BarraProgreso({ porcentaje }: { porcentaje: number }) {
  return (
    <View style={styles.barraContainer}>
      <View style={[styles.barraRelleno, { width: `${porcentaje}%` as any }]} />
    </View>
  );
}

export default function PasosScreen() {
  const { disponible, pasosHoy, porcentajeMeta, kmRecorridos, caloriasQuemadas, historial, META_DIARIA } = usePedometer();

  const getMensaje = () => {
    if (porcentajeMeta >= 100) return '¡Meta cumplida! Excelente trabajo 🏆';
    if (porcentajeMeta >= 75) return '¡Casi llegás! Seguí así 💪';
    if (porcentajeMeta >= 50) return 'Vas por buen camino, ánimo 🚶';
    if (porcentajeMeta >= 25) return 'Buen comienzo, seguí caminando 👟';
    return 'Empezá a caminar para alcanzar tu meta 🌟';
  };

  if (!disponible) {
    return (
      <View style={styles.noDisponible}>
        <Text style={styles.noDispEmoji}>📱</Text>
        <Text style={styles.noDispTexto}>El pedómetro no está disponible en este dispositivo</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Pasos principales */}
      <View style={styles.pasosCard}>
        <Text style={styles.pasosEmoji}>🦶</Text>
        <Text style={styles.pasosNumero}>{pasosHoy.toLocaleString()}</Text>
        <Text style={styles.pasosMeta}>Meta: {META_DIARIA.toLocaleString()} pasos</Text>
        <BarraProgreso porcentaje={porcentajeMeta} />
        <Text style={styles.porcentajeText}>{Math.round(porcentajeMeta)}% completado</Text>
        <Text style={styles.mensajeMotivacion}>{getMensaje()}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>🔥</Text>
          <Text style={styles.statValor}>{caloriasQuemadas}</Text>
          <Text style={styles.statLabel}>Calorías</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>📍</Text>
          <Text style={styles.statValor}>{kmRecorridos}</Text>
          <Text style={styles.statLabel}>Kilómetros</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statEmoji}>⏱️</Text>
          <Text style={styles.statValor}>{Math.round(pasosHoy / 100)}</Text>
          <Text style={styles.statLabel}>Min activo</Text>
        </View>
      </View>

      {/* Historial */}
      {historial.length > 0 && (
        <View style={styles.historialCard}>
          <Text style={styles.historialTitulo}>📅 Últimos 7 días</Text>
          {historial.map((dia, i) => {
            const pct = Math.min((dia.pasos / META_DIARIA) * 100, 100);
            return (
              <View key={i} style={styles.historialFila}>
                <Text style={styles.historialFecha}>{dia.fecha}</Text>
                <View style={styles.historialBarraContainer}>
                  <View style={[styles.historialBarra, { width: `${pct}%` as any }]} />
                </View>
                <Text style={styles.historialPasos}>{dia.pasos.toLocaleString()}</Text>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  content: { padding: 16, paddingBottom: 40 },
  noDisponible: { flex: 1, backgroundColor: '#0d1117', alignItems: 'center', justifyContent: 'center' },
  noDispEmoji: { fontSize: 60, marginBottom: 16 },
  noDispTexto: { color: '#888', fontSize: 16, textAlign: 'center', paddingHorizontal: 40 },
  pasosCard: {
    backgroundColor: '#161b22', borderRadius: 20, padding: 28,
    alignItems: 'center', marginBottom: 16,
  },
  pasosEmoji: { fontSize: 48, marginBottom: 8 },
  pasosNumero: { fontSize: 64, fontWeight: 'bold', color: '#58a6ff' },
  pasosMeta: { color: '#666', fontSize: 15, marginTop: 4, marginBottom: 16 },
  barraContainer: {
    width: '100%', height: 14, backgroundColor: '#21262d',
    borderRadius: 7, overflow: 'hidden', marginBottom: 8,
  },
  barraRelleno: { height: '100%', backgroundColor: '#58a6ff', borderRadius: 7 },
  porcentajeText: { color: '#58a6ff', fontWeight: '700', fontSize: 15 },
  mensajeMotivacion: {
    color: '#ccc', fontSize: 15, marginTop: 12,
    textAlign: 'center', fontStyle: 'italic',
  },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: '#161b22', borderRadius: 16,
    padding: 16, alignItems: 'center',
  },
  statEmoji: { fontSize: 28, marginBottom: 6 },
  statValor: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  statLabel: { color: '#666', fontSize: 12, marginTop: 4 },
  historialCard: {
    backgroundColor: '#161b22', borderRadius: 16, padding: 18,
  },
  historialTitulo: { color: '#58a6ff', fontWeight: '700', fontSize: 15, marginBottom: 14 },
  historialFila: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  historialFecha: { color: '#666', fontSize: 12, width: 90 },
  historialBarraContainer: {
    flex: 1, height: 8, backgroundColor: '#21262d', borderRadius: 4, overflow: 'hidden',
  },
  historialBarra: { height: '100%', backgroundColor: '#58a6ff', borderRadius: 4 },
  historialPasos: { color: '#ccc', fontSize: 12, width: 50, textAlign: 'right' },
});
