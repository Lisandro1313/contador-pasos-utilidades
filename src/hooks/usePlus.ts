import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Tipos ─────────────────────────────────────────────────────────────────────
export interface Receta {
  titulo: string;
  emoji: string;
  tiempo: string;
  calorias: string;
  dificultad: 'Fácil' | 'Media' | 'Rápida';
  ingredientes: string[];
  pasos: string[];
  beneficio: string;
}

export interface Consejo {
  titulo: string;
  emoji: string;
  categoria: 'Ansiedad' | 'Alimentación' | 'Hábitos' | 'Mental';
  descripcion: string;
  tips: string[];
}

// ── Contenido diario ──────────────────────────────────────────────────────────
const RECETAS: Receta[] = [
  {
    titulo: 'Bowl de avena con frutas',
    emoji: '🥣',
    tiempo: '10 min',
    calorias: '320 kcal',
    dificultad: 'Rápida',
    ingredientes: ['1 taza avena', '1 banana', '1 puñado frutos rojos', '1 cda miel', '200ml leche vegetal', 'Canela al gusto'],
    pasos: [
      'Calentá la leche vegetal sin hervir.',
      'Agregá la avena y revolvé 3 minutos.',
      'Colocá en un bowl y sumá la banana en rodajas.',
      'Agregá los frutos rojos y rociá con miel.',
      'Espolvorea canela y serví caliente.',
    ],
    beneficio: 'Rica en fibra, reduce el colesterol y te da energía sostenida toda la mañana.',
  },
  {
    titulo: 'Ensalada de pollo mediterránea',
    emoji: '🥗',
    tiempo: '20 min',
    calorias: '410 kcal',
    dificultad: 'Fácil',
    ingredientes: ['200g pechuga pollo', 'Lechuga mixta', '1 tomate', '1/2 pepino', 'Aceitunas negras', 'Queso feta', 'Aceite de oliva, limón'],
    pasos: [
      'Cocinás el pollo a la plancha con sal, pimienta y orégano.',
      'Cortás las verduras en trozos medianos.',
      'Desmenuzás el pollo y lo mezclás con las verduras.',
      'Agregás aceitunas y queso feta.',
      'Aderezás con aceite de oliva y jugo de limón.',
    ],
    beneficio: 'Alta en proteínas magras y antioxidantes. Ideal para recuperarse después de caminar.',
  },
  {
    titulo: 'Smoothie verde energizante',
    emoji: '🥤',
    tiempo: '5 min',
    calorias: '180 kcal',
    dificultad: 'Rápida',
    ingredientes: ['1 taza espinaca fresca', '1 banana frozen', '1 manzana verde', '200ml agua de coco', '1 cda semillas chía', 'Jengibre rallado'],
    pasos: [
      'Poné todos los ingredientes en la licuadora.',
      'Procesá hasta obtener una mezcla homogénea.',
      'Si queda muy espeso, añadí más agua de coco.',
      'Serví de inmediato para aprovechar los nutrientes.',
    ],
    beneficio: 'Hidratante, detox natural y lleno de vitaminas. Perfecto post-entrenamiento.',
  },
  {
    titulo: 'Huevos revueltos con vegetales',
    emoji: '🍳',
    tiempo: '15 min',
    calorias: '290 kcal',
    dificultad: 'Fácil',
    ingredientes: ['3 huevos', '1/2 morrón rojo', '1/2 cebolla', '1 taza espinaca', '1 tomate cherry', 'Aceite de oliva, sal, pimienta'],
    pasos: [
      'Saltás la cebolla y el morrón en aceite de oliva.',
      'Añadís la espinaca y los tomates, cocinás 2 min.',
      'Batís los huevos con sal y pimienta.',
      'Agregás los huevos a la sartén y revolvés suavemente.',
      'Retirás del fuego cuando estén tiernos.',
    ],
    beneficio: 'Proteína completa con vitaminas del grupo B. Mantiene la saciedad por horas.',
  },
  {
    titulo: 'Sopa de lentejas reconfortante',
    emoji: '🍲',
    tiempo: '35 min',
    calorias: '350 kcal',
    dificultad: 'Media',
    ingredientes: ['1 taza lentejas', '1 zanahoria', '1 tallo apio', '1 cebolla', '2 dientes ajo', 'Tomate triturado', 'Cúrcuma, comino, sal'],
    pasos: [
      'Sofreís ajo, cebolla, zanahoria y apio.',
      'Añadís las especias y cocinás 1 minuto.',
      'Agregás las lentejas y el tomate triturado.',
      'Cubrís con agua o caldo y cocinás 25 minutos.',
      'Procesás la mitad para darle cremosidad.',
    ],
    beneficio: 'Hierro vegetal, fibra y proteína. Anti-inflamatoria por la cúrcuma.',
  },
  {
    titulo: 'Wrap integral de pavo y palta',
    emoji: '🌯',
    tiempo: '10 min',
    calorias: '380 kcal',
    dificultad: 'Rápida',
    ingredientes: ['1 tortilla integral', '100g pavo en fetas', '1/2 palta', 'Lechuga', '1 tomate', 'Mostaza, limón'],
    pasos: [
      'Aplastás la palta con limón, sal y pimienta.',
      'Untás la tortilla con la palta.',
      'Disponés las fetas de pavo y las verduras.',
      'Agregás un hilo de mostaza.',
      'Enrollás firmemente y cortás al medio.',
    ],
    beneficio: 'Grasas buenas del aguacate y proteínas magras. Ideal para llevar.',
  },
  {
    titulo: 'Yogur griego con granola casera',
    emoji: '🧁',
    tiempo: '5 min',
    calorias: '260 kcal',
    dificultad: 'Rápida',
    ingredientes: ['200g yogur griego natural', '1/3 taza granola', '1 puñado mix de frutas', '1 cda manteca de maní', 'Semillas de lino'],
    pasos: [
      'Colocás el yogur en un bowl.',
      'Distribuís la granola por encima.',
      'Agregás las frutas frescas o secas.',
      'Sumás la cucharada de manteca de maní.',
      'Espolvoreas las semillas de lino.',
    ],
    beneficio: 'Probióticos para la flora intestinal + proteínas para músculo + omega-3.',
  },
  {
    titulo: 'Salmón al limón con quinoa',
    emoji: '🐟',
    tiempo: '25 min',
    calorias: '490 kcal',
    dificultad: 'Media',
    ingredientes: ['150g salmón', '1/2 taza quinoa', 'Limón, ajo', 'Espárragos o brócoli', 'Aceite de oliva', 'Eneldo, sal, pimienta'],
    pasos: [
      'Cocinás la quinoa según instrucciones (15 min).',
      'Marinás el salmón con limón, ajo y aceite.',
      'Cocinás el salmón en sartén 4 min por lado.',
      'Saltás el brócoli o espárragos en el mismo aceite.',
      'Servís todo junto y decorás con eneldo.',
    ],
    beneficio: 'Omega-3 para el cerebro y corazón. Quinoa: proteína completa sin gluten.',
  },
  {
    titulo: 'Tazón de acaí antioxidante',
    emoji: '🫐',
    tiempo: '10 min',
    calorias: '300 kcal',
    dificultad: 'Rápida',
    ingredientes: ['200g pulpa acaí frozen', '1 banana', '100ml leche de almendras', 'Granola, coco rallado', 'Kiwi, frutillas, mango'],
    pasos: [
      'Procesás el acaí con la banana y la leche de almendras.',
      'Debe quedar cremoso como helado.',
      'Volcás en un bowl.',
      'Decorás con granola, fruta fresca y coco rallado.',
    ],
    beneficio: 'El acaí tiene 10x más antioxidantes que las uvas. Combate el envejecimiento celular.',
  },
  {
    titulo: 'Tortilla de vegetales sin gluten',
    emoji: '🫓',
    tiempo: '20 min',
    calorias: '320 kcal',
    dificultad: 'Fácil',
    ingredientes: ['3 huevos', '1 zucchini', '1/2 cebolla morada', 'Champiñones', 'Queso untable light', 'Cúrcuma, orégano'],
    pasos: [
      'Rallás el zucchini y exprimís el exceso de agua.',
      'Saltás la cebolla y los champiñones.',
      'Batís los huevos con cúrcuma y orégano.',
      'Mezclás todo y cocinás en sartén tapada a fuego bajo.',
      'Cuando está firme, doblás y servís.',
    ],
    beneficio: 'Sin gluten, baja en carbohidratos. Ideal para celiacs o dietas keto suaves.',
  },
  {
    titulo: 'Buddha bowl colorido',
    emoji: '🌈',
    tiempo: '30 min',
    calorias: '440 kcal',
    dificultad: 'Media',
    ingredientes: ['1/2 taza arroz integral', '1/2 lata garbanzos', 'Batata asada', 'Zanahoria rallada', 'Palta', 'Edamame', 'Salsa tahini-limón'],
    pasos: [
      'Cocinás el arroz integral.',
      'Asás los garbanzos con pimentón y aceite (20 min, 200°C).',
      'Asás la batata cortada en cubos.',
      'Disponés todos los ingredientes en el bowl.',
      'Rociás con salsa de tahini, jugo de limón y sésamo.',
    ],
    beneficio: 'Proteínas vegetales completas, fibra prebiótica y grasas saludables en un solo plato.',
  },
  {
    titulo: 'Pollo al curry con verduras',
    emoji: '🍛',
    tiempo: '30 min',
    calorias: '420 kcal',
    dificultad: 'Media',
    ingredientes: ['200g pechuga pollo', 'Leche de coco light', 'Cebolla, ajo, jengibre', 'Brócoli, zanahoria', 'Curry en polvo', 'Arroz basmati'],
    pasos: [
      'Sofreís cebolla, ajo y jengibre rallado.',
      'Añadís curry y cocinás 1 minuto.',
      'Sumás el pollo en cubos y sellás.',
      'Agregás las verduras y la leche de coco.',
      'Cocinás 15 min. Servís sobre arroz basmati.',
    ],
    beneficio: 'Jengibre y cúrcuma del curry: potentes antiinflamatorios naturales.',
  },
  {
    titulo: 'Ensalada de garbanzos tikka',
    emoji: '🫘',
    tiempo: '15 min',
    calorias: '370 kcal',
    dificultad: 'Fácil',
    ingredientes: ['1 lata garbanzos', 'Pepino, tomate, cebolla morada', 'Yogur griego', 'Limón, cilantro', 'Garam masala', 'Menta fresca'],
    pasos: [
      'Escurrís y enjuagás los garbanzos.',
      'Picás fino el pepino, tomate y cebolla.',
      'Mezclás el yogur con limón y garam masala.',
      'Combinás garbanzos y vegetales.',
      'Aderezás y decorás con cilantro y menta.',
    ],
    beneficio: 'Alto en proteínas vegetales y probióticos. Muy saciante y liviano.',
  },
  {
    titulo: 'Banana nice cream',
    emoji: '🍦',
    tiempo: '5 min',
    calorias: '150 kcal',
    dificultad: 'Rápida',
    ingredientes: ['3 bananas congeladas', 'Cacao en polvo (opcional)', 'Manteca de maní (opcional)', 'Frutos rojos para decorar'],
    pasos: [
      'Procesás las bananas congeladas en la procesadora.',
      'Añadís cacao o manteca de maní si querés.',
      'Procesás hasta textura cremosa (como helado).',
      'Servís de inmediato o congelás 30 min para más firmeza.',
    ],
    beneficio: 'Postre sin azúcar agregada, sin lactosa. La banana madura es naturalmente dulce.',
  },
];

