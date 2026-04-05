import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Modal, TextInput, Linking,
} from 'react-native';
import { usePedometer } from '../hooks/usePedometer';

const VERDE = '#00C853';
const AZUL = '#00B0FF';
const NARANJA = '#FF6D00';
const BG = '#0a1628';
const CARD = '#111d33';
const BORDE = '#1e2f4a';

const METAS_SUGERIDAS = [5000, 8000, 10000, 12000, 15000];

// ── Anillo de progreso ────────────────────────────────────────────────────────
function AnilloProgreso({ porcentaje, pasos, meta }: { porcentaje: number; pasos: number; meta: number }) {
  const color = porcentaje >= 100 ? VERDE : porcentaje >= 50 ? AZUL : AZUL + '88';
  return (
    <View style={styles.anilloContainer}>
      <View style={[styles.anilloOuter, { borderColor: color + '44' }]}>
        <View style={[styles.anilloInner, { borderColor: color }]}>
          <Text style={[styles.anilloPasos, { color }]}>{pasos.toLocaleString()}</Text>
          <Text style={styles.anilloLabel}>pasos</Text>
          <Text style={[styles.anilloPct, { color }]}>{Math.round(porcentaje)}%</Text>
        </View>
      </View>
      <Text style={styles.anilloMeta}>🎯 Meta: {meta.toLocaleString()} pasos</Text>
    </View>
  );
}

