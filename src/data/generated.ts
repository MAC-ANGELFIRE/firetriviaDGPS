import type { Raw } from "./bank1";

// PRNG determinista para que el banco sea estable entre seeds
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const rand = rng(20240607);
function pick<T>(arr: T[], n: number, exclude: (t: T) => boolean = () => false): T[] {
  const pool = arr.filter((x) => !exclude(x));
  const out: T[] = [];
  const copy = [...pool];
  while (out.length < n && copy.length) {
    const i = Math.floor(rand() * copy.length);
    out.push(copy.splice(i, 1)[0]);
  }
  return out;
}

const out: Raw[] = [];

/* ---------- 1. Nutrientes y alimentos ---------- */
const nutrientes: { n: string; foods: string[]; wrong: string[]; fn: string; lvl: string }[] = [
  { n: "vitamina C", foods: ["Naranja", "Kiwi", "Frutilla", "Morrón rojo", "Guayaba", "Mburucuyá (maracuyá)"], wrong: ["Arroz blanco", "Manteca", "Pan blanco", "Fideos", "Aceite", "Azúcar"], fn: "fortalece las defensas y ayuda a absorber el hierro", lvl: "principiante" },
  { n: "calcio", foods: ["Yogur natural", "Queso Paraguay", "Leche", "Sardinas con espinas", "Brócoli", "Semillas de sésamo"], wrong: ["Gaseosa", "Caramelos", "Papas fritas", "Banana", "Mandioca", "Carne de cerdo"], fn: "mantiene huesos y dientes fuertes", lvl: "principiante" },
  { n: "hierro", foods: ["Hígado vacuno", "Lentejas", "Carne roja magra", "Espinaca", "Porotos", "Acelga"], wrong: ["Manzana", "Pepino", "Gaseosa", "Manteca", "Sandía", "Arroz blanco"], fn: "previene la anemia", lvl: "medio" },
  { n: "potasio", foods: ["Banana", "Palta (aguacate)", "Batata", "Papa con cáscara", "Naranja", "Tomate"], wrong: ["Aceite", "Pan blanco", "Manteca", "Azúcar", "Caramelos", "Fideos"], fn: "regula la presión arterial y la función muscular", lvl: "medio" },
  { n: "fibra", foods: ["Avena", "Lentejas", "Pan integral", "Pera con cáscara", "Garbanzos", "Chía"], wrong: ["Gaseosa", "Queso", "Carne", "Huevo", "Aceite", "Manteca"], fn: "mejora el tránsito intestinal y da saciedad", lvl: "principiante" },
  { n: "omega 3", foods: ["Sardina", "Atún", "Chía", "Nueces", "Lino (linaza)", "Salmón"], wrong: ["Gaseosa", "Pan blanco", "Caramelos", "Azúcar", "Lechuga", "Mandioca"], fn: "protege el corazón y el cerebro", lvl: "medio" },
  { n: "vitamina A", foods: ["Zanahoria", "Zapallo", "Batata naranja", "Mango", "Espinaca", "Hígado"], wrong: ["Arroz blanco", "Azúcar", "Fideos", "Gaseosa", "Manteca de maní", "Pan"], fn: "cuida la vista y la piel", lvl: "medio" },
  { n: "proteínas", foods: ["Huevo", "Pollo", "Pescado", "Lentejas", "Queso", "Soja"], wrong: ["Lechuga", "Sandía", "Gaseosa", "Caramelos", "Aceite", "Pepino"], fn: "construyen y reparan los tejidos", lvl: "principiante" },
  { n: "vitamina D", foods: ["Pescados grasos", "Yema de huevo", "Leche fortificada", "Hongos expuestos al sol"], wrong: ["Lechuga", "Gaseosa", "Arroz blanco", "Caramelos", "Pan blanco", "Azúcar"], fn: "ayuda a absorber el calcio", lvl: "avanzado" },
  { n: "ácido fólico", foods: ["Espinaca", "Lentejas", "Espárragos", "Brócoli", "Palta", "Hígado"], wrong: ["Gaseosa", "Caramelos", "Manteca", "Azúcar", "Pan blanco", "Fideos"], fn: "previene defectos del tubo neural", lvl: "avanzado" },
  { n: "magnesio", foods: ["Semillas de zapallo", "Almendras", "Espinaca", "Poroto negro", "Chocolate amargo", "Avena"], wrong: ["Gaseosa", "Caramelos", "Pan blanco", "Azúcar", "Manteca", "Pepino"], fn: "participa en la función muscular y nerviosa", lvl: "avanzado" },
  { n: "zinc", foods: ["Carne vacuna", "Semillas de zapallo", "Garbanzos", "Mariscos", "Maní"], wrong: ["Gaseosa", "Lechuga", "Sandía", "Azúcar", "Caramelos", "Pan blanco"], fn: "fortalece el sistema inmune y la cicatrización", lvl: "avanzado" },
  { n: "antioxidantes", foods: ["Arándanos", "Frutilla", "Té verde", "Tomate", "Uva morada", "Brócoli"], wrong: ["Gaseosa", "Pan blanco", "Azúcar", "Fideos", "Manteca", "Caramelos"], fn: "protegen las células del envejecimiento", lvl: "medio" },
];
for (const nu of nutrientes) {
  for (const f of nu.foods) {
    const w = pick(nu.wrong, 2);
    out.push([nu.lvl, "Alimentación", [`¿Cuál de estos alimentos es una buena fuente de ${nu.n}?`, `¿Qué alimento aporta ${nu.n} en buena cantidad?`, `¿Cuál de estos alimentos contiene ${nu.n} de forma destacada?`][f.length % 3], f, w[0], w[1], `${f} aporta ${nu.n}, que ${nu.fn}.`]);
  }
  const otros = nutrientes.filter((x) => x.n !== nu.n).map((x) => x.n);
  for (const f of nu.foods.slice(0, 3)) {
    const w = pick(otros, 2);
    out.push([nu.lvl === "principiante" ? "medio" : nu.lvl, "Alimentación", `¿Por qué nutriente se destaca especialmente ${f.toLowerCase()}?`, nu.n.charAt(0).toUpperCase() + nu.n.slice(1), w[0].charAt(0).toUpperCase() + w[0].slice(1), w[1].charAt(0).toUpperCase() + w[1].slice(1), `${f} se destaca por su ${nu.n}, que ${nu.fn}.`]);
  }
}

