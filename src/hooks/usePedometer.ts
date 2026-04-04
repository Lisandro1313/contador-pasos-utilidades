import { useState, useEffect, useCallback } from 'react';
import { Pedometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const META_DEFAULT = 8000;

export interface DiaHistorial {
  fecha: string;
  pasos: number;
  metaCumplida: boolean;
}

export interface Logro {
  id: string;
  titulo: string;
  descripcion: string;
  emoji: string;
  desbloqueado: boolean;
}

function calcularLogros(total: number, racha: number, mejorDia: number): Logro[] {
  return [
    { id: 'primeros', titulo: 'Primeros pasos', descripcion: '1.000 pasos caminados', emoji: '👟', desbloqueado: total >= 1000 },
    { id: 'meta', titulo: 'Meta cumplida', descripcion: 'Alcanzar la meta diaria por 1er vez', emoji: '🎯', desbloqueado: mejorDia > 0 },
    { id: 'caminante', titulo: 'Caminante', descripcion: '10.000 pasos en un día', emoji: '🚶', desbloqueado: mejorDia >= 10000 },
    { id: 'racha3', titulo: 'En llamas', descripcion: '3 días seguidos con meta cumplida', emoji: '🔥', desbloqueado: racha >= 3 },
    { id: 'semana', titulo: 'Semana perfecta', descripcion: '7 días seguidos con meta cumplida', emoji: '🏆', desbloqueado: racha >= 7 },
    { id: 'explorador', titulo: 'Explorador', descripcion: '100.000 pasos acumulados', emoji: '🌍', desbloqueado: total >= 100000 },
    { id: 'maraton', titulo: 'Maratonista', descripcion: '20.000 pasos en un día', emoji: '🏅', desbloqueado: mejorDia >= 20000 },
    { id: 'millon', titulo: 'Leyenda', descripcion: '1.000.000 pasos acumulados', emoji: '🌟', desbloqueado: total >= 1000000 },
  ];
}

function calcularRacha(hist: DiaHistorial[]): number {
  let racha = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const fechaStr = d.toISOString().split('T')[0];
    const dia = hist.find(h => h.fecha === fechaStr);
    if (dia?.metaCumplida) racha++;
    else break;
  }
  return racha;
}

export function usePedometer() {
  const [disponible, setDisponible] = useState(false);
  const [pasosHoy, setPasosHoy] = useState(0);
  const [historial, setHistorial] = useState<DiaHistorial[]>([]);
  const [meta, setMetaState] = useState(META_DEFAULT);
  const [rachaActual, setRachaActual] = useState(0);
  const [mejorDia, setMejorDia] = useState(0);
  const [totalAcumulado, setTotalAcumulado] = useState(0);

  const actualizarStats = (hist: DiaHistorial[]) => {
    setRachaActual(calcularRacha(hist));
    setMejorDia(hist.reduce((max, d) => Math.max(max, d.pasos), 0));
    setTotalAcumulado(hist.reduce((sum, d) => sum + d.pasos, 0));
  };

  useEffect(() => {
    let suscripcion: ReturnType<typeof Pedometer.watchStepCount> | null = null;

    const init = async () => {
      const metaGuardada = await AsyncStorage.getItem('meta_pasos');
      const metaActual = metaGuardada ? parseInt(metaGuardada) : META_DEFAULT;
      setMetaState(metaActual);

      const raw = await AsyncStorage.getItem('historial_pasos_v2');
      const hist: DiaHistorial[] = raw ? JSON.parse(raw) : [];
      setHistorial(hist);
      actualizarStats(hist);

      const ok = await Pedometer.isAvailableAsync();
      setDisponible(ok);

      if (ok) {
        const inicio = new Date();
        inicio.setHours(0, 0, 0, 0);
        try {
          const res = await Pedometer.getStepCountAsync(inicio, new Date());
          setPasosHoy(res.steps);
          await guardarDia(res.steps, metaActual);
        } catch {}

        suscripcion = Pedometer.watchStepCount(result => {
          setPasosHoy(prev => {
            const nuevo = prev + result.steps;
            guardarDia(nuevo, metaActual);
            return nuevo;
          });
        });
      }
    };

    init();
    return () => { suscripcion?.remove(); };
  }, []);

  const guardarDia = async (pasos: number, metaActual: number) => {
    const hoy = new Date().toISOString().split('T')[0];
    const raw = await AsyncStorage.getItem('historial_pasos_v2');
    const hist: DiaHistorial[] = raw ? JSON.parse(raw) : [];
    const idx = hist.findIndex(h => h.fecha === hoy);
    const entrada: DiaHistorial = { fecha: hoy, pasos, metaCumplida: pasos >= metaActual };
    if (idx >= 0) hist[idx] = entrada;
    else hist.unshift(entrada);
    const ultimos30 = hist.slice(0, 30);
    await AsyncStorage.setItem('historial_pasos_v2', JSON.stringify(ultimos30));
    setHistorial(ultimos30);
    actualizarStats(ultimos30);
  };

  const cambiarMeta = useCallback(async (nuevaMeta: number) => {
    setMetaState(nuevaMeta);
    await AsyncStorage.setItem('meta_pasos', String(nuevaMeta));
    const raw = await AsyncStorage.getItem('historial_pasos_v2');
    if (raw) {
      const hist: DiaHistorial[] = JSON.parse(raw);
      const actualizado = hist.map(d => ({ ...d, metaCumplida: d.pasos >= nuevaMeta }));
      await AsyncStorage.setItem('historial_pasos_v2', JSON.stringify(actualizado));
      setHistorial(actualizado);
      actualizarStats(actualizado);
    }
  }, []);

  const porcentajeMeta = Math.min((pasosHoy / meta) * 100, 100);
  const kmRecorridos = (pasosHoy * 0.0007).toFixed(2);
  const caloriasQuemadas = Math.round(pasosHoy * 0.04);
  const logros = calcularLogros(totalAcumulado + pasosHoy, rachaActual, Math.max(mejorDia, pasosHoy));

  return {
    disponible, pasosHoy, porcentajeMeta, kmRecorridos, caloriasQuemadas,
    historial, meta, cambiarMeta, rachaActual, mejorDia, totalAcumulado, logros,
    META_DIARIA: meta,
  };
}
