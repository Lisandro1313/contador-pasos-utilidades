import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ── Configuración global del handler ─────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ── IDs de notificaciones programadas ────────────────────────────────────────
const ID_MANANA = 'rec_manana';
const ID_MEDIODIA = 'rec_mediodia';
const ID_TARDE = 'rec_tarde';
const ID_NOCHE = 'rec_noche';

// ── Solicitar permisos ────────────────────────────────────────────────────────
export async function solicitarPermisosNotificaciones(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const { status: existente } = await Notifications.getPermissionsAsync();
  if (existente === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ── Canal Android ─────────────────────────────────────────────────────────────
export async function crearCanalAndroid() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('pasos', {
    name: 'SoySaludable+ Pasos',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#00C853',
    sound: 'default',
  });
}

// ── Programar recordatorios diarios ──────────────────────────────────────────
export async function programarRecordatorios(meta: number) {
  // Cancelar existentes primero
  await cancelarRecordatorios();

  // 8:00 AM — Arranque del día
  await Notifications.scheduleNotificationAsync({
    identifier: ID_MANANA,
    content: {
      title: '🌅 ¡Buenos días! Arrancá el día',
      body: `Tu meta de hoy: ${meta.toLocaleString()} pasos. ¡Vamos a caminar! 👟`,
      sound: 'default',
      data: { tipo: 'recordatorio' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 8,
      minute: 0,
    },
  });

  // 12:00 PM — Chequeo del mediodía
  await Notifications.scheduleNotificationAsync({
    identifier: ID_MEDIODIA,
    content: {
      title: '☀️ Chequeo del mediodía',
      body: '¿Cómo vas con tus pasos? Abrí SoySaludable+ para ver tu progreso 🦶',
      sound: 'default',
      data: { tipo: 'recordatorio' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 12,
      minute: 0,
    },
  });

  // 17:00 PM — Empujón de la tarde
  await Notifications.scheduleNotificationAsync({
    identifier: ID_TARDE,
    content: {
      title: '💪 ¡Último empujón!',
      body: `Quedan pocas horas para completar tus ${meta.toLocaleString()} pasos. ¡Dale!`,
      sound: 'default',
      data: { tipo: 'recordatorio' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 17,
      minute: 0,
    },
  });

  // 21:00 PM — Resumen nocturno
  await Notifications.scheduleNotificationAsync({
    identifier: ID_NOCHE,
    content: {
      title: '🌙 Resumen del día',
      body: 'Mirá cuántos pasos hiciste hoy y preparate para mañana 📊',
      sound: 'default',
      data: { tipo: 'resumen' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 21,
      minute: 0,
    },
  });
}

// ── Notificación inmediata: meta cumplida ────────────────────────────────────
export async function notificarMetaCumplida(pasos: number, meta: number) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🏆 ¡META CUMPLIDA!',
      body: `¡Increíble! Hiciste ${pasos.toLocaleString()} pasos hoy. ¡Superaste tu meta de ${meta.toLocaleString()}! 🎉`,
      sound: 'default',
      data: { tipo: 'meta' },
    },
    trigger: null, // inmediata
  });
}

// ── Notificación inmediata: hito de progreso ─────────────────────────────────
export async function notificarHito(porcentaje: number, pasos: number, meta: number) {
  const faltantes = meta - pasos;
  let titulo = '';
  let body = '';

  if (porcentaje >= 25 && porcentaje < 50) {
    titulo = '🔥 ¡25% completado!';
    body = `Llevas ${pasos.toLocaleString()} pasos. Te faltan ${faltantes.toLocaleString()} para la meta.`;
  } else if (porcentaje >= 50 && porcentaje < 75) {
    titulo = '💪 ¡Mitad del camino!';
    body = `${pasos.toLocaleString()} pasos hechos. ¡Ya estás en la mitad! ${faltantes.toLocaleString()} para terminar.`;
  } else if (porcentaje >= 75 && porcentaje < 100) {
    titulo = '⚡ ¡Casi llegás!';
    body = `Solo te faltan ${faltantes.toLocaleString()} pasos para tu meta. ¡No pares ahora!`;
  }

  if (!titulo) return;

  await Notifications.scheduleNotificationAsync({
    content: { title: titulo, body, sound: 'default', data: { tipo: 'hito' } },
    trigger: null,
  });
}

// ── Cancelar todos los recordatorios ─────────────────────────────────────────
export async function cancelarRecordatorios() {
  await Notifications.cancelScheduledNotificationAsync(ID_MANANA).catch(() => {});
  await Notifications.cancelScheduledNotificationAsync(ID_MEDIODIA).catch(() => {});
  await Notifications.cancelScheduledNotificationAsync(ID_TARDE).catch(() => {});
  await Notifications.cancelScheduledNotificationAsync(ID_NOCHE).catch(() => {});
}