/* ---------- 2. Grupos de alimentos ---------- */
const grupos: Record<string, string[]> = {
  Frutas: ["Mango", "Piña (ananá)", "Mamón (papaya)", "Mandarina", "Sandía", "Melón", "Uva", "Pera", "Durazno", "Ciruela"],
  Verduras: ["Acelga", "Zapallo", "Berenjena", "Remolacha", "Repollo", "Pepino", "Locote (morrón)", "Zapallito", "Coliflor", "Rúcula"],
  Legumbres: ["Poroto", "Lenteja", "Garbanzo", "Arveja seca", "Soja", "Haba"],
  "Cereales y tubérculos": ["Arroz integral", "Maíz (choclo)", "Avena", "Mandioca", "Batata", "Quinoa", "Trigo"],
  Lácteos: ["Queso fresco", "Yogur", "Leche", "Ricota"],
  "Grasas saludables": ["Aceite de oliva", "Palta", "Nueces", "Almendras", "Semillas de girasol"],
};
const nombresGrupos = Object.keys(grupos);
for (const g of nombresGrupos) {
  for (const f of grupos[g]) {
    const w = pick(nombresGrupos, 2, (x) => x === g);
    out.push(["principiante", "Alimentación", `¿A qué grupo de alimentos pertenece: ${f}?`, g, w[0], w[1], `${f} forma parte del grupo ${g.toLowerCase()}.`]);
  }
}

/* ---------- 3. Mitos y verdades ---------- */
const verdades = [
  "Beber agua regularmente ayuda a mantener la concentración",
  "Las legumbres son una excelente fuente de proteína vegetal",
  "Caminar 30 minutos al día reduce el riesgo cardiovascular",
  "Dormir bien ayuda a mantener un peso saludable",
  "La lactancia materna protege al bebé de infecciones",
  "El consumo de sal en exceso eleva la presión arterial",
  "El humo de segunda mano también causa cáncer",
  "Las frutas enteras son mejores que los jugos",
  "El estrés crónico debilita el sistema inmunológico",
  "La actividad física mejora el estado de ánimo",
  "Lavarse las manos previene la diarrea y la gripe",
  "Las vacunas son seguras y salvan vidas",
  "Las grasas trans aumentan el colesterol malo",
  "El desayuno ayuda a rendir mejor en la escuela",
  "La hipertensión generalmente no presenta síntomas",
  "El tereré con agua y yuyos es una forma saludable de hidratarse",
  "Los alimentos integrales aportan más fibra que los refinados",
  "Hablar de los problemas emocionales ayuda a resolverlos",
  "El alcohol afecta la calidad del sueño",
  "La diabetes tipo 2 se puede prevenir con hábitos saludables",
  "Los adultos mayores también deben hacer ejercicio de fuerza",
  "El agua estancada es criadero del mosquito del dengue",
  "La depresión es una enfermedad tratable",
  "El PAP detecta tempranamente el cáncer de cuello uterino",
  "Comer despacio ayuda a sentir saciedad",
  "Los niños necesitan al menos 60 minutos diarios de juego activo",
  "El cinturón de seguridad reduce la mortalidad en accidentes",
  "Los sellos de advertencia ayudan a elegir alimentos más saludables",
  "La vitamina C de los cítricos mejora la absorción del hierro vegetal",
  "El sedentarismo es un factor de riesgo de enfermedades crónicas",
];
const mitos = [
  "Las bebidas energéticas son una buena forma de hidratarse",
  "Saltarse el desayuno ayuda a adelgazar de forma saludable",
  "Los cigarrillos electrónicos son completamente inofensivos",
  "El azúcar moreno es mucho más saludable que el azúcar blanco",
  "Hacer ejercicio solo sirve si se suda mucho",
  "Las personas con depresión solo necesitan 'poner voluntad'",
  "Una copa de alcohol diaria es necesaria para el corazón",
  "Los niños no necesitan dormir más que los adultos",
  "Los jugos envasados equivalen a comer fruta",
  "La hipertensión siempre produce dolor de cabeza",
  "Los antibióticos curan la gripe",
  "Si no tengo síntomas, no necesito controles médicos",
  "Beber agua durante las comidas engorda",
  "El pan integral no tiene calorías",
  "Fumar poco no hace daño",
  "El estrés no afecta la salud física",
  "Las vacunas causan la enfermedad que previenen",
  "El dengue se contagia de persona a persona por contacto",
  "Las personas mayores no deben hacer actividad física",
  "La sal marina no sube la presión arterial",
  "Dormir 4 horas es suficiente para un adulto",
  "Las frutas engordan por su azúcar y deben evitarse",
  "Pedir ayuda psicológica es señal de debilidad",
  "Los 'productos light' se pueden comer sin límite",
  "La salud mental no tiene relación con la alimentación",
  "Los productos 'naturales' nunca hacen daño",
  "El alcohol ayuda a dormir mejor",
  "Si hago ejercicio puedo comer cualquier cosa",
  "Los suplementos reemplazan a una alimentación variada",
  "Las enfermedades del corazón solo afectan a los hombres",
];
verdades.forEach((v, i) => {
  const m = pick(mitos, 2);
  out.push([i % 3 === 0 ? "principiante" : "medio", "Mitos y verdades", ["¿Cuál de estas afirmaciones es VERDADERA?", "¿Qué afirmación sobre salud es correcta?", "¿Cuál de estos enunciados es cierto?", "¿Qué frase es verdadera según la evidencia de salud pública?"][i % 4], v, m[0], m[1], `Correcto: ${v}.`]);
});
mitos.forEach((m, i) => {
  const v = pick(verdades, 2);
  out.push([i % 3 === 0 ? "principiante" : "medio", "Mitos y verdades", ["¿Cuál de estas afirmaciones es un MITO (falsa)?", "¿Cuál de estos enunciados es falso?", "¿Cuál afirmación NO es cierta?", "¿Cuál de estas creencias es un mito de salud?"][i % 4], m, v[0], v[1], `Es falso que "${m.toLowerCase()}".`]);
});

