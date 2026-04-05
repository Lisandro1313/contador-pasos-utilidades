import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Vibration,
} from 'react-native';
import * as Battery from 'expo-battery';
import { Accelerometer } from 'expo-sensors';

export default function UtilsScreen() {
  // Batería
  const [bateria, setBateria] = useState<number | null>(null);
  const [cargando, setCargando] = useState(false);

  // Cronómetro
  const [cronActivo, setCronActivo] = useState(false);
  const [cronTiempo, setCronTiempo] = useState(0);
  const cronRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Nivel (burbuja)
  const [inclinacion, setInclinacion] = useState({ x: 0, y: 0 });

  // Brújula simplificada (usa acelerómetro)
  const [accel, setAccel] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    // Batería
    Battery.getBatteryLevelAsync().then(level => setBateria(Math.round(level * 100)));
    Battery.getBatteryStateAsync().then(state => setCargando(state === Battery.BatteryState.CHARGING));

    const batSub = Battery.addBatteryLevelListener(({ batteryLevel }) => {
      setBateria(Math.round(batteryLevel * 100));
    });

    // Acelerómetro para nivel
    Accelerometer.setUpdateInterval(200);
    const accelSub = Accelerometer.addListener(data => {
      setAccel(data);
      setInclinacion({ x: data.x, y: data.y });
    });

    return () => {
      batSub.remove();
      accelSub.remove();
      if (cronRef.current) clearInterval(cronRef.current);
    };
  }, []);

  // Cronómetro
  const toggleCron = () => {
    if (cronActivo) {
      if (cronRef.current) clearInterval(cronRef.current);
      cronRef.current = null;
    } else {
      cronRef.current = setInterval(() => setCronTiempo(t => t + 10), 10);
    }
    setCronActivo(!cronActivo);
  };

  const resetCron = () => {
    if (cronRef.current) clearInterval(cronRef.current);
    cronRef.current = null;
    setCronActivo(false);
    setCronTiempo(0);
  };

  const formatCron = (ms: number) => {
    const min = Math.floor(ms / 60000).toString().padStart(2, '0');
    const sec = Math.floor((ms % 60000) / 1000).toString().padStart(2, '0');
    const cent = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
    return `${min}:${sec}.${cent}`;
  };

  // Nivel burbuja — calcular posición
  const RADIO = 60;
  const bx = Math.max(-RADIO, Math.min(RADIO, inclinacion.x * -RADIO));
  const by = Math.max(-RADIO, Math.min(RADIO, inclinacion.y * RADIO));
  const nivelado = Math.abs(inclinacion.x) < 0.05 && Math.abs(inclinacion.y) < 0.05;

  // Color batería
  const colorBateria = bateria === null ? '#666' : bateria > 50 ? '#3fb950' : bateria > 20 ? '#f0a500' : '#f85149';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titulo}>🔧 Utilidades</Text>

      {/* Batería */}
      <View style={styles.card}>
        <Text style={styles.cardTitulo}>🔋 Batería</Text>
        <View style={styles.bateriaRow}>
          <View style={styles.bateriaIcono}>
            <View style={[styles.bateriaRelleno, {
              width: `${bateria ?? 0}%` as `${number}%`,
              backgroundColor: colorBateria,
            }]} />
          </View>
          <Text style={[styles.bateriaPorcentaje, { color: colorBateria }]}>
            {bateria !== null ? `${bateria}%` : '...'}
          </Text>
          {cargando && <Text style={styles.cargandoTag}>⚡ Cargando</Text>}
        </View>
      </View>

      {/* Cronómetro */}
      <View style={styles.card}>
        <Text style={styles.cardTitulo}>⏱️ Cronómetro</Text>
        <Text style={styles.cronDisplay}>{formatCron(cronTiempo)}</Text>
        <View style={styles.cronBotones}>
          <TouchableOpacity
            style={[styles.cronBtn, cronActivo && styles.cronBtnStop]}
            onPress={toggleCron}
          >
            <Text style={styles.cronBtnText}>{cronActivo ? '⏹ Parar' : '▶ Iniciar'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cronBtnReset} onPress={resetCron}>
            <Text style={styles.cronBtnText}>↺ Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Nivel burbuja */}
      <View style={styles.card}>
        <Text style={styles.cardTitulo}>🫧 Nivel</Text>
        <Text style={styles.nivelSub}>Usá para verificar si algo está a nivel</Text>
        <View style={styles.nivelCirculo}>
          <View style={[styles.nivelCruz, styles.nivelCruzH]} />
          <View style={[styles.nivelCruz, styles.nivelCruzV]} />
          <View style={[
            styles.burbuja,
            { transform: [{ translateX: bx }, { translateY: by }] },
            nivelado && styles.burbujaOk,
          ]} />
        </View>
        <Text style={[styles.nivelTexto, nivelado && styles.nivelTextoOk]}>
          {nivelado ? '✅ Perfectamente nivelado' : `X: ${inclinacion.x.toFixed(2)}  Y: ${inclinacion.y.toFixed(2)}`}
        </Text>
      </View>

      {/* Vibración */}
      <View style={styles.card}>
        <Text style={styles.cardTitulo}>📳 Vibración</Text>
        <View style={styles.vibRow}>
          {[
            { label: 'Corta', ms: 100 },
            { label: 'Media', ms: 400 },
            { label: 'Larga', ms: 1000 },
          ].map(v => (
            <TouchableOpacity
              key={v.ms}
              style={styles.vibBtn}
              onPress={() => Vibration.vibrate(v.ms)}
            >
              <Text style={styles.vibBtnText}>{v.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },
  content: { padding: 16, paddingBottom: 40 },
  titulo: {
    fontSize: 22, fontWeight: 'bold', color: '#58a6ff',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#161b22', borderRadius: 16,
    padding: 18, marginBottom: 14,
  },
  cardTitulo: { color: '#58a6ff', fontWeight: '700', fontSize: 15, marginBottom: 14 },

  // Batería
  bateriaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bateriaIcono: {
    flex: 1, height: 24, backgroundColor: '#21262d',
    borderRadius: 6, overflow: 'hidden',
    borderWidth: 1, borderColor: '#30363d',
  },
  bateriaRelleno: { height: '100%', borderRadius: 5 },
  bateriaPorcentaje: { fontSize: 20, fontWeight: 'bold', minWidth: 50 },
  cargandoTag: { color: '#f0a500', fontSize: 13 },

  // Cronómetro
  cronDisplay: {
    fontSize: 48, fontWeight: 'bold', color: '#fff',
    textAlign: 'center', fontVariant: ['tabular-nums'],
    marginBottom: 16,
  },
  cronBotones: { flexDirection: 'row', gap: 12 },
  cronBtn: {
    flex: 1, backgroundColor: '#238636',
    paddingVertical: 14, borderRadius: 12, alignItems: 'center',
  },
  cronBtnStop: { backgroundColor: '#da3633' },
  cronBtnReset: {
    flex: 1, backgroundColor: '#21262d',
    paddingVertical: 14, borderRadius: 12, alignItems: 'center',
  },
  cronBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Nivel
  nivelSub: { color: '#666', fontSize: 13, marginBottom: 16 },
  nivelCirculo: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: '#21262d', borderWidth: 2, borderColor: '#30363d',
    alignSelf: 'center', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  nivelCruz: { position: 'absolute', backgroundColor: '#30363d' },
  nivelCruzH: { width: '100%', height: 1 },
  nivelCruzV: { width: 1, height: '100%' },
  burbuja: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#58a6ff88', borderWidth: 2, borderColor: '#58a6ff',
  },
  burbujaOk: { backgroundColor: '#3fb95088', borderColor: '#3fb950' },
  nivelTexto: { color: '#888', textAlign: 'center', marginTop: 12, fontSize: 14 },
  nivelTextoOk: { color: '#3fb950', fontWeight: '700' },

  // Vibración
  vibRow: { flexDirection: 'row', gap: 10 },
  vibBtn: {
    flex: 1, backgroundColor: '#21262d',
    paddingVertical: 14, borderRadius: 12, alignItems: 'center',
    borderWidth: 1, borderColor: '#30363d',
  },
  vibBtnText: { color: '#ccc', fontWeight: '600', fontSize: 14 },
});
