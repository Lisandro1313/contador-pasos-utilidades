import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Modal, ActivityIndicator,
} from 'react-native';
import { usePlus } from '../hooks/usePlus';

const VERDE  = '#00C853';
const AZUL   = '#00B0FF';
const ORO    = '#FFD600';
const BG     = '#0a1628';
const CARD   = '#111d33';
const BORDE  = '#1e2f4a';
const TEXTO  = '#e8eaf6';
const SUBTEXT = '#7986cb';

// ── Categoría badge ───────────────────────────────────────────────────────────
const COLOR_CAT: Record<string, string> = {
  Ansiedad:     '#FF6D00',
  Alimentación: '#00C853',
  Hábitos:      '#00B0FF',
  Mental:       '#AB47BC',
};

function CategoriaBadge({ cat }: { cat: string }) {
  return (
    <View style={[styles.catBadge, { backgroundColor: COLOR_CAT[cat] + '33', borderColor: COLOR_CAT[cat] + '88' }]}>
      <Text style={[styles.catTexto, { color: COLOR_CAT[cat] }]}>{cat}</Text>
    </View>
  );
}

// ── Dificultad badge ──────────────────────────────────────────────────────────
const COLOR_DIFI: Record<string, string> = {
  Rápida: '#00C853',
  Fácil:  '#00B0FF',
  Media:  '#FFD600',
};

function DifiBadge({ dif }: { dif: string }) {
  const c = COLOR_DIFI[dif] ?? '#aaa';
  return (
    <View style={[styles.difiBadge, { backgroundColor: c + '22', borderColor: c + '66' }]}>
      <Text style={[styles.difiTexto, { color: c }]}>{dif}</Text>
    </View>
  );
}