/* ---------- 4. Alternativas saludables ---------- */
const swaps: [string, string][] = [
  ["gaseosa", "Agua con rodajas de limón o tereré con agua"],
  ["papas fritas de paquete", "Mandioca hervida o frutos secos sin sal"],
  ["galletitas rellenas", "Fruta fresca de estación"],
  ["pan blanco", "Pan integral"],
  ["jugo en polvo", "Jugo natural de fruta sin azúcar o agua"],
  ["embutidos", "Pollo o pescado a la plancha"],
  ["milanesa frita", "Milanesa al horno"],
  ["helado de crema todos los días", "Fruta congelada licuada"],
  ["arroz blanco", "Arroz integral"],
  ["azúcar en el mate cocido", "Mate cocido sin azúcar o con canela"],
  ["caramelos", "Frutas secas como pasas o ciruelas"],
  ["sopa instantánea", "Sopa casera de verduras"],
  ["cereales azucarados", "Avena con fruta"],
  ["mayonesa", "Yogur natural con hierbas o palta"],
  ["bebida energética", "Agua y una fruta"],
  ["fiambres en el sándwich", "Huevo, queso fresco y tomate"],
  ["chipa frita", "Chipa al horno o chipa de almidón con queso en porción moderada"],
  ["hamburguesa industrial", "Hamburguesa casera de lentejas o carne magra"],
  ["sal extra en la mesa", "Hierbas, limón y especias para condimentar"],
  ["aderezos envasados", "Aceite de oliva y vinagre"],
  ["golosinas en el recreo", "Banana o mandarina"],
  ["postres industriales", "Ensalada de frutas"],
  ["café con 3 cucharadas de azúcar", "Café sin azúcar o con menos cantidad"],
  ["fideos refinados", "Fideos integrales con verduras"],
];
swaps.forEach(([mal, bien], i) => {
  const w = pick(swaps.filter((s) => s[0] !== mal).map((s) => s[0]), 2).map((s) => s.charAt(0).toUpperCase() + s.slice(1));
  out.push([i % 2 === 0 ? "principiante" : "medio", "Alimentación", `¿Cuál es la alternativa más saludable en lugar de ${mal}?`, bien, w[0], w[1], `${bien} es la opción con menos azúcar, sal o grasas no saludables.`]);
});

