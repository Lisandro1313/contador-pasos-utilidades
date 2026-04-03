import { useState, useEffect } from 'react';
import { Pedometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const META_DIARIA = 8000;

export function usePedometer() {
  const [disponible, setDisponible] = useState(false);
  const [pasosHoy, setPasosHoy] = useState(0);
  const [historial, setHistorial] = useState<{ fecha: string; pasos: number }[]>([]);

  useEffect(() => {
    let suscripcion: any;

    const init = async () => {
      const ok = await Pedometer.isAvailableAsync();
      setDisponible(ok);

      // Cargar historial guardado
      const raw = await AsyncStorage.getItem('historial_pasos');
      if (raw) setHistorial(JSON.parse(raw));

      if (ok) {
        // Pasos desde medianoche hasta ahora
        const inicio = new Date();
        inicio.setHours(0, 0, 0, 0);
        const fin = new Date();

        try {
          const resultado = await Pedometer.getStepCountAsync(inicio, fin);
          setPasosHoy(resultado.steps);
        } catch {}

        // Suscripción en tiempo real
        suscripcion = Pedometer.watchStepCount(result => {
          setPasosHoy(prev => {
            const nuevo = prev + result.steps;
            guardarDia(nuevo);
            return nuevo;
          });
        });
      }
    };

    init();
    return () => suscripcion?.remove();
  }, []);

  const guardarDia = async (pasos: number) => {
    const hoy = new Date().toISOString().split('T')[0];
    const raw = await AsyncStorage.getItem('historial_pasos');
    const hist = raw ? JSON.parse(raw) : [];
    const idx = hist.findIndex((h: any) => h.fecha === hoy);
    if (idx >= 0) hist[idx].pasos = pasos;
    else hist.unshift({ fecha: hoy, pasos });
    const ultimos7 = hist.slice(0, 7);
    await AsyncStorage.setItem('historial_pasos', JSON.stringify(ultimos7));
    setHistorial(ultimos7);
  };

  const porcentajeMeta = Math.min((pasosHoy / META_DIARIA) * 100, 100);
  const kmRecorridos = (pasosHoy * 0.0007).toFixed(2);
  const caloriasQuemadas = Math.round(pasosHoy * 0.04);

  return { disponible, pasosHoy, porcentajeMeta, kmRecorridos, caloriasQuemadas, historial, META_DIARIA };
}