// ── Paywall ───────────────────────────────────────────────────────────────────
function Paywall({ onComprar }: { onComprar: () => void }) {
  const [modalVisible, setModalVisible] = useState(false);

  const confirmar = () => {
    setModalVisible(false);
    onComprar();
  };

  return (
    <ScrollView contentContainerStyle={styles.paywallContainer}>
      {/* Hero */}
      <View style={styles.paywallHero}>
        <Text style={styles.paywallEmoji}>🌿</Text>
        <Text style={styles.paywallTitulo}>SoySaludable+ Plus</Text>
        <Text style={styles.paywallSubtitulo}>Tu guía de salud diaria personalizada</Text>
      </View>

      {/* Precio */}
      <View style={styles.precioCard}>
        <Text style={styles.precioTag}>PLAN MENSUAL</Text>
        <Text style={styles.precioMonto}>$2.99 <Text style={styles.precioUs}>USD</Text></Text>
        <Text style={styles.precioPor}>/ mes · cancela cuando quieras</Text>
        <Text style={styles.precioAnual}>💰 Plan anual: $19.99 — ahorrás 44%</Text>
      </View>

      {/* Beneficios */}
      <View style={styles.beneficiosCard}>
        <Text style={styles.beneficiosTitulo}>¿Qué incluye?</Text>
        {[
          ['🍽️', 'Receta saludable nueva cada día', 'Con ingredientes, pasos y beneficio nutricional'],
          ['🧘', 'Consejo anti-ansiedad diario', 'Técnicas respaldadas por ciencia para la mente'],
          ['🔄', 'Estrategias anti-atracón', 'Reemplazos inteligentes sin privarte'],
          ['😴', 'Guías de sueño y estrés', 'El sueño es la base de la salud real'],
          ['🦠', 'Salud intestinal y mental', 'Microbiota, nutrición emocional y más'],
          ['📅', 'Contenido fresco cada 24hs', 'Siempre algo nuevo para seguir mejorando'],
        ].map(([emoji, titulo, desc], i) => (
          <View key={i} style={styles.beneficioRow}>
            <Text style={styles.beneficioEmoji}>{emoji}</Text>
            <View style={styles.beneficioTextos}>
              <Text style={styles.beneficioTitulo}>{titulo}</Text>
              <Text style={styles.beneficioDesc}>{desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity style={styles.btnComprar} onPress={() => setModalVisible(true)}>
        <Text style={styles.btnComprarTexto}>🌿 Activar Plan Plus</Text>
      </TouchableOpacity>
      <Text style={styles.paywallFooter}>
        Pago seguro · Cancela en cualquier momento · Sin cargos ocultos
      </Text>

      {/* Modal confirmación */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>🌿</Text>
            <Text style={styles.modalTitulo}>Activar Plan Plus</Text>
            <Text style={styles.modalTexto}>
              Vas a activar SoySaludable+ Plus por $2.99/mes.{'\n'}
              Podés cancelar cuando quieras.
            </Text>
            <View style={styles.modalBotones}>
              <TouchableOpacity style={styles.modalBtnCancelar} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnCancelarTxt}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnConfirmar} onPress={confirmar}>
                <Text style={styles.modalBtnConfirmarTxt}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ── Contenido Plus ────────────────────────────────────────────────────────────
function ContenidoPlus() {
  const { recetaHoy, consejoHoy, consejoBono, cancelarPlus } = usePlus();
  const [seccion, setSeccion] = useState<'receta' | 'consejo'>('receta');
  const [modalCancelar, setModalCancelar] = useState(false);
  const [expandirPasos, setExpandirPasos] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.content}>

      {/* Header Plus */}
      <View style={styles.plusHeader}>
        <View>
          <Text style={styles.plusTitulo}>🌿 Plan Plus</Text>
          <Text style={styles.plusFecha}>
            {new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>
        <View style={[styles.activoBadge]}>
          <Text style={styles.activoTexto}>✓ ACTIVO</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, seccion === 'receta' && styles.tabActivo]}
          onPress={() => setSeccion('receta')}
        >
          <Text style={[styles.tabText, seccion === 'receta' && styles.tabTextActivo]}>
            🍽️ Receta del día
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, seccion === 'consejo' && styles.tabActivo]}
          onPress={() => setSeccion('consejo')}
        >
          <Text style={[styles.tabText, seccion === 'consejo' && styles.tabTextActivo]}>
            🧘 Consejos
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── RECETA ── */}
      {seccion === 'receta' && (
        <>
          <View style={styles.recetaCard}>
            {/* Header receta */}
            <View style={styles.recetaHeaderRow}>
              <Text style={styles.recetaEmoji}>{recetaHoy.emoji}</Text>
              <View style={styles.recetaHeaderTextos}>
                <Text style={styles.recetaTitulo}>{recetaHoy.titulo}</Text>
                <View style={styles.recetaBadgesRow}>
                  <DifiBadge dif={recetaHoy.dificultad} />
                  <View style={styles.infoBadge}>
                    <Text style={styles.infoBadgeTxt}>⏱ {recetaHoy.tiempo}</Text>
                  </View>
                  <View style={styles.infoBadge}>
                    <Text style={styles.infoBadgeTxt}>🔥 {recetaHoy.calorias}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Beneficio */}
            <View style={styles.beneficioBox}>
              <Text style={styles.beneficioBoxEmoji}>💚</Text>
              <Text style={styles.beneficioBoxTexto}>{recetaHoy.beneficio}</Text>
            </View>

            {/* Ingredientes */}
            <Text style={styles.seccionLabel}>🛒 Ingredientes</Text>
            <View style={styles.ingredientesList}>
              {recetaHoy.ingredientes.map((ing, i) => (
                <View key={i} style={styles.ingredienteRow}>
                  <View style={styles.ingredienteDot} />
                  <Text style={styles.ingredienteTexto}>{ing}</Text>
                </View>
              ))}
            </View>

            {/* Pasos */}
            <TouchableOpacity
              style={styles.pasosToggle}
              onPress={() => setExpandirPasos(v => !v)}
            >
              <Text style={styles.seccionLabel}>👨‍🍳 Preparación</Text>
              <Text style={styles.pasosToggleIco}>{expandirPasos ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {expandirPasos && (
              <View style={styles.pasosList}>
                {recetaHoy.pasos.map((paso, i) => (
                  <View key={i} style={styles.pasoRow}>
                    <View style={styles.pasoNum}>
                      <Text style={styles.pasoNumTexto}>{i + 1}</Text>
                    </View>
                    <Text style={styles.pasoTexto}>{paso}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <Text style={styles.renovacionTexto}>
            🔄 Nueva receta mañana a las 00:00
          </Text>
        </>
      )}

      {/* ── CONSEJOS ── */}
      {seccion === 'consejo' && (
        <>
          {/* Consejo principal */}
          <View style={styles.consejoCard}>
            <View style={styles.consejoHeaderRow}>
              <Text style={styles.consejoEmoji}>{consejoHoy.emoji}</Text>
              <View style={{ flex: 1 }}>
                <CategoriaBadge cat={consejoHoy.categoria} />
                <Text style={styles.consejoTitulo}>{consejoHoy.titulo}</Text>
              </View>
            </View>
            <Text style={styles.consejoDesc}>{consejoHoy.descripcion}</Text>
            <Text style={styles.seccionLabel}>✅ Cómo aplicarlo hoy</Text>
            {consejoHoy.tips.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <Text style={styles.tipBullet}>›</Text>
                <Text style={styles.tipTexto}>{tip}</Text>
              </View>
            ))}
          </View>

          {/* Consejo bono */}
          <View style={styles.bonoCard}>
            <Text style={styles.bonoLabel}>🎁 EXTRA DEL DÍA</Text>
            <View style={styles.consejoHeaderRow}>
              <Text style={styles.consejoEmoji}>{consejoBono.emoji}</Text>
              <View style={{ flex: 1 }}>
                <CategoriaBadge cat={consejoBono.categoria} />
                <Text style={styles.consejoTitulo}>{consejoBono.titulo}</Text>
              </View>
            </View>
            <Text style={styles.consejoDesc}>{consejoBono.descripcion}</Text>
            {consejoBono.tips.slice(0, 2).map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <Text style={styles.tipBullet}>›</Text>
                <Text style={styles.tipTexto}>{tip}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.renovacionTexto}>
            🔄 Nuevos consejos mañana a las 00:00
          </Text>
        </>
      )}

      {/* Cancelar suscripción */}
      <TouchableOpacity style={styles.btnCancelar} onPress={() => setModalCancelar(true)}>
        <Text style={styles.btnCancelarTxt}>Cancelar suscripción</Text>
      </TouchableOpacity>

      <Modal visible={modalCancelar} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>😔</Text>
            <Text style={styles.modalTitulo}>¿Cancelar Plan Plus?</Text>
            <Text style={styles.modalTexto}>
              Perderás acceso a las recetas y consejos diarios.
            </Text>
            <View style={styles.modalBotones}>
              <TouchableOpacity style={styles.modalBtnCancelar} onPress={() => setModalCancelar(false)}>
                <Text style={styles.modalBtnCancelarTxt}>No, quedarme</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtnConfirmar, { backgroundColor: '#c62828' }]}
                onPress={() => { setModalCancelar(false); cancelarPlus(); }}
              >
                <Text style={styles.modalBtnConfirmarTxt}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

// ── Pantalla principal ────────────────────────────────────────────────────────
export default function PlusScreen() {
  const { esPremium, cargando, activarPlus } = usePlus();

  if (cargando) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={VERDE} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {esPremium ? <ContenidoPlus /> : <Paywall onComprar={activarPlus} />}
    </View>
  );
}

// ── Estilos ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: BG },
  content:            { paddingBottom: 40 },

  // Paywall
  paywallContainer:   { paddingBottom: 50 },
  paywallHero:        { alignItems: 'center', paddingTop: 40, paddingBottom: 24 },
  paywallEmoji:       { fontSize: 64, marginBottom: 12 },
  paywallTitulo:      { fontSize: 26, fontWeight: '800', color: VERDE, letterSpacing: 0.5 },
  paywallSubtitulo:   { fontSize: 14, color: SUBTEXT, marginTop: 4, textAlign: 'center' },

  precioCard: {
    marginHorizontal: 20, marginBottom: 20,
    backgroundColor: CARD, borderRadius: 16,
    borderWidth: 1, borderColor: VERDE + '55',
    padding: 20, alignItems: 'center',
  },
  precioTag:   { fontSize: 11, color: VERDE, letterSpacing: 2, fontWeight: '700', marginBottom: 8 },
  precioMonto: { fontSize: 42, fontWeight: '900', color: TEXTO },
  precioUs:    { fontSize: 18, fontWeight: '400', color: SUBTEXT },
  precioPor:   { fontSize: 13, color: SUBTEXT, marginTop: 4 },
  precioAnual: { fontSize: 13, color: ORO, marginTop: 12, fontWeight: '600' },

  beneficiosCard: {
    marginHorizontal: 20, marginBottom: 24,
    backgroundColor: CARD, borderRadius: 16,
    borderWidth: 1, borderColor: BORDE, padding: 20,
  },
  beneficiosTitulo:  { fontSize: 15, fontWeight: '700', color: TEXTO, marginBottom: 16 },
  beneficioRow:      { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  beneficioEmoji:    { fontSize: 22, marginRight: 12, marginTop: 2 },
  beneficioTextos:   { flex: 1 },
  beneficioTitulo:   { fontSize: 14, fontWeight: '700', color: TEXTO },
  beneficioDesc:     { fontSize: 12, color: SUBTEXT, marginTop: 2 },

  btnComprar: {
    marginHorizontal: 20, backgroundColor: VERDE,
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginBottom: 12,
  },
  btnComprarTexto: { fontSize: 17, fontWeight: '800', color: '#000' },
  paywallFooter:   { textAlign: 'center', color: SUBTEXT, fontSize: 11, paddingHorizontal: 30 },

  // Plus activo - header
  plusHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12,
  },
  plusTitulo:  { fontSize: 20, fontWeight: '800', color: VERDE },
  plusFecha:   { fontSize: 12, color: SUBTEXT, marginTop: 2, textTransform: 'capitalize' },
  activoBadge: {
    backgroundColor: VERDE + '22', borderRadius: 8,
    borderWidth: 1, borderColor: VERDE + '66',
    paddingHorizontal: 10, paddingVertical: 4,
  },
  activoTexto: { fontSize: 11, fontWeight: '700', color: VERDE, letterSpacing: 1 },

  // Tabs
  tabs:         { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, gap: 8 },
  tab:          { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: CARD, alignItems: 'center', borderWidth: 1, borderColor: BORDE },
  tabActivo:    { backgroundColor: VERDE + '22', borderColor: VERDE + '88' },
  tabText:      { fontSize: 13, fontWeight: '600', color: SUBTEXT },
  tabTextActivo:{ color: VERDE },

  // Receta card
  recetaCard: {
    marginHorizontal: 20, marginBottom: 12,
    backgroundColor: CARD, borderRadius: 16,
    borderWidth: 1, borderColor: BORDE, padding: 20,
  },
  recetaHeaderRow:   { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  recetaEmoji:       { fontSize: 40, marginRight: 14 },
  recetaHeaderTextos:{ flex: 1 },
  recetaTitulo:      { fontSize: 18, fontWeight: '800', color: TEXTO, marginBottom: 8 },
  recetaBadgesRow:   { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },

  difiBadge:  { borderRadius: 6, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  difiTexto:  { fontSize: 11, fontWeight: '700' },
  infoBadge:  { borderRadius: 6, borderWidth: 1, borderColor: BORDE, backgroundColor: '#1a2540', paddingHorizontal: 8, paddingVertical: 3 },
  infoBadgeTxt: { fontSize: 11, color: SUBTEXT, fontWeight: '600' },

  beneficioBox: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: VERDE + '11', borderRadius: 10,
    borderWidth: 1, borderColor: VERDE + '33',
    padding: 12, marginBottom: 18,
  },
  beneficioBoxEmoji:  { fontSize: 16, marginRight: 8, marginTop: 1 },
  beneficioBoxTexto:  { flex: 1, fontSize: 13, color: VERDE + 'cc', lineHeight: 18 },

  seccionLabel: { fontSize: 13, fontWeight: '700', color: AZUL, marginBottom: 10, letterSpacing: 0.5 },

  ingredientesList: { marginBottom: 16 },
  ingredienteRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  ingredienteDot:   { width: 6, height: 6, borderRadius: 3, backgroundColor: VERDE, marginRight: 10 },
  ingredienteTexto: { fontSize: 14, color: TEXTO, flex: 1 },

  pasosToggle:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  pasosToggleIco: { fontSize: 12, color: AZUL },
  pasosList:      { marginBottom: 8 },
  pasoRow:        { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  pasoNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: AZUL + '33', borderWidth: 1, borderColor: AZUL + '66',
    alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 1,
  },
  pasoNumTexto: { fontSize: 11, fontWeight: '800', color: AZUL },
  pasoTexto:    { flex: 1, fontSize: 14, color: TEXTO, lineHeight: 20 },

  renovacionTexto: { textAlign: 'center', color: SUBTEXT, fontSize: 12, marginBottom: 20 },

  // Consejo card
  consejoCard: {
    marginHorizontal: 20, marginBottom: 14,
    backgroundColor: CARD, borderRadius: 16,
    borderWidth: 1, borderColor: BORDE, padding: 20,
  },
  consejoHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, gap: 12 },
  consejoEmoji:     { fontSize: 36, marginTop: 4 },
  consejoTitulo:    { fontSize: 17, fontWeight: '800', color: TEXTO, marginTop: 6 },
  consejoDesc:      { fontSize: 14, color: TEXTO + 'cc', lineHeight: 22, marginBottom: 16 },

  catBadge:   { borderRadius: 6, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 4 },
  catTexto:   { fontSize: 11, fontWeight: '700' },

  tipRow:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  tipBullet:  { fontSize: 18, color: VERDE, marginRight: 10, lineHeight: 20 },
  tipTexto:   { flex: 1, fontSize: 14, color: TEXTO + 'cc', lineHeight: 20 },

  bonoCard: {
    marginHorizontal: 20, marginBottom: 14,
    backgroundColor: ORO + '0d', borderRadius: 16,
    borderWidth: 1, borderColor: ORO + '33', padding: 20,
  },
  bonoLabel: { fontSize: 11, fontWeight: '800', color: ORO, letterSpacing: 2, marginBottom: 12 },

  // Cancelar
  btnCancelar: {
    marginHorizontal: 20, marginTop: 8, marginBottom: 10,
    paddingVertical: 12, borderRadius: 10,
    borderWidth: 1, borderColor: '#c62828' + '66',
    alignItems: 'center',
  },
  btnCancelarTxt: { fontSize: 13, color: '#ef9a9a' },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: '#000000cc',
    justifyContent: 'center', alignItems: 'center',
  },
  modalCard: {
    backgroundColor: CARD, borderRadius: 20,
    borderWidth: 1, borderColor: BORDE,
    padding: 28, margin: 30, alignItems: 'center',
  },
  modalEmoji:   { fontSize: 48, marginBottom: 12 },
  modalTitulo:  { fontSize: 18, fontWeight: '800', color: TEXTO, marginBottom: 10 },
  modalTexto:   { fontSize: 14, color: SUBTEXT, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  modalBotones: { flexDirection: 'row', gap: 12 },
  modalBtnCancelar: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    borderWidth: 1, borderColor: BORDE, alignItems: 'center',
  },
  modalBtnCancelarTxt:   { color: SUBTEXT, fontWeight: '600' },
  modalBtnConfirmar:     { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: VERDE, alignItems: 'center' },
  modalBtnConfirmarTxt:  { color: '#000', fontWeight: '800' },
});