/* ---------- 5. Días mundiales ---------- */
const dias: [string, string][] = [
  ["7 de abril", "Día Mundial de la Salud"],
  ["31 de mayo", "Día Mundial Sin Tabaco"],
  ["10 de octubre", "Día Mundial de la Salud Mental"],
  ["14 de noviembre", "Día Mundial de la Diabetes"],
  ["29 de septiembre", "Día Mundial del Corazón"],
  ["16 de octubre", "Día Mundial de la Alimentación"],
  ["1 de diciembre", "Día Mundial de la Lucha contra el VIH/SIDA"],
  ["4 de febrero", "Día Mundial contra el Cáncer"],
  ["17 de mayo", "Día Mundial de la Hipertensión"],
  ["15 de octubre", "Día Mundial del Lavado de Manos"],
  ["22 de marzo", "Día Mundial del Agua"],
  ["10 de septiembre", "Día Mundial para la Prevención del Suicidio"],
  ["1 al 7 de agosto", "Semana Mundial de la Lactancia Materna"],
  ["6 de abril", "Día Internacional del Deporte para el Desarrollo y la Paz"],
  ["20 de marzo", "Día Mundial de la Salud Bucodental"],
  ["24 de marzo", "Día Mundial de la Tuberculosis"],
  ["28 de julio", "Día Mundial contra la Hepatitis"],
  ["19 de octubre", "Día Mundial de la Lucha contra el Cáncer de Mama"],
  ["4 de marzo", "Día Mundial de la Obesidad"],
  ["21 de septiembre", "Día Mundial del Alzheimer"],
  ["12 de diciembre", "Día de la Cobertura Sanitaria Universal"],
  ["1 de octubre", "Día Internacional de las Personas Mayores"],
  ["5 de junio", "Día Mundial del Medio Ambiente"],
  ["26 de junio", "Día Internacional de la Lucha contra el Uso Indebido de Drogas"],
];
dias.forEach(([fecha, evento], i) => {
  const w = pick(dias.filter((d) => d[1] !== evento), 2);
  out.push([i % 2 === 0 ? "medio" : "avanzado", "Promoción de la salud", `¿Qué se conmemora el ${fecha}?`, evento, w[0][1], w[1][1], `El ${fecha} se celebra el ${evento}.`]);
  const w2 = pick(dias.filter((d) => d[0] !== fecha), 2);
  out.push(["avanzado", "Promoción de la salud", `¿En qué fecha se celebra el ${evento}?`, fecha, w2[0][0], w2[1][0], `El ${evento} se celebra el ${fecha}.`]);
});

/* ---------- 6. Conceptos y definiciones ---------- */
const conceptos: [string, string, string][] = [
  ["Promoción de la salud", "Proceso que permite a las personas aumentar el control sobre su salud para mejorarla", "medio"],
  ["Prevención de la enfermedad", "Medidas destinadas a evitar la aparición o el avance de una enfermedad", "medio"],
  ["Determinantes sociales de la salud", "Circunstancias en que las personas nacen, crecen, viven, trabajan y envejecen", "medio"],
  ["Entorno saludable", "Espacio físico y social que protege y favorece la salud de quienes lo habitan", "principiante"],
  ["Municipio Saludable", "Gobierno local que, junto a la comunidad, mejora continuamente las condiciones de vida y salud", "principiante"],
  ["Participación comunitaria", "Proceso en el que la comunidad interviene activamente en las decisiones sobre su salud", "medio"],
  ["Intersectorialidad", "Articulación de distintos sectores para actuar sobre los determinantes de la salud", "avanzado"],
  ["Empoderamiento", "Proceso por el cual personas y comunidades ganan control sobre las decisiones que afectan su vida", "medio"],
  ["Alfabetización en salud", "Capacidad de acceder, comprender y utilizar información para cuidar la salud", "medio"],
  ["Abogacía en salud", "Acciones para obtener compromiso político y apoyo social en favor de la salud", "avanzado"],
  ["Equidad en salud", "Ausencia de diferencias injustas y evitables en la salud entre grupos de población", "avanzado"],
  ["Estilo de vida saludable", "Conjunto de hábitos cotidianos que favorecen el bienestar físico, mental y social", "principiante"],
  ["Sedentarismo", "Falta de actividad física regular con predominio de tiempo sentado o acostado", "principiante"],
  ["Autocuidado", "Acciones que las personas realizan por sí mismas para mantener su salud", "principiante"],
  ["Enfermedades no transmisibles", "Enfermedades crónicas no infecciosas como diabetes, cáncer y cardiopatías", "medio"],
  ["Factor de riesgo", "Característica o exposición que aumenta la probabilidad de enfermar", "medio"],
  ["Factor protector", "Condición que reduce la probabilidad de enfermar o favorece el bienestar", "medio"],
  ["Atención Primaria de la Salud", "Estrategia de cuidado integral, accesible y cercano a la comunidad", "medio"],
  ["Salud en Todas las Políticas", "Enfoque que considera el impacto en salud de las decisiones de todos los sectores", "avanzado"],
  ["Política pública saludable", "Decisión de gobierno que prioriza la salud y la equidad en cualquier sector", "avanzado"],
  ["Escuela saludable", "Institución educativa que promueve hábitos sanos en su comunidad educativa", "principiante"],
  ["Cantina escolar saludable", "Expendio dentro de la escuela que ofrece alimentos nutritivos y limita ultraprocesados", "principiante"],
  ["Pausa activa", "Breve interrupción de la jornada laboral para realizar ejercicios y estiramientos", "principiante"],
  ["Higiene del sueño", "Conjunto de hábitos y condiciones que favorecen un descanso de calidad", "principiante"],
  ["Resiliencia", "Capacidad de adaptarse positivamente y recuperarse ante la adversidad", "medio"],
  ["Burnout", "Síndrome de agotamiento por estrés laboral crónico no manejado", "medio"],
  ["Mindfulness", "Práctica de atención plena al momento presente sin juzgar", "medio"],
  ["Alimento ultraprocesado", "Formulación industrial con aditivos, azúcares, grasas y sal añadidos", "principiante"],
  ["Etiquetado frontal", "Sellos de advertencia que informan excesos de azúcar, sodio, grasas o calorías", "medio"],
  ["Índice de masa corporal", "Relación entre peso y estatura al cuadrado para clasificar el estado nutricional", "medio"],
  ["Inocuidad alimentaria", "Condiciones que garantizan que un alimento no cause daño al consumirlo", "medio"],
  ["Vigilancia epidemiológica", "Recolección y análisis sistemático de datos de salud para la acción", "avanzado"],
  ["Inmunización", "Proceso por el cual una persona se hace inmune a una enfermedad mediante vacunas", "principiante"],
  ["Curso de vida", "Enfoque que considera las necesidades de salud en cada etapa, desde la gestación hasta la vejez", "avanzado"],
  ["Diagnóstico participativo", "Identificación de problemas y recursos de salud realizada con la propia comunidad", "medio"],
  ["Plan Municipal de Salud", "Documento que organiza objetivos, acciones, responsables y plazos del municipio en salud", "medio"],
  ["Ordenanza municipal", "Norma jurídica dictada por la Junta Municipal de cumplimiento local", "medio"],
  ["Consejo Local de Salud", "Instancia de participación ciudadana en la gestión de salud a nivel distrital", "medio"],
  ["Mesa intersectorial", "Espacio de coordinación entre instituciones y comunidad para la acción conjunta", "medio"],
  ["Indicador de salud", "Medida que permite describir y monitorear una situación de salud", "avanzado"],
  ["Línea de base", "Medición inicial de los indicadores antes de implementar un plan", "avanzado"],
  ["Sostenibilidad", "Capacidad de mantener los resultados de una intervención en el tiempo", "avanzado"],
  ["Salutogénesis", "Enfoque que estudia los factores que generan y mantienen la salud", "avanzado"],
  ["Prevención primaria", "Acciones para evitar la aparición de una enfermedad, como la vacunación", "medio"],
  ["Prevención secundaria", "Detección temprana de una enfermedad antes de que produzca síntomas graves", "medio"],
  ["Prevención terciaria", "Rehabilitación y reducción de secuelas de una enfermedad ya establecida", "avanzado"],
  ["Cobertura universal de salud", "Que todas las personas accedan a servicios de salud de calidad sin dificultades financieras", "avanzado"],
  ["Bienestar", "Estado de satisfacción física, emocional y social que permite desarrollarse plenamente", "principiante"],
  ["Estigma", "Marca social negativa que genera discriminación hacia una persona o grupo", "medio"],
  ["Hábito", "Conducta que se repite regularmente hasta volverse automática", "principiante"],
];
conceptos.forEach(([term, def, lvl]) => {
  const w = pick(conceptos.filter((c) => c[0] !== term), 2);
  out.push([lvl, "Promoción de la salud", `¿Qué significa "${term}"?`, def, w[0][1], w[1][1], `${term}: ${def.toLowerCase()}.`]);
  const w2 = pick(conceptos.filter((c) => c[0] !== term), 2);
  out.push([lvl, "Promoción de la salud", `¿Qué término corresponde a esta definición: "${def}"?`, term, w2[0][0], w2[1][0], `La definición corresponde a ${term.toLowerCase()}.`]);
});

