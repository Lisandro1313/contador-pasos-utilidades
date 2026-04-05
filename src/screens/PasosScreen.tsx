import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Modal, TextInput,
} from 'react-native';
import { usePedometer } from '../hooks/usePedometer';

const METAS_SUGERIDAS = [5000, 8000, 10000, 12000, 15000];

function AnilloProgreso({ porcentaje, pasos, meta }: { porcentaje: number; pasos: number; meta: number }) {
  const color = porcentaje >= 100 ? '#3fb950' : porcentaje >= 50 ? '#58a6ff' : '#58a6ff55';
  return (
    <View style={styles.anilloContainer}>
      <View style={[styles.anilloOuter, { borderColor: color + '44' }]}>
        <View style={[styles.anilloInner, { borderColor: color }]}>
          <Text style={[styles.anilloPasos, { color }]}>{pasos.toLocaleString()}</Text>
          <Text style={styles.anilloLabel}>pasos</Text>
          <Text style={[styles.anilloPct, { color }]}>{Math.round(porcentaje)}%</Text>
        </View>
      </View>
      <Text style={styles.anilloMeta}>Meta: {meta.toLocaleString()} pasos</Text>
    </View>
  );
}

export default function PasosScreen() {
  const {
    disponible, pasosHoy, porcentajeMeta, kmRecorridos, caloriasQuemadas,
    historial, meta, cambiarMeta, rachaActual, mejorDia, totalAcumulado, logros,
  } = usePedometer();

  const [modalMeta, setModalMeta] = useState(false);
  const [inputMeta, setInputMeta] = useState('');
  const [tabActivo, setTabActivo] = useState<'hoy' | 'historial' | 'logros'>('hoy');

  const guardarMeta = () => {
    const n = parseInt(inputMeta);
    if (!isNaN(n) && n > 0) { cambiarMeta(n); setModalMeta(false); }
  };

  const getMensaje = () => {
    if (porcentajeMeta >= 100) return '¡META CUMPLIDA! 🏆';
    if (porcentajeMeta >= 75) return '¡Casi llegás! 💪';
    if (porcentajeMeta >= 50) return 'Vas por buen camino 🚶';
    if (porcentajeMeta >= 25) return 'Seguí caminando 👟';
    return 'Empezá tu jornada 🌅';
  };

  if (!disponible) {
    return (
      <View style={styles.noDisponible}>
        <Text style={{ fontSize: 60 }}>📱</Text>
        <Text style={styles.noDispTexto}>Pedómetro no disponible en este dispositivo</Text>
        <Text style={{ color: '#555', fontSize: 13, marginTop: 8, textAlign: 'center', paddingHorizontal: 30 }}>
          Probá en un dispositivo físico con sensor de movimiento
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {(['hoy', 'historial', 'logros'] as const).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tabActivo === t && styles.tabActivo]}
            onPress={() => setTabActivo(t)}
          >
            <Text style={[styles.tabText, tabActivo === t && styles.tabTextActivo]}>
              {t === 'hoy' ? '🦶 Hoy' : t === 'historial' ? '📅 Historial' : '🏅 Logros'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {tabActivo === 'hoy' && (
          <>
            <AnilloProgreso porcentaje={porcentajeMeta} pasos={pasosHoy} meta={meta} />
            <Text style={styles.mensajeMotivacion}>{getMensaje()}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>🔥</Text>
                <Text style={styles.statValor}>{caloriasQuemadas}</Text>
                <Text style={styles.statLabel}>Calorías</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>📍</Text>
                <Text style={styles.statValor}>{kmRecorridos}</Text>
                <Text style={styles.statLabel}>km</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>⏱️</Text>
                <Text style={styles.statValor}>{Math.round(pasosHoy / 100)}</Text>
                <Text style={styles.statLabel}>min activo</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, { borderWidth: 1, borderColor: '#f0a50033' }]}>
                <Text style={styles.statEmoji}>🔥</Text>
                <Text style={[styles.statValor, { color: '#f0a500' }]}>{rachaActual}</Text>
                <Text style={styles.statLabel}>Racha días</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>🥇</Text>
                <Text style={styles.statValor}>{mejorDia > 0 ? mejorDia.toLocaleString() : '-'}</Text>
                <Text style={styles.statLabel}>Mejor día</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>🌍</Text>
                <Text style={styles.statValor}>{(totalAcumulado / 1000).toFixed(1)}k</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.btnCambiarMeta}
              onPress={() => { setInputMeta(String(meta)); setModalMeta(true); }}
            >
              <Text style={styles.btnCambiarMetaText}>🎯  Meta diaria: {meta.toLocaleString()} pasos  ›</Text>
            </TouchableOpacity>
          </>
        )}

        {tabActivo === 'historial' && (
          <View style={styles.historialCard}>
            <Text style={styles.secTitulo}>Últimos 30 días</Text>
            {historial.length === 0 ? (
              <Text style={{ color: '#555', textAlign: 'center', marginTop: 20 }}>Sin datos todavía. ¡Empezá a caminar!</Text>
            ) : historial.map((dia, i) => {
              const pct = Math.min((dia.pasos / meta) * 100, 100);
              const d = new Date(dia.fecha + 'T12:00:00');
              const label = d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
              return (
                <View key={i} style={styles.historialFila}>
                  <View style={{ width: 100, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={styles.historialFechaText}>{label}</Text>
                    {dia.metaCumplida && <Text style={{ color: '#3fb950', fontSize: 11 }}>✓</Text>}
                  </View>
                  <View style={styles.historialBarraContainer}>
                    <View style={[styles.historialBarra, {
                      width: `${pct}%` as `${number}%`,
                      backgroundColor: dia.metaCumplida ? '#3fb950' : '#58a6ff',
                    }]} />
                  </View>
                  <Text style={styles.historialPasos}>{dia.pasos.toLocaleString()}</Text>
                </View>
              );
            })}
          </View>
        )}

        {tabActivo === 'logros' && (
          <>
            <Text style={styles.secTitulo}>
              {logros.filter(l => l.desbloqueado).length}/{logros.length} logros desbloqueados
            </Text>
            <View style={styles.logrosGrid}>
              {logros.map(logro => (
                <View
                  key={logro.id}
                  style={[styles.logroCard, !logro.desbloqueado && styles.logroLocked]}
                >
                  <Text style={styles.logroEmoji}>{logro.desbloqueado ? logro.emoji : '🔒'}</Text>
                  <Text style={[styles.logroTitulo, !logro.desbloqueado && { color: '#333' }]}>
                    {logro.titulo}
                  </Text>
                  <Text style={styles.logroDesc}>{logro.descripcion}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <Modal visible={modalMeta} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>🎯 Meta diaria</Text>
            <Text style={styles.modalSub}>Elegí una meta:</Text>
            <View style={styles.metasRow}>
              {METAS_SUGERIDAS.map(m => (
                <TouchableOpacity
                  key={m}
                  style={[styles.metaChip, meta === m && styles.metaChipActivo]}
                  onPress={() => { cambiarMeta(m); setModalMeta(false); }}
                >
                  <Text style={[styles.metaChipText, meta === m && { color: '#fff' }]}>
                    {m.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.modalSub}>O ingresá la tuya:</Text>
            <TextInput
              style={styles.metaInput}
              keyboardType="numeric"
              value={inputMeta}
              onChangeText={setInputMeta}
              placeholder="Ej: 6000"
              placeholderTextColor="#555"
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalBtnCancelar} onPress={() => setModalMeta(false)}>
                <Text style={{ color: '#888' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnGuardar} onPress={guardarMeta}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  noDisponible: { flex: 1, backgroundColor: '#0d1117', alignItems: 'center', justifyContent: 'center' },
  noDispTexto: { color: '#888', fontSize: 16, textAlign: 'center', marginTop: 12 },
  tabs: { flexDirection: 'row', backgroundColor: '#161b22', borderBottomWidth: 1, borderBottomColor: '#21262d' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActivo: { borderBottomWidth: 2, borderBottomColor: '#58a6ff' },
  tabText: { color: '#666', fontSize: 13, fontWeight: '600' },
  tabTextActivo: { color: '#58a6ff' },
  content: { padding: 16, paddingBottom: 40 },
  anilloContainer: { alignItems: 'center', marginVertical: 20 },
  anilloOuter: { width: 200, height: 200, borderRadius: 100, borderWidth: 14, alignItems: 'center', justifyContent: 'center' },
  anilloInner: { width: 158, height: 158, borderRadius: 79, borderWidth: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: '#161b22' },
  anilloPasos: { fontSize: 32, fontWeight: '900' },
  anilloLabel: { color: '#666', fontSize: 13 },
  anilloPct: { fontSize: 18, fontWeight: '700', marginTop: 2 },
  anilloMeta: { color: '#555', fontSize: 13, marginTop: 10 },
  mensajeMotivacion: { color: '#ccc', fontSize: 15, textAlign: 'center', marginBottom: 20, fontStyle: 'italic' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  statCard: { flex: 1, backgroundColor: '#161b22', borderRadius: 14, padding: 14, alignItems: 'center' },
  statEmoji: { fontSize: 22, marginBottom: 4 },
  statValor: { fontSize: 20, fontWeight: '800', color: '#fff' },
  statLabel: { color: '#555', fontSize: 11, marginTop: 2 },
  btnCambiarMeta: { backgroundColor: '#161b22', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#30363d' },
  btnCambiarMetaText: { color: '#58a6ff', fontWeight: '600', fontSize: 14 },
  secTitulo: { color: '#58a6ff', fontWeight: '700', fontSize: 15, marginBottom: 16 },
  historialCard: { backgroundColor: '#161b22', borderRadius: 16, padding: 18 },
  historialFila: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  historialFechaText: { color: '#666', fontSize: 11 },
  historialBarraContainer: { flex: 1, height: 8, backgroundColor: '#21262d', borderRadius: 4, overflow: 'hidden' },
  historialBarra: { height: '100%', borderRadius: 4 },
  historialPasos: { color: '#ccc', fontSize: 11, width: 50, textAlign: 'right' },
  logrosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  logroCard: { width: '47%', backgroundColor: '#161b22', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#30363d' },
  logroLocked: { opacity: 0.35 },
  logroEmoji: { fontSize: 32, marginBottom: 8 },
  logroTitulo: { color: '#fff', fontWeight: '700', fontSize: 13, textAlign: 'center', marginBottom: 4 },
  logroDesc: { color: '#555', fontSize: 11, textAlign: 'center', lineHeight: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#161b22', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitulo: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  modalSub: { color: '#888', fontSize: 13, marginBottom: 12, marginTop: 16 },
  metasRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metaChip: { backgroundColor: '#21262d', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: '#30363d' },
  metaChipActivo: { backgroundColor: '#58a6ff', borderColor: '#58a6ff' },
  metaChipText: { color: '#888', fontWeight: '600', fontSize: 14 },
  metaInput: { backgroundColor: '#21262d', borderRadius: 12, padding: 14, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#30363d', marginBottom: 16 },
  modalBtns: { flexDirection: 'row', gap: 12 },
  modalBtnCancelar: { flex: 1, backgroundColor: '#21262d', borderRadius: 12, padding: 14, alignItems: 'center' },
  modalBtnGuardar: { flex: 1, backgroundColor: '#58a6ff', borderRadius: 12, padding: 14, alignItems: 'center' },
});