// ── Slot de publicidad ────────────────────────────────────────────────────────
// Para activar AdMob real: https://docs.expo.dev/versions/latest/sdk/admob/
// Reemplazá este componente por <BannerAd unitId="tu-admob-id" size={BannerAdSize.BANNER} />
function BannerPublicidad() {
  return (
    <View style={styles.adBanner}>
      <Text style={styles.adLabel}>PUBLICIDAD</Text>
      <TouchableOpacity onPress={() => Linking.openURL('https://admob.google.com')}>
        <Text style={styles.adTexto}>🏋️ Activá AdMob para mostrar publicidades aquí y monetizar tu app</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Pantalla principal ────────────────────────────────────────────────────────
export default function PasosScreen() {
  const {
    disponible, permisoOtorgado, notificacionesActivas,
    pasosHoy, porcentajeMeta, kmRecorridos, caloriasQuemadas,
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
    if (porcentajeMeta >= 100) return '🏆 ¡META CUMPLIDA! ¡Sos una máquina!';
    if (porcentajeMeta >= 75)  return '⚡ ¡Casi llegás! Un poco más...';
    if (porcentajeMeta >= 50)  return '💪 ¡Vas por buen camino! Seguí así';
    if (porcentajeMeta >= 25)  return '🦶 Buen arranque. ¡No pares!';
    return '🌅 Empezá tu jornada saludable';
  };

  // Sin permiso de actividad
  if (!permisoOtorgado && disponible === false) {
    return (
      <View style={styles.noDisponible}>
        <Text style={{ fontSize: 60 }}>🏃</Text>
        <Text style={styles.noDispTitulo}>SoySaludable+</Text>
        <Text style={styles.noDispTexto}>
          Necesitamos permiso para acceder al sensor de movimiento y contar tus pasos.
        </Text>
        <Text style={{ color: '#555', fontSize: 12, marginTop: 8, textAlign: 'center', paddingHorizontal: 30 }}>
          Andá a Ajustes → SoySaludable+ → Actividad física → Permitir
        </Text>
      </View>
    );
  }

  if (!disponible) {
    return (
      <View style={styles.noDisponible}>
        <Text style={{ fontSize: 60 }}>📱</Text>
        <Text style={styles.noDispTitulo}>SoySaludable+</Text>
        <Text style={styles.noDispTexto}>Pedómetro no disponible en este dispositivo</Text>
        <Text style={{ color: '#555', fontSize: 13, marginTop: 8, textAlign: 'center', paddingHorizontal: 30 }}>
          Probá en un dispositivo físico con sensor de movimiento
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header con branding */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerBrand}>SoySaludable+</Text>
          <Text style={styles.headerSub}>Tu compañero de salud diario</Text>
        </View>
        <View style={styles.headerRight}>
          {notificacionesActivas
            ? <Text style={styles.notifActiva}>🔔 activas</Text>
            : <Text style={styles.notifInactiva}>🔕 sin notif.</Text>
          }
          {rachaActual > 0 && (
            <View style={styles.rachaBadge}>
              <Text style={styles.rachaText}>🔥 {rachaActual}d</Text>
            </View>
          )}
        </View>
      </View>

      {/* Tabs */}
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

        {/* ── TAB HOY ────────────────────────────────────────────────────── */}
        {tabActivo === 'hoy' && (
          <>
            <AnilloProgreso porcentaje={porcentajeMeta} pasos={pasosHoy} meta={meta} />
            <Text style={styles.mensajeMotivacion}>{getMensaje()}</Text>

            {/* Barra de progreso */}
            <View style={styles.barraProgreso}>
              <View style={[styles.barraRelleno, {
                width: `${Math.min(porcentajeMeta, 100)}%` as `${number}%`,
                backgroundColor: porcentajeMeta >= 100 ? VERDE : AZUL,
              }]} />
            </View>
            <Text style={styles.barraTexto}>
              {pasosHoy.toLocaleString()} / {meta.toLocaleString()} pasos
            </Text>

            {/* Stats principales */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { borderColor: NARANJA + '44' }]}>
                <Text style={styles.statEmoji}>🔥</Text>
                <Text style={[styles.statValor, { color: NARANJA }]}>{caloriasQuemadas}</Text>
                <Text style={styles.statLabel}>Calorías</Text>
              </View>
              <View style={[styles.statCard, { borderColor: VERDE + '44' }]}>
                <Text style={styles.statEmoji}>📍</Text>
                <Text style={[styles.statValor, { color: VERDE }]}>{kmRecorridos}</Text>
                <Text style={styles.statLabel}>km</Text>
              </View>
              <View style={[styles.statCard, { borderColor: AZUL + '44' }]}>
                <Text style={styles.statEmoji}>⏱️</Text>
                <Text style={[styles.statValor, { color: AZUL }]}>{Math.round(pasosHoy / 100)}</Text>
                <Text style={styles.statLabel}>min activo</Text>
              </View>
            </View>

            {/* Stats secundarios */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { borderColor: '#f0a50044' }]}>
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
                <Text style={styles.statLabel}>Total pasos</Text>
              </View>
            </View>

            {/* Botón de meta */}
            <TouchableOpacity
              style={styles.btnCambiarMeta}
              onPress={() => { setInputMeta(String(meta)); setModalMeta(true); }}
            >
              <Text style={styles.btnCambiarMetaText}>🎯  Cambiar meta diaria: {meta.toLocaleString()} pasos  ›</Text>
            </TouchableOpacity>

            {/* Banner publicitario */}
            <BannerPublicidad />
          </>
        )}

        {/* ── TAB HISTORIAL ───────────────────────────────────────────────── */}
        {tabActivo === 'historial' && (
          <View style={styles.historialCard}>
            <Text style={styles.secTitulo}>📅 Últimos 30 días</Text>
            {historial.length === 0 ? (
              <Text style={{ color: '#555', textAlign: 'center', marginTop: 20 }}>
                Sin datos todavía. ¡Empezá a caminar!
              </Text>
            ) : historial.map((dia, i) => {
              const pct = Math.min((dia.pasos / meta) * 100, 100);
              const d = new Date(dia.fecha + 'T12:00:00');
              const label = d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
              return (
                <View key={i} style={styles.historialFila}>
                  <View style={{ width: 100, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={styles.historialFechaText}>{label}</Text>
                    {dia.metaCumplida && <Text style={{ color: VERDE, fontSize: 11 }}>✓</Text>}
                  </View>
                  <View style={styles.historialBarraContainer}>
                    <View style={[styles.historialBarra, {
                      width: `${pct}%` as `${number}%`,
                      backgroundColor: dia.metaCumplida ? VERDE : AZUL,
                    }]} />
                  </View>
                  <Text style={styles.historialPasos}>{dia.pasos.toLocaleString()}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* ── TAB LOGROS ──────────────────────────────────────────────────── */}
        {tabActivo === 'logros' && (
          <>
            <Text style={styles.secTitulo}>
              🏅 {logros.filter(l => l.desbloqueado).length}/{logros.length} logros desbloqueados
            </Text>
            <View style={styles.logrosGrid}>
              {logros.map(logro => (
                <View
                  key={logro.id}
                  style={[styles.logroCard, !logro.desbloqueado && styles.logroLocked,
                    logro.desbloqueado && { borderColor: VERDE + '55' }]}
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

      {/* ── Modal de meta ──────────────────────────────────────────────────── */}
      <Modal visible={modalMeta} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitulo}>🎯 Meta diaria de pasos</Text>
            <Text style={styles.modalSub}>Elegí una meta rápida:</Text>
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
  container: { flex: 1, backgroundColor: BG },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDE },
  headerBrand: { fontSize: 20, fontWeight: '900', color: VERDE },
  headerSub: { fontSize: 11, color: '#3a6ea5', marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notifActiva: { fontSize: 11, color: VERDE },
  notifInactiva: { fontSize: 11, color: '#555' },
  rachaBadge: { backgroundColor: '#2a1500', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: '#f0a50033' },
  rachaText: { color: '#f0a500', fontSize: 12, fontWeight: '700' },

  // No disponible
  noDisponible: { flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center', padding: 30 },
  noDispTitulo: { fontSize: 24, fontWeight: '900', color: VERDE, marginTop: 12, marginBottom: 8 },
  noDispTexto: { color: '#888', fontSize: 15, textAlign: 'center' },

  // Tabs
  tabs: { flexDirection: 'row', backgroundColor: CARD, borderBottomWidth: 1, borderBottomColor: BORDE },
  tab: { flex: 1, paddingVertical: 13, alignItems: 'center' },
  tabActivo: { borderBottomWidth: 2, borderBottomColor: VERDE },
  tabText: { color: '#3a6ea5', fontSize: 13, fontWeight: '600' },
  tabTextActivo: { color: VERDE },

  content: { padding: 16, paddingBottom: 40 },

  // Anillo
  anilloContainer: { alignItems: 'center', marginVertical: 16 },
  anilloOuter: { width: 200, height: 200, borderRadius: 100, borderWidth: 14, alignItems: 'center', justifyContent: 'center' },
  anilloInner: { width: 158, height: 158, borderRadius: 79, borderWidth: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: CARD },
  anilloPasos: { fontSize: 32, fontWeight: '900' },
  anilloLabel: { color: '#3a6ea5', fontSize: 13 },
  anilloPct: { fontSize: 18, fontWeight: '700', marginTop: 2 },
  anilloMeta: { color: '#3a6ea5', fontSize: 13, marginTop: 10 },

  mensajeMotivacion: { color: '#ccc', fontSize: 14, textAlign: 'center', marginBottom: 14, fontStyle: 'italic' },

  // Barra de progreso
  barraProgreso: { height: 8, backgroundColor: BORDE, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  barraRelleno: { height: '100%', borderRadius: 4 },
  barraTexto: { color: '#3a6ea5', fontSize: 12, textAlign: 'center', marginBottom: 16 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  statCard: { flex: 1, backgroundColor: CARD, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: BORDE },
  statEmoji: { fontSize: 22, marginBottom: 4 },
  statValor: { fontSize: 20, fontWeight: '800', color: '#fff' },
  statLabel: { color: '#3a6ea5', fontSize: 11, marginTop: 2 },

  // Botón meta
  btnCambiarMeta: { backgroundColor: CARD, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: VERDE + '44' },
  btnCambiarMetaText: { color: VERDE, fontWeight: '600', fontSize: 14 },

  // Banner ad
  adBanner: { marginTop: 16, backgroundColor: '#0d1a2e', borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: BORDE, borderStyle: 'dashed' },
  adLabel: { color: '#2a4a6e', fontSize: 9, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  adTexto: { color: '#2a6ea5', fontSize: 12, textAlign: 'center' },

  // Historial
  secTitulo: { color: AZUL, fontWeight: '700', fontSize: 15, marginBottom: 16 },
  historialCard: { backgroundColor: CARD, borderRadius: 16, padding: 18 },
  historialFila: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  historialFechaText: { color: '#3a6ea5', fontSize: 11 },
  historialBarraContainer: { flex: 1, height: 8, backgroundColor: BORDE, borderRadius: 4, overflow: 'hidden' },
  historialBarra: { height: '100%', borderRadius: 4 },
  historialPasos: { color: '#ccc', fontSize: 11, width: 50, textAlign: 'right' },

  // Logros
  logrosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  logroCard: { width: '47%', backgroundColor: CARD, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: BORDE },
  logroLocked: { opacity: 0.3 },
  logroEmoji: { fontSize: 32, marginBottom: 8 },
  logroTitulo: { color: '#fff', fontWeight: '700', fontSize: 13, textAlign: 'center', marginBottom: 4 },
  logroDesc: { color: '#3a6ea5', fontSize: 11, textAlign: 'center', lineHeight: 15 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: CARD, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderTopWidth: 1, borderColor: BORDE },
  modalTitulo: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  modalSub: { color: '#3a6ea5', fontSize: 13, marginBottom: 12, marginTop: 16 },
  metasRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metaChip: { backgroundColor: BG, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: BORDE },
  metaChipActivo: { backgroundColor: VERDE, borderColor: VERDE },
  metaChipText: { color: '#3a6ea5', fontWeight: '600', fontSize: 14 },
  metaInput: { backgroundColor: BG, borderRadius: 12, padding: 14, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: BORDE, marginBottom: 16 },
  modalBtns: { flexDirection: 'row', gap: 12 },
  modalBtnCancelar: { flex: 1, backgroundColor: BG, borderRadius: 12, padding: 14, alignItems: 'center' },
  modalBtnGuardar: { flex: 1, backgroundColor: VERDE, borderRadius: 12, padding: 14, alignItems: 'center' },
});