/* ---------- 7. Beneficios de frutas y verduras ---------- */
const beneficios: [string, string][] = [
  ["Tomate", "Aporta licopeno, un antioxidante que protege el corazón y la próstata"],
  ["Zanahoria", "Rica en betacaroteno, cuida la vista y la piel"],
  ["Espinaca", "Aporta hierro, ácido fólico y vitamina K"],
  ["Brócoli", "Contiene vitamina C, calcio y compuestos protectores contra el cáncer"],
  ["Banana", "Fuente de potasio y energía rápida para la actividad física"],
  ["Naranja", "Rica en vitamina C y fibra"],
  ["Palta", "Aporta grasas saludables que cuidan el corazón"],
  ["Ajo", "Ayuda a reducir la presión arterial y tiene efecto antimicrobiano"],
  ["Cebolla", "Contiene quercetina, un antioxidante antiinflamatorio"],
  ["Remolacha", "Aporta nitratos que mejoran la circulación y el rendimiento"],
  ["Mamón (papaya)", "Contiene papaína que facilita la digestión y vitamina C"],
  ["Piña (ananá)", "Aporta bromelina, enzima antiinflamatoria y digestiva"],
  ["Sandía", "Muy hidratante, con licopeno y pocas calorías"],
  ["Mango", "Rico en vitamina A y C"],
  ["Arándanos", "Antioxidantes que protegen la memoria y las vías urinarias"],
  ["Lentejas", "Proteína vegetal, hierro y fibra que ayudan a controlar la glucosa"],
  ["Avena", "Betaglucanos que reducen el colesterol"],
  ["Zapallo", "Betacaroteno y fibra con muy pocas calorías"],
  ["Repollo", "Vitamina C y compuestos azufrados protectores"],
  ["Pepino", "Alto contenido de agua, ideal para hidratarse"],
  ["Manzana", "Fibra soluble (pectina) que ayuda a regular el colesterol"],
  ["Frutilla", "Vitamina C y antioxidantes con pocas calorías"],
  ["Acelga", "Magnesio, hierro y vitamina K"],
  ["Nueces", "Omega 3 vegetal que protege el cerebro"],
  ["Chía", "Omega 3, fibra y calcio"],
  ["Maní", "Proteína y grasas saludables (sin sal añadida)"],
  ["Batata", "Carbohidrato complejo con fibra y vitamina A"],
  ["Mandioca", "Energía de liberación sostenida, sin gluten"],
  ["Limón", "Vitamina C y ayuda a absorber el hierro de los vegetales"],
  ["Morrón rojo", "Más vitamina C que la naranja"],
];
beneficios.forEach(([f, b], i) => {
  const w = pick(beneficios.filter((x) => x[0] !== f), 2);
  out.push([i % 2 === 0 ? "medio" : "avanzado", "Alimentación", `¿Cuál es un beneficio destacado de consumir ${f.toLowerCase()}?`, b, w[0][1], w[1][1], `${f}: ${b.toLowerCase()}.`]);
});