const CONSEJOS: Consejo[] = [
  {
    titulo: 'La regla de los 20 minutos',
    emoji: '⏱️',
    categoria: 'Alimentación',
    descripcion: 'Tu cerebro tarda 20 minutos en registrar que estás lleno. Comer despacio es el hack más efectivo para no excederte.',
    tips: [
      'Dejá el tenedor entre bocado y bocado.',
      'Masticá cada bocado al menos 15 veces.',
      'Comé sin pantallas para estar presente.',
      'Si tenés dudas sobre si seguir comiendo, esperá 5 minutos.',
    ],
  },
  {
    titulo: 'Hidratación anti-hambre falso',
    emoji: '💧',
    categoria: 'Hábitos',
    descripcion: 'El 70% de las veces que sentís hambre entre comidas, en realidad tenés sed. El cerebro confunde ambas señales.',
    tips: [
      'Tomá 1 vaso de agua antes de cada comida.',
      'Antes de comer algo fuera de horario, primero tomá agua.',
      'Apuntá a 8 vasos (2L) distribuidos a lo largo del día.',
      'Infusiones sin azúcar también cuentan.',
    ],
  },
  {
    titulo: 'Respiración 4-7-8 para la ansiedad',
    emoji: '🌬️',
    categoria: 'Ansiedad',
    descripcion: 'Técnica creada por el Dr. Andrew Weil: activa el sistema nervioso parasimpático y reduce el cortisol en minutos.',
    tips: [
      'Inhalá por la nariz durante 4 segundos.',
      'Retené el aire durante 7 segundos.',
      'Exhalá por la boca durante 8 segundos.',
      'Repetí 4 ciclos, 2 veces al día. En 4 semanas notarás diferencia.',
    ],
  },
  {
    titulo: 'Reemplazar sin privarte',
    emoji: '🔄',
    categoria: 'Alimentación',
    descripcion: 'La privación genera ansiedad y atracones. El secreto es reemplazar, no eliminar. Tu cerebro no nota la diferencia si el reemplazo satisface el mismo deseo.',
    tips: [
      'Chips → pochoclo de aire caliente con sal de mar.',
      'Helado → banana nice cream (banana frozen procesada).',
      'Gaseosa → agua con gas + limón + menta.',
      'Chocolate con leche → 2 cuadraditos de chocolate 70%.',
    ],
  },
  {
    titulo: 'El efecto del ambiente en lo que comés',
    emoji: '🏡',
    categoria: 'Hábitos',
    descripcion: 'Tu entorno predice tu comportamiento más que tu fuerza de voluntad. Diseñar tu cocina es más efectivo que "tener disciplina".',
    tips: [
      'Poné fruta visible en la mesada, no en la heladera.',
      'Guardá los snacks poco saludables en lugares difíciles de alcanzar.',
      'Preparate snacks saludables para la semana los domingos.',
      'Comé en platos más chicos: comés 20% menos de forma automática.',
    ],
  },
  {
    titulo: 'Sueño y antojos: la conexión oculta',
    emoji: '😴',
    categoria: 'Mental',
    descripcion: 'Dormir mal aumenta la grelina (hormona del hambre) y baja la leptina (saciedad). Una noche mal dormida = antojos de azúcar todo el día.',
    tips: [
      'Dormí entre 7 y 9 horas. No es negociable para la salud.',
      'Apagá pantallas 1 hora antes de dormir.',
      'Temperatura fresca en el cuarto mejora la calidad del sueño.',
      'Evitá cafeína después de las 14hs.',
    ],
  },
  {
    titulo: 'Mindful eating: comer consciente',
    emoji: '🧘',
    categoria: 'Mental',
    descripcion: 'No es una dieta, es cambiar la relación con la comida. Comer con atención plena reduce el atracón emocional hasta un 60%.',
    tips: [
      'Antes de comer, preguntate: ¿tengo hambre física o emocional?',
      'Describí internamente sabores, texturas y aromas.',
      'Comé sentado, en mesa, sin apuro.',
      'Agradecé el alimento: crea vínculo positivo con la alimentación.',
    ],
  },
  {
    titulo: 'El azúcar: cómo salir sin sufrimiento',
    emoji: '🍬',
    categoria: 'Alimentación',
    descripcion: 'El azúcar activa los mismos circuitos de recompensa que ciertas drogas. La buena noticia: el antojo dura solo 20 minutos si no le das.',
    tips: [
      'Esperá 20 minutos antes de ceder a un antojo de dulce.',
      'Reducí el azúcar gradualmente (tu paladar se adapta en 2 semanas).',
      'La canela en el café o el desayuno reduce el antojo de dulce.',
      'Comé proteínas en el desayuno: reducen el antojo de azúcar durante el día.',
    ],
  },
  {
    titulo: 'Comer de noche: por qué pasa y cómo pararlo',
    emoji: '🌙',
    categoria: 'Hábitos',
    descripcion: 'El "hambre nocturno" casi siempre es emocional o hábito condicionado. El cuerpo no necesita calorías extra de noche.',
    tips: [
      'Identificá qué emoción dispara el hambre nocturno (aburrimiento, estrés, ansiedad).',
      'Cepillate los dientes después de cenar: manda señal de "cierre" al cerebro.',
      'Tomá una infusión caliente (manzanilla, valeriana) como ritual de cierre.',
      'Si tenés hambre real, elegí algo proteico: un yogur o puñado de almendras.',
    ],
  },
  {
    titulo: 'Estrés = cortisol = grasa abdominal',
    emoji: '😤',
    categoria: 'Ansiedad',
    descripcion: 'El estrés crónico eleva el cortisol, que ordena al cuerpo acumular grasa en el abdomen. Manejar el estrés es tan importante como hacer ejercicio.',
    tips: [
      'Caminata de 20 min baja el cortisol más que cualquier medicamento.',
      'Escribir sobre lo que te preocupa reduce la carga mental.',
      'Reír genuinamente (serie, video, amigos) baja el cortisol un 30%.',
      'Magnesio (nueces, espinaca, chocolate negro) reduce el estrés fisiológicamente.',
    ],
  },
  {
    titulo: 'El plato ideal sin calcular calorías',
    emoji: '🍽️',
    categoria: 'Alimentación',
    descripcion: 'El método del plato de Harvard: sin apps, sin pesar, sin obsesionarse. Solo una guía visual que funciona.',
    tips: [
      '1/2 plato = verduras y frutas de colores variados.',
      '1/4 plato = proteínas (pollo, pescado, legumbres, huevo).',
      '1/4 plato = carbohidratos integrales (arroz integral, quinoa, papa).',
      'Un chorrito de aceite de oliva como grasa buena.',
    ],
  },
  {
    titulo: 'Movimiento vs. ejercicio: la diferencia importa',
    emoji: '🚶',
    categoria: 'Hábitos',
    descripcion: 'No necesitás ir al gimnasio. El movimiento cotidiano (NEAT) quema hasta 350 kcal extra por día y es más sostenible que las rutinas.',
    tips: [
      'Subí escaleras en vez de usar el ascensor.',
      'Llamadas por teléfono: caminá mientras hablás.',
      'Cada 1 hora sentado, parate 5 minutos.',
      '10 min de estiramiento al despertar activa tu metabolismo.',
    ],
  },
  {
    titulo: 'La microbiota: el segundo cerebro',
    emoji: '🦠',
    categoria: 'Mental',
    descripcion: 'El 90% de la serotonina (hormona del bienestar) se produce en el intestino, no en el cerebro. Lo que comés afecta directamente tu estado de ánimo.',
    tips: [
      'Fermentados: yogur natural, kéfir, chucrut, kimchi (una porción al día).',
      'Prebióticos: ajo, cebolla, banana, avena (alimentan las bacterias buenas).',
      'Variedad: intentá comer 30 tipos de plantas distintas por semana.',
      'Antibióticos destruyen la microbiota: tomá probióticos después de un tratamiento.',
    ],
  },
  {
    titulo: 'Emociones y comida: el mapa',
    emoji: '💭',
    categoria: 'Mental',
    descripcion: 'Cada emoción tiene un "antojo" asociado. Reconocerlos es el primer paso para no comer en piloto automático.',
    tips: [
      'Estrés → antojos de salado y crujiente (chips). Reemplazá con: pepino con sal y limón.',
      'Tristeza → dulce y reconfortante. Reemplazá con: cacao caliente sin azúcar.',
      'Aburrimiento → cualquier cosa. Reemplazá con: salir a caminar.',
      'Ansiedad → carbohidratos rápidos. Reemplazá con: respiración 4-7-8.',
    ],
  },
];

// ── Hook ──────────────────────────────────────────────────────────────────────
const STORAGE_KEY = '@soysaludable_plus';

function getDiaDelAnio(): number {
  const ahora = new Date();
  const inicio = new Date(ahora.getFullYear(), 0, 0);
  const diff = ahora.getTime() - inicio.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function usePlus() {
  const [esPremium, setEsPremium] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(val => {
      setEsPremium(val === 'true');
      setCargando(false);
    });
  }, []);

  const activarPlus = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
    setEsPremium(true);
  };

  const cancelarPlus = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setEsPremium(false);
  };

  const dia = getDiaDelAnio();
  const recetaHoy: Receta = RECETAS[dia % RECETAS.length];
  const consejoHoy: Consejo = CONSEJOS[dia % CONSEJOS.length];

  // Consejo extra (desplazado +7 para variedad)
  const consejoBono: Consejo = CONSEJOS[(dia + 7) % CONSEJOS.length];

  return { esPremium, cargando, activarPlus, cancelarPlus, recetaHoy, consejoHoy, consejoBono };
}
