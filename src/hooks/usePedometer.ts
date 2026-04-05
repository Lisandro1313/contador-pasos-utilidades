import { useState, useEffect, useCallback, useRef } from 'react';
import { Pedometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  solicitarPermisosNotificaciones,
  crearCanalAndroid,
  programarRecordatorios,
  notificarMetaCumplida,
  notificarHito,
} from './useNotificaciones';

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
    { id: 'primeros',   titulo: 'Primeros pasos',  descripcion: '1.000 pasos caminados',             emoji: '👟', desbloqueado: total >= 1000 },
    { id: 'meta',       titulo: 'Meta cumplida',   descripcion: 'Alcanzar la meta diaria por 1er vez',emoji: '🎯', desbloqueado: mejorDia > 0 },
    { id: 'caminante',  titulo: 'Caminante',        descripcion: '10.000 pasos en un día',             emoji: '🚶', desbloqueado: mejorDia >= 10000 },
    { id: 'racha3',     titulo: 'En llamas',        descripcion: '3 días seguidos con meta cumplida',  emoji: '🔥', desbloqueado: racha >= 3 },
    { id: 'semana',     titulo: 'Semana perfecta',  descripcion: '7 días seguidos con meta cumplida',  emoji: '🏆', desbloqueado: racha >= 7 },
    { id: 'explorador', titulo: 'Explorador',       descripcion: '100.000 pasos acumulados',           emoji: '🌍', desbloqueado: total >= 100000 },
    { id: 'maraton',    titulo: 'Maratonista',      descripcion: '20.000 pasos en un día',             emoji: '🏅', desbloqueado: mejorDia >= 20000 },
    { id: 'millon',     titulo: 'Leyenda',          descripcion: '1.000.000 pasos acumulados',         emoji: '🌟', desbloqueado: total >= 1000000 },
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
  const [permisoOtorgado, setPermisoOtorgado] = useState(false);
  const [pasosHoy, setPasosHoy] = useState(0);
  const [historial, setHistorial] = useState<DiaHistorial[]>([]);
  const [meta, setMetaState] = useState(META_DEFAULT);
  const [rachaActual, setRachaActual] = useState(0);
  const [mejorDia, setMejorDia] = useState(0);
  const [totalAcumulado, setTotalAcumulado] = useState(0);
  const [notificacionesActivas, setNotificacionesActivas] = useState(false);

  // Rastreo de hitos para no notificar dos veces el mismo hito
  const hitosNotificados = useRef<Set<number>>(new Set());
  const metaNotificada = useRef(false);

  const actualizarStats = (hist: DiaHistorial[]) => {
    setRachaActual(calcularRacha(hist));
    setMejorDia(hist.reduce((max, d) => Math.max(max, d.pasos), 0));
    setTotalAcumulado(hist.reduce((sum, d) => sum + d.pasos, 0));
  };

  const guardarDia = useCallback(async (pasos: number, metaActual: number) => {
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
  }, []);

  // Disparar notificaciones de hitos cuando el progreso alcanza 25/50/75/100%
  const checkNotificaciones = useCallback(async (pasos: number, metaActual: number) => {
    const pct = (pasos / metaActual) * 100;

    // Meta cumplida (100%)
    if (pct >= 100 && !metaNotificada.current) {
      metaNotificada.current = true;
      await notificarMetaCumplida(pasos, metaActual);
      return;
    }

    // Hitos: 25, 50, 75
    for (const hito of [25, 50, 75]) {
      if (pct >= hito && !hitosNotificados.current.has(hito)) {
        hitosNotificados.current.add(hito);
        await notificarHito(pct, pasos, metaActual);
        break;
      }
    }
  }, []);

  useEffect(() => {
    let suscripcion: ReturnType<typeof Pedometer.watchStepCount> | null = null;

    const init = async () => {
      // 1. Cargar meta guardada
      const metaGuardada = await AsyncStorage.getItem('meta_pasos');
      const metaActual = metaGuardada ? parseInt(metaGuardada) : META_DEFAULT;
      setMetaState(metaActual);

      // 2. Cargar historial
      const raw = await AsyncStorage.getItem('historial_pasos_v2');
      const hist: DiaHistorial[] = raw ? JSON.parse(raw) : [];
      setHistorial(hist);
      actualizarStats(hist);

      // 3. Crear canal de notificaciones Android
      await crearCanalAndroid();

      // 4. Solicitar permiso de ACTIVIDAD (Android 10+)
      const { status } = await Pedometer.requestPermissionsAsync();
      const tienePermiso = status === 'granted';
      setPermisoOtorgado(tienePermiso);

      if (!tienePermiso) {
        setDisponible(false);
        return;
      }

      // 5. Verificar si el hardware está disponible
      const ok = await Pedometer.isAvailableAsync();
      setDisponible(ok);

      if (!ok) return;

      // 6. Solicitar permisos de notificaciones y programar recordatorios
      const notifOk = await solicitarPermisosNotificaciones();
      setNotificacionesActivas(notifOk);
      if (notifOk) {
        await programarRecordatorios(metaActual);
      }

      // 7. Obtener pasos de hoy desde medianoche
      const inicioDelDia = new Date();
      inicioDelDia.setHours(0, 0, 0, 0);
      try {
        const res = await Pedometer.getStepCountAsync(inicioDelDia, new Date());
        const pasosIniciales = res.steps;
        setPasosHoy(pasosIniciales);
        await guardarDia(pasosIniciales, metaActual);
        await checkNotificaciones(pasosIniciales, metaActual);
      } catch {}

      // 8. Escuchar nuevos pasos en tiempo real (watchStepCount devuelve delta)
      suscripcion = Pedometer.watchStepCount(result => {
        setPasosHoy(prev => {
          const nuevo = prev + result.steps;
          guardarDia(nuevo, metaActual);
          checkNotificaciones(nuevo, metaActual);
          return nuevo;
        });
      });
    };

    init();
    return () => { suscripcion?.remove(); };
  }, [guardarDia, checkNotificaciones]);

  const cambiarMeta = useCallback(async (nuevaMeta: number) => {
    setMetaState(nuevaMeta);
    metaNotificada.current = false;
    hitosNotificados.current = new Set();
    await AsyncStorage.setItem('meta_pasos', String(nuevaMeta));

    // Reprogramar notificaciones con nueva meta
    const notifOk = notificacionesActivas;
    if (notifOk) await programarRecordatorios(nuevaMeta);

    const raw = await AsyncStorage.getItem('historial_pasos_v2');
    if (raw) {
      const hist: DiaHistorial[] = JSON.parse(raw);
      const actualizado = hist.map(d => ({ ...d, metaCumplida: d.pasos >= nuevaMeta }));
      await AsyncStorage.setItem('historial_pasos_v2', JSON.stringify(actualizado));
      setHistorial(actualizado);
      actualizarStats(actualizado);
    }
  }, [notificacionesActivas]);

  const porcentajeMeta = Math.min((pasosHoy / meta) * 100, 100);
  const kmRecorridos = (pasosHoy * 0.0007).toFixed(2);
  const caloriasQuemadas = Math.round(pasosHoy * 0.04);
  const logros = calcularLogros(totalAcumulado + pasosHoy, rachaActual, Math.max(mejorDia, pasosHoy));

  return {
    disponible, permisoOtorgado, notificacionesActivas,
    pasosHoy, porcentajeMeta, kmRecorridos, caloriasQuemadas,
    historial, meta, cambiarMeta,
    rachaActual, mejorDia, totalAcumulado, logros,
    META_DIARIA: meta,
  };
}