/* ---------- 8. Enfermedad → medida preventiva ---------- */
const prevencion: [string, string, string][] = [
  ["Dengue", "Eliminar recipientes con agua estancada", "principiante"],
  ["Diabetes tipo 2", "Mantener un peso saludable, comer bien y moverse", "principiante"],
  ["Hipertensión arterial", "Reducir el consumo de sal y hacer actividad física", "principiante"],
  ["Caries dental", "Cepillado con pasta con flúor y menos azúcar", "principiante"],
  ["Cáncer de piel", "Usar protector solar y evitar el sol del mediodía", "principiante"],
  ["Cáncer de pulmón", "No fumar y evitar el humo de tabaco", "principiante"],
  ["Cáncer de cuello uterino", "Vacuna contra el VPH y Papanicolaou periódico", "medio"],
  ["Anemia ferropénica", "Consumir alimentos ricos en hierro junto con vitamina C", "medio"],
  ["Osteoporosis", "Consumir calcio, vitamina D y hacer ejercicio con carga", "medio"],
  ["Obesidad infantil", "Limitar ultraprocesados y pantallas, promover juego activo", "principiante"],
  ["Enfermedad de Chagas", "Mejorar la vivienda y controlar la vinchuca", "avanzado"],
  ["Hepatitis A", "Lavado de manos, agua segura y vacunación", "medio"],
  ["Gripe (influenza)", "Vacunación anual y lavado de manos", "principiante"],
  ["Intoxicación alimentaria", "Cocinar bien, refrigerar y separar crudos de cocidos", "medio"],
  ["Rabia", "Vacunar a perros y gatos", "principiante"],
  ["Accidente cerebrovascular", "Controlar la presión arterial y no fumar", "medio"],
  ["Infarto de miocardio", "Alimentación saludable, ejercicio y control del colesterol", "medio"],
  ["Depresión", "Vínculos sociales, actividad física, sueño adecuado y pedir ayuda a tiempo", "medio"],
  ["Golpe de calor", "Hidratarse y evitar la exposición al sol en horas pico", "principiante"],
  ["Tétanos", "Vacunación con refuerzo cada 10 años", "medio"],
  ["Tuberculosis", "Vacuna BCG, ventilación y diagnóstico temprano de la tos persistente", "avanzado"],
  ["Enfermedad renal crónica", "Controlar la diabetes y la presión, beber agua y evitar automedicarse", "avanzado"],
  ["Pérdida auditiva", "Evitar ruidos fuertes y usar auriculares con volumen moderado", "medio"],
  ["Lesiones de tránsito", "Cinturón, casco, respetar velocidad y no conducir alcoholizado", "principiante"],
  ["Parasitosis intestinal", "Lavar las manos, consumir agua segura y lavar verduras", "principiante"],
  ["Sarampión", "Vacunación con dos dosis de SPR", "medio"],
  ["Leishmaniasis", "Control de flebótomos y limpieza del entorno", "avanzado"],
  ["Cáncer de colon", "Dieta rica en fibra, ejercicio y colonoscopía después de los 50", "avanzado"],
  ["Enfermedad periodontal", "Higiene bucal diaria y controles odontológicos", "medio"],
  ["Desnutrición infantil", "Lactancia materna, alimentación complementaria adecuada y controles de crecimiento", "medio"],
];
prevencion.forEach(([enf, med, lvl]) => {
  const w = pick(prevencion.filter((p) => p[0] !== enf), 2);
  out.push([lvl, "Prevención de enfermedades", `¿Cuál es una medida clave para prevenir: ${enf}?`, med, w[0][1], w[1][1], `Para prevenir ${enf.toLowerCase()}: ${med.toLowerCase()}.`]);
  const w2 = pick(prevencion.filter((p) => p[0] !== enf), 2);
  out.push([lvl === "principiante" ? "medio" : lvl, "Prevención de enfermedades", `"${med}" es una medida de prevención principalmente de…`, enf, w2[0][0], w2[1][0], `Esa medida previene ${enf.toLowerCase()}.`]);
});

/* ---------- 9. Datos numéricos ---------- */
const numeros: [string, string, string, string, string, string][] = [
  ["¿Cuántas cucharaditas de azúcar como máximo recomienda la OMS por día para un adulto?", "Unas 6 cucharaditas (25 g) idealmente", "20 cucharaditas", "40 cucharaditas", "medio", "Menos del 5% de las calorías diarias."],
  ["¿Cuántos gramos de frutas y verduras diarias recomienda la OMS?", "400 g", "50 g", "2000 g", "medio", "Equivale a 5 porciones."],
  ["¿Cuántas horas semanales de actividad moderada equivalen a 150 minutos?", "2 horas y media", "10 horas", "30 minutos", "principiante", "Pueden repartirse en sesiones cortas."],
  ["¿Cuántos vasos de agua equivalen aproximadamente a 2 litros?", "8 vasos", "2 vasos", "20 vasos", "principiante", "Un vaso ≈ 250 ml."],
  ["¿A partir de qué cifra de presión arterial se habla de hipertensión?", "140/90 mmHg o más", "100/60 mmHg", "110/70 mmHg", "medio", "Se confirma con varias mediciones."],
  ["¿Cuál es el rango de IMC considerado normal en adultos?", "18,5 a 24,9", "30 a 35", "10 a 15", "medio", "Por debajo de 18,5 es bajo peso."],
  ["¿Qué perímetro de cintura indica riesgo aumentado en hombres?", "Más de 102 cm", "Más de 60 cm", "Más de 70 cm", "avanzado", "En mujeres, más de 88 cm."],
  ["¿Cuánto tiempo seguido como máximo se recomienda estar sentado sin levantarse?", "30 a 60 minutos", "6 horas", "10 horas", "medio", "Las pausas activas rompen el sedentarismo."],
  ["¿Cuántas muertes anuales causa el tabaco en el mundo según la OMS?", "Más de 8 millones", "10 mil", "100 mil", "avanzado", "1,3 millones son fumadores pasivos."],
  ["¿Qué porcentaje de las muertes mundiales se deben a enfermedades no transmisibles?", "Alrededor del 74%", "10%", "30%", "avanzado", "Cardiovasculares, cáncer, respiratorias y diabetes."],
  ["¿Cuántos años debe tener un niño para empezar a comer alimentos sólidos junto con la leche materna?", "6 meses", "1 mes", "3 años", "principiante", "Alimentación complementaria oportuna."],
  ["¿Cuántas dosis de vacuna contra el VPH se recomiendan actualmente en adolescentes?", "1 o 2 dosis según esquema nacional", "10 dosis", "Ninguna", "avanzado", "La OMS avala esquemas de dosis única."],
  ["¿Cuál es la temperatura mínima interna para cocinar carne de forma segura?", "70°C", "30°C", "45°C", "medio", "Elimina la mayoría de las bacterias."],
  ["¿Cuántos segundos como mínimo debe durar el lavado de manos?", "20 segundos", "3 segundos", "2 minutos", "principiante", "Frotando palmas, dorso, dedos y muñecas."],
  ["¿Cuántas horas de pantalla recreativa máximas se sugieren para escolares?", "2 horas al día", "8 horas", "Sin límite", "medio", "Priorizar el juego activo y el sueño."],
  ["¿Cuántos minutos de actividad vigorosa semanal recomienda la OMS para adultos?", "75 a 150 minutos", "5 minutos", "1000 minutos", "medio", "O 150-300 de moderada."],
  ["¿Qué nivel de triglicéridos se considera normal en ayunas?", "Menos de 150 mg/dl", "Más de 500 mg/dl", "300 mg/dl", "avanzado", "Los triglicéridos altos aumentan el riesgo cardiovascular."],
  ["¿Cuál es el nivel de colesterol total deseable?", "Menos de 200 mg/dl", "Más de 300 mg/dl", "400 mg/dl", "medio", "Debe analizarse junto con HDL y LDL."],
  ["¿Cuántos pasos equivalen aproximadamente a 30 minutos de caminata rápida?", "Unos 3.000 a 4.000 pasos", "100 pasos", "30.000 pasos", "medio", "Cada paso cuenta."],
  ["¿Cada cuántos años se recomienda el refuerzo de la vacuna antitetánica en adultos?", "Cada 10 años", "Cada año", "Nunca", "medio", "Es esencial ante heridas sucias."],
  ["¿Cuántos tipos principales de diabetes existen?", "Tipo 1, tipo 2 y gestacional", "Solo uno", "Veinte", "medio", "La tipo 2 es la más frecuente y prevenible."],
  ["¿Qué porcentaje de las enfermedades cardíacas prematuras podría evitarse con hábitos saludables?", "Hasta el 80%", "5%", "20%", "avanzado", "Según la OMS y la Federación Mundial del Corazón."],
  ["¿Cuántas porciones de pescado por semana se recomiendan?", "Al menos 2 porciones", "Ninguna", "14 porciones", "medio", "Preferir pescados grasos ricos en omega 3."],
  ["¿Qué proporción del plato deberían ocupar las verduras en el almuerzo?", "La mitad", "Un décimo", "Nada", "principiante", "Método del plato saludable."],
  ["¿Cuántos gramos de carne procesada por día aumentan un 18% el riesgo de cáncer colorrectal según la IARC?", "50 g", "5 g", "1 kg", "avanzado", "Equivale a 2 fetas de jamón o una salchicha."],
];
numeros.forEach(([q, ok, w1, w2, lvl, exp]) => out.push([lvl, "Hábitos saludables", q, ok, w1, w2, exp]));

/* ---------- 10. Situaciones cotidianas (decisiones saludables) ---------- */
const situaciones: [string, string, string, string, string][] = [
  ["Llegás a casa muy estresado del trabajo. ¿Qué es lo más saludable?", "Salir a caminar 20 minutos y luego hablar con alguien de confianza", "Tomar varias cervezas para relajarte", "Comer un paquete grande de snacks frente a la TV", "principiante"],
  ["Tu hijo no quiere comer verduras. ¿Qué hacer?", "Ofrecerlas de distintas formas, con paciencia y dando el ejemplo", "Obligarlo con castigos", "Reemplazarlas por golosinas", "principiante"],
  ["Es mediodía, hace 38°C y tenés que hacer un mandado. ¿Qué hacés?", "Llevás agua, sombrero y buscás la sombra, o lo posponés", "Vas corriendo al sol sin agua", "Tomás una gaseosa bien fría y listo", "principiante"],
  ["Tenés un vecino con fiebre alta y dolor de cuerpo en época de dengue. ¿Qué le recomendás?", "Consultar al servicio de salud y no automedicarse con aspirina", "Tomar aspirina y esperar", "Nada, es solo un resfrío", "medio"],
  ["Son las 23 h y mañana tenés examen. ¿Qué es mejor?", "Repasar brevemente, apagar pantallas y dormir 7-8 horas", "Estudiar toda la noche con café", "Jugar con el celular hasta dormirte", "principiante"],
  ["En la oficina llevan 3 horas sentados. ¿Qué proponés?", "Una pausa activa de 5 minutos con estiramientos", "Pedir más café", "Seguir sin moverse hasta terminar", "principiante"],
  ["Un amigo te dice que ya no le encuentra sentido a nada desde hace semanas. ¿Qué hacés?", "Lo escuchás con empatía, le preguntás cómo está y lo acompañás a buscar ayuda profesional", "Le decís que se anime y cambiás de tema", "Lo evitás para no incomodarlo", "medio"],
  ["Vas a organizar la fiesta de la escuela. ¿Qué menú elegís?", "Frutas cortadas, sándwiches integrales, agua saborizada natural", "Gaseosas, papas fritas y golosinas", "Solo torta y caramelos", "principiante"],
  ["Compraste un yogur que dice 'light' pero tiene sello de exceso de azúcar. ¿Qué conviene?", "Elegir un yogur natural sin azúcar añadida", "Consumirlo sin límite porque es light", "Agregarle más azúcar", "medio"],
  ["Tu abuela de 75 años pregunta si puede hacer ejercicio. ¿Qué le decís?", "Sí: caminatas, fuerza suave y equilibrio, adaptados a su condición", "No, a su edad debe estar quieta", "Solo si corre maratones", "medio"],
  ["Querés dejar de fumar. ¿Cuál es el primer paso recomendado?", "Fijar una fecha y buscar apoyo en el servicio de salud", "Cambiar a cigarrillo electrónico", "Esperar a sentir síntomas", "medio"],
  ["Tu municipio quiere ser 'Municipio Saludable'. ¿Qué se debe hacer primero?", "Lograr el compromiso de la intendencia y conformar una mesa intersectorial", "Construir un estadio", "Hacer una campaña publicitaria y nada más", "medio"],
  ["Encontrás recipientes con agua en el patio. ¿Qué hacés?", "Los vaciás, cepillás y los guardás boca abajo", "Los dejás, el mosquito no vive ahí", "Les agregás más agua", "principiante"],
  ["Sentís sed intensa, orina oscura y dolor de cabeza en un día caluroso. ¿Qué indica?", "Posible deshidratación: hidratarse y descansar a la sombra", "Exceso de agua", "Necesidad de comer sal", "medio"],
  ["En la cantina escolar, ¿qué opción deberían priorizar?", "Frutas, agua y preparaciones caseras", "Gaseosas y snacks", "Bebidas energéticas", "principiante"],
  ["Tu colesterol LDL salió en 170 mg/dl. ¿Qué es lo más adecuado?", "Consultar al médico, mejorar la alimentación y moverse más", "Ignorarlo porque no duele", "Dejar de comer todo tipo de grasa, incluso la saludable", "medio"],
  ["Tu bebé de 4 meses está sano y toma pecho. ¿Qué le das?", "Solo leche materna hasta los 6 meses", "Jugos y papillas desde ya", "Gaseosa diluida", "principiante"],
  ["Te ofrecen 'la cura para la diabetes' en redes sociales. ¿Qué hacés?", "Desconfiás y consultás con un profesional de salud", "Compras de inmediato", "Dejás tu medicación", "medio"],
  ["Durante una ola de calor, ¿a quiénes debemos vigilar especialmente?", "Bebés, adultos mayores y personas con enfermedades crónicas", "Solo a los deportistas", "A nadie en particular", "principiante"],
  ["Vas a un asado familiar. ¿Cuál es la elección más equilibrada?", "Carne magra con abundante ensalada y agua", "Solo chorizos y gaseosa", "No comer nada en todo el día para compensar", "principiante"],
];
situaciones.forEach(([q, ok, w1, w2, lvl]) => out.push([lvl, "Hábitos saludables", q, ok, w1, w2, "La mejor decisión protege tu salud y la de tu comunidad."]));

export const generated: Raw[] = out;
