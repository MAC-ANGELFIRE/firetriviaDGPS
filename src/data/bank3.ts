import type { Raw } from "./bank1";

const out: Raw[] = [];

/* ---------- Áreas de acción de la Carta de Ottawa ---------- */
const ottawa: [string, string[]][] = [
  ["Construir políticas públicas saludables", ["Aprobar una ordenanza de espacios libres de humo", "Crear impuestos a bebidas azucaradas", "Regular la publicidad de alimentos dirigida a niños", "Ley de etiquetado frontal de alimentos"]],
  ["Crear entornos favorables", ["Construir ciclovías y plazas seguras", "Instalar bebederos de agua en escuelas", "Oficinas con espacios para pausas activas", "Mercados con oferta de frutas y verduras accesibles"]],
  ["Fortalecer la acción comunitaria", ["Conformar una comisión vecinal de salud", "Organizar mingas de limpieza contra el dengue", "Presupuesto participativo en salud", "Red de promotores comunitarios"]],
  ["Desarrollar aptitudes personales", ["Talleres de cocina saludable", "Educación sobre manejo del estrés", "Charlas de alfabetización en salud", "Programas escolares de habilidades para la vida"]],
  ["Reorientar los servicios de salud", ["Consultorios que incluyen consejería en hábitos", "Unidades de Salud de la Familia con enfoque preventivo", "Capacitar al personal en promoción, no solo en curación", "Servicios de salud que trabajan con la comunidad"]],
];
const areas = ottawa.map((o) => o[0]);
ottawa.forEach(([area, ejemplos], ai) => {
  ejemplos.forEach((ej) => {
    const w = areas.filter((a) => a !== area).sort(() => ((ai + ej.length) % 2 ? 1 : -1)).slice(0, 2);
    out.push(["avanzado", "Promoción de la salud", `Según la Carta de Ottawa, "${ej}" es un ejemplo del área de acción…`, area, w[0], w[1], `Esa acción corresponde al área: ${area.toLowerCase()}.`]);
  });
});

/* ---------- ¿Cuál NO pertenece al grupo? ---------- */
const grupos: Record<string, string[]> = {
  frutas: ["Mango", "Piña", "Mamón", "Mandarina", "Sandía", "Uva"],
  verduras: ["Acelga", "Zapallo", "Berenjena", "Remolacha", "Repollo", "Pepino"],
  legumbres: ["Poroto", "Lenteja", "Garbanzo", "Arveja", "Soja", "Haba"],
  cereales: ["Arroz", "Maíz", "Avena", "Trigo", "Quinoa", "Cebada"],
  lácteos: ["Queso", "Yogur", "Leche", "Ricota", "Kéfir", "Cuajada"],
  "alimentos ultraprocesados": ["Gaseosa", "Snacks de paquete", "Galletitas rellenas", "Salchichas", "Jugo en polvo", "Golosinas"],
};
const gnames = Object.keys(grupos);
gnames.forEach((g, gi) => {
  const others = gnames.filter((x) => x !== g);
  for (let k = 0; k < 5; k++) {
    const og = others[(gi + k) % others.length];
    const intruso = grupos[og][k % grupos[og].length];
    const a = grupos[g][k % 6];
    const b = grupos[g][(k + 2) % 6];
    out.push(["principiante", "Alimentación", [`¿Cuál de estos alimentos NO es parte del grupo de ${g}?`, `¿Qué alimento no pertenece al grupo de ${g}?`, `Elegí el alimento que NO corresponde al grupo de ${g}:`][(gi + k) % 3], intruso, a, b, `${intruso} pertenece a ${og}, no a ${g}.`]);
  }
});

/* ---------- Verdadero / Falso ---------- */
const vf: [string, boolean, string][] = [
  ["Las frutas y verduras deben ocupar la mitad del plato en el almuerzo y la cena.", true, "principiante"],
  ["El tereré preparado con agua es una forma saludable de hidratarse.", true, "principiante"],
  ["Una persona adulta debería dormir entre 7 y 9 horas.", true, "principiante"],
  ["La actividad física solo cuenta si se hace en un gimnasio.", false, "principiante"],
  ["Fumar en el auto con las ventanas abiertas no afecta a los niños.", false, "principiante"],
  ["El estrés prolongado puede elevar la presión arterial.", true, "medio"],
  ["Los alimentos con sellos de advertencia deben consumirse con moderación.", true, "principiante"],
  ["Los jugos de fruta envasados son equivalentes a comer la fruta entera.", false, "medio"],
  ["La depresión se cura solo con fuerza de voluntad.", false, "principiante"],
  ["Un municipio saludable requiere la participación de la comunidad.", true, "principiante"],
  ["La Carta de Ottawa fue firmada en 1986.", true, "medio"],
  ["La hipertensión arterial siempre provoca síntomas evidentes.", false, "medio"],
  ["El lavado de manos debe durar al menos 20 segundos.", true, "principiante"],
  ["Las bebidas energéticas son recomendables para niños deportistas.", false, "principiante"],
  ["El mosquito del dengue se cría en agua limpia estancada.", true, "principiante"],
  ["La lactancia materna exclusiva se recomienda hasta los 6 meses.", true, "principiante"],
  ["Saltarse comidas es una estrategia saludable para bajar de peso.", false, "medio"],
  ["Los adultos mayores no deberían hacer ejercicios de fuerza.", false, "medio"],
  ["Comer despacio ayuda a reconocer la saciedad.", true, "principiante"],
  ["El alcohol mejora la calidad del sueño.", false, "medio"],
  ["Los cigarrillos electrónicos son una alternativa inofensiva al tabaco.", false, "medio"],
  ["La promoción de la salud es responsabilidad exclusiva del sector salud.", false, "medio"],
  ["Los determinantes sociales influyen más en la salud que el sistema sanitario.", true, "avanzado"],
  ["La diabetes tipo 2 puede prevenirse en gran medida con estilos de vida saludables.", true, "medio"],
  ["Las legumbres son una fuente importante de proteínas vegetales.", true, "principiante"],
  ["La sal marina o rosada no sube la presión arterial.", false, "medio"],
  ["Beber agua antes de las comidas puede ayudar a controlar el apetito.", true, "medio"],
  ["Hablar sobre el suicidio con una persona en riesgo aumenta el peligro.", false, "medio"],
  ["La vacuna del VPH previene el cáncer de cuello uterino.", true, "medio"],
  ["Los niños menores de 2 años no deberían tener tiempo de pantalla.", true, "medio"],
  ["El sedentarismo es un factor de riesgo independiente de la obesidad.", true, "avanzado"],
  ["Una siesta de 20 minutos puede mejorar el rendimiento.", true, "medio"],
  ["Los alimentos light pueden consumirse sin límite.", false, "principiante"],
  ["El consumo de carnes procesadas se asocia con cáncer colorrectal.", true, "avanzado"],
  ["El dengue se transmite de persona a persona por el aire.", false, "principiante"],
  ["Caminar 30 minutos diarios reduce el riesgo de infarto.", true, "principiante"],
  ["La APS fue definida en la Declaración de Alma-Ata en 1978.", true, "avanzado"],
  ["La equidad en salud significa que todos reciben exactamente lo mismo.", false, "avanzado"],
  ["La fibra ayuda a prevenir el estreñimiento.", true, "principiante"],
  ["Un IMC de 27 se clasifica como sobrepeso.", true, "medio"],
  ["Los antibióticos sirven para curar resfríos virales.", false, "medio"],
  ["La prevención secundaria consiste en la detección temprana de enfermedades.", true, "avanzado"],
  ["El cinturón de seguridad es innecesario en viajes cortos.", false, "principiante"],
  ["El consumo de azúcares libres debería ser menor al 10% de las calorías.", true, "medio"],
  ["La salud mental es parte integral de la salud.", true, "principiante"],
  ["El ejercicio físico puede reducir síntomas de depresión leve a moderada.", true, "medio"],
  ["Dormir con el celular bajo la almohada mejora el descanso.", false, "principiante"],
  ["Los Consejos Locales de Salud son espacios de participación ciudadana.", true, "medio"],
  ["Una ordenanza municipal puede ser una política pública saludable.", true, "medio"],
  ["La mandioca es un alimento ultraprocesado.", false, "principiante"],
  ["El plan municipal de salud debe tener indicadores y responsables.", true, "medio"],
  ["La vitamina D se sintetiza con la exposición solar moderada.", true, "medio"],
  ["La anemia por falta de hierro es más frecuente en mujeres y niños.", true, "medio"],
  ["Las personas con diabetes no pueden comer ninguna fruta.", false, "medio"],
  ["Enjuagarse con agua reemplaza al cepillado dental.", false, "principiante"],
  ["Los espacios verdes urbanos mejoran la salud mental.", true, "medio"],
  ["La Declaración de Astaná (2018) renovó el compromiso con la APS.", true, "avanzado"],
  ["El burnout es reconocido por la OMS como fenómeno ocupacional.", true, "avanzado"],
  ["El humo de leña dentro de la vivienda no afecta los pulmones.", false, "medio"],
  ["El agua potable segura es un determinante de la salud.", true, "principiante"],
];
vf.forEach(([st, isTrue, lvl], i) => {
  const third = ["Solo en niños", "Solo los fines de semana", "Depende del clima", "Solo en adultos mayores"][i % 4];
  out.push([lvl, "Mitos y verdades", `¿Verdadero o falso? "${st}"`, isTrue ? "Verdadero" : "Falso", isTrue ? "Falso" : "Verdadero", third, `${isTrue ? "Verdadero" : "Falso"}: ${st}`]);
});

/* ---------- Sueño por edad ---------- */
const sueno: [string, string, string, string][] = [
  ["recién nacidos (0-3 meses)", "14 a 17 horas", "8 horas", "5 horas"],
  ["bebés (4-11 meses)", "12 a 15 horas", "7 horas", "20 horas"],
  ["niños pequeños (1-2 años)", "11 a 14 horas", "6 horas", "18 horas"],
  ["preescolares (3-5 años)", "10 a 13 horas", "5 horas", "16 horas"],
  ["escolares (6-13 años)", "9 a 11 horas", "5 horas", "15 horas"],
  ["adolescentes (14-17 años)", "8 a 10 horas", "4 horas", "14 horas"],
  ["adultos (18-64 años)", "7 a 9 horas", "4 horas", "12 horas"],
  ["adultos mayores (65+ años)", "7 a 8 horas", "3 horas", "13 horas"],
];
sueno.forEach(([g, ok, w1, w2]) => out.push(["medio", "Descanso y sueño", `¿Cuántas horas de sueño se recomiendan para ${g}?`, ok, w1, w2, `Para ${g} se recomiendan ${ok} de sueño (National Sleep Foundation).`]));

/* ---------- Municipio Saludable: guía de implementación ---------- */
const ms: Raw[] = [
  ["medio", "Municipio Saludable", "En la fase de sensibilización, ¿a quién se debe involucrar primero?", "A la Intendencia, la Junta Municipal y referentes comunitarios", "Solo a los turistas", "A nadie, se hace en silencio", "El compromiso político y social es el primer paso."],
  ["medio", "Municipio Saludable", "¿Qué documento formaliza el compromiso del municipio con la estrategia?", "Un acta de compromiso o resolución/ordenanza municipal", "Una publicación en redes sociales", "Un recibo", "La formalización asegura respaldo institucional."],
  ["medio", "Municipio Saludable", "¿Qué debe incluir el diagnóstico local de salud?", "Datos de salud, determinantes, recursos y percepción de la comunidad", "Solo el número de médicos", "Solo el presupuesto", "Combina información cuantitativa y cualitativa."],
  ["medio", "Municipio Saludable", "¿Qué técnica participativa es útil para priorizar problemas con la comunidad?", "Asambleas, talleres y matrices de priorización", "Sorteo al azar", "Decisión unilateral del intendente", "La priorización participativa genera compromiso."],
  ["medio", "Municipio Saludable", "¿Cuál de estos es un criterio para priorizar un problema de salud en el municipio?", "Magnitud, gravedad y factibilidad de intervención", "El color del edificio municipal", "La cantidad de fiestas patronales", "Se priorizan problemas frecuentes, graves y abordables."],
  ["avanzado", "Municipio Saludable", "¿Qué características deben tener los objetivos del plan municipal (criterio SMART)?", "Específicos, medibles, alcanzables, relevantes y con plazo", "Generales y sin fecha", "Secretos", "Objetivos SMART facilitan la evaluación."],
  ["avanzado", "Municipio Saludable", "¿Qué es el monitoreo en el ciclo del Municipio Saludable?", "Seguimiento periódico de actividades e indicadores durante la ejecución", "Una evaluación única al final", "Una auditoría fiscal", "El monitoreo permite corregir a tiempo."],
  ["avanzado", "Municipio Saludable", "¿Qué diferencia hay entre monitoreo y evaluación?", "El monitoreo es continuo; la evaluación analiza resultados e impacto en momentos definidos", "Son lo mismo", "La evaluación es diaria y el monitoreo anual", "Ambos forman parte del ciclo de gestión."],
  ["medio", "Municipio Saludable", "¿Por qué es importante la rendición de cuentas a la comunidad?", "Genera confianza, transparencia y sostenibilidad", "No es importante", "Solo sirve para la prensa", "La comunidad debe conocer los avances y resultados."],
  ["medio", "Municipio Saludable", "¿Qué entornos se priorizan en la estrategia de Municipio Saludable?", "Escuelas, lugares de trabajo, viviendas, mercados y espacios públicos", "Solo hospitales", "Solo oficinas municipales", "El enfoque de entornos actúa donde la gente vive, estudia y trabaja."],
  ["medio", "Municipio Saludable", "¿Qué rol tiene la Unidad de Salud de la Familia (USF) en el municipio saludable?", "Articula con la comunidad acciones de promoción y prevención en el territorio", "Solo vende medicamentos", "No participa", "Las USF son la puerta de entrada de la APS en Paraguay."],
  ["avanzado", "Municipio Saludable", "¿Qué es un 'mapa de riesgos y recursos' comunitario?", "Representación gráfica de amenazas a la salud y activos del territorio", "Un mapa de rutas", "Un plano eléctrico", "Es una herramienta del diagnóstico participativo."],
  ["avanzado", "Municipio Saludable", "¿Qué significa 'activos en salud' en el enfoque comunitario?", "Recursos y fortalezas de la comunidad que generan bienestar", "Deudas del municipio", "Medicamentos vencidos", "El mapeo de activos complementa el enfoque de necesidades."],
  ["medio", "Municipio Saludable", "¿Qué acción municipal contribuye a prevenir el dengue?", "Recolección regular de residuos y mingas ambientales", "Acumular neumáticos en la vía pública", "Suspender la recolección", "El saneamiento ambiental es responsabilidad local."],
  ["medio", "Municipio Saludable", "¿Qué acción municipal promueve la actividad física?", "Programas de gimnasia en plazas y calles recreativas", "Prohibir el uso de las plazas", "Eliminar veredas", "El espacio público activo mejora la salud de todos."],
  ["medio", "Municipio Saludable", "¿Qué acción municipal favorece la alimentación saludable?", "Ferias de productores locales y huertas comunitarias", "Subsidiar gaseosas", "Prohibir la venta de frutas", "El acceso a alimentos frescos es un determinante clave."],
  ["avanzado", "Municipio Saludable", "¿Qué es la 'gobernanza para la salud' en el ámbito local?", "Forma en que gobierno, sociedad civil y sector privado toman decisiones conjuntas por la salud", "Gobierno de los médicos", "Un impuesto", "Es un pilar de la Declaración de Shanghái."],
  ["avanzado", "Municipio Saludable", "¿Qué red internacional agrupa a municipios comprometidos con la salud en las Américas?", "Red de Municipios, Ciudades y Comunidades Saludables (OPS)", "Red de supermercados", "Liga de fútbol", "Facilita el intercambio de experiencias."],
  ["medio", "Municipio Saludable", "¿Quiénes deberían integrar el equipo técnico local de la estrategia?", "Representantes de salud, educación, ambiente, acción social y organizaciones comunitarias", "Solo el intendente", "Solo médicos del hospital", "La diversidad del equipo asegura el enfoque intersectorial."],
  ["medio", "Municipio Saludable", "¿Qué es una 'escuela promotora de salud'?", "Escuela que integra salud en su proyecto educativo, entorno y vínculos con la comunidad", "Escuela de enfermería", "Escuela sin educación física", "Iniciativa impulsada por OPS/OMS."],
];
out.push(...ms);

/* ---------- Alimentación por etapa de vida ---------- */
const etapas: Raw[] = [
  ["medio", "Alimentación", "¿Qué alimento se debe evitar en menores de 1 año por riesgo de botulismo?", "Miel", "Banana", "Zapallo", "La miel puede contener esporas de Clostridium botulinum."],
  ["medio", "Alimentación", "¿Se debe agregar sal o azúcar a la comida de un bebé menor de 1 año?", "No, no es necesario ni recomendable", "Sí, mucha sal", "Sí, mucha azúcar", "El bebé debe aprender los sabores naturales."],
  ["medio", "Alimentación", "¿Qué mineral necesitan especialmente las adolescentes por la menstruación?", "Hierro", "Plomo", "Sodio", "La pérdida menstrual aumenta el riesgo de anemia."],
  ["medio", "Alimentación", "¿Qué nutriente es clave durante el embarazo para el desarrollo del bebé?", "Ácido fólico, hierro y calcio", "Cafeína", "Alcohol", "Se recomienda suplementación bajo control prenatal."],
  ["medio", "Alimentación", "¿Qué deben priorizar los adultos mayores en su alimentación?", "Proteínas de calidad, calcio, fibra y buena hidratación", "Solo líquidos", "Dulces para la energía", "Previene sarcopenia, osteoporosis y estreñimiento."],
  ["principiante", "Alimentación", "¿Cuál es la mejor merienda escolar?", "Fruta, un sándwich integral y agua", "Gaseosa y papas fritas", "Golosinas", "Una merienda saludable mejora la atención en clase."],
  ["medio", "Alimentación", "¿Por qué los adultos mayores deben beber agua aunque no sientan sed?", "La sensación de sed disminuye con la edad", "Porque el agua engorda", "Porque no la necesitan", "La deshidratación es frecuente en personas mayores."],
  ["avanzado", "Alimentación", "¿Cuánta proteína aproximada por kg de peso necesita un adulto mayor sano al día?", "1,0 a 1,2 g/kg", "0,1 g/kg", "5 g/kg", "Mayor que en adultos jóvenes para prevenir la sarcopenia."],
  ["medio", "Alimentación", "¿Qué bebida es inadecuada para niños pequeños por su cafeína y azúcar?", "Gaseosa cola", "Agua", "Leche", "La cafeína altera el sueño y el azúcar daña los dientes."],
  ["principiante", "Alimentación", "¿Cuál es la mejor forma de consumir mandioca en una alimentación saludable?", "Hervida, en porción moderada, acompañada de verduras", "Frita todos los días", "No se debe consumir nunca", "La mandioca es un alimento tradicional nutritivo."],
  ["medio", "Alimentación", "¿Qué pasa con la vitamina C de las verduras al hervirlas mucho tiempo?", "Se pierde en gran parte", "Aumenta", "No cambia", "Preferir cocciones cortas o al vapor."],
  ["principiante", "Alimentación", "¿Qué fruta de estación en Paraguay es muy rica en vitamina C?", "Mandarina y naranja", "Pan", "Arroz", "Los cítricos abundan en invierno."],
  ["medio", "Alimentación", "¿Cuál es el principal problema nutricional de los escolares paraguayos según las encuestas?", "Sobrepeso y obesidad en aumento", "Exceso de vitamina C", "Consumo excesivo de verduras", "Uno de cada tres escolares tiene exceso de peso."],
  ["avanzado", "Alimentación", "¿Qué establece la ley paraguaya sobre las cantinas escolares?", "Deben ofrecer alimentos saludables y limitar ultraprocesados", "Pueden vender cualquier producto", "Deben vender solo gaseosas", "Ley 5.283/14 de Cantinas Escolares Saludables."],
  ["avanzado", "Alimentación", "¿Qué programa nacional entrega alimentación a escolares en Paraguay?", "Programa de Alimentación Escolar (almuerzo y merienda escolar)", "Programa de vacunación", "Programa de vivienda", "Ley 6.277/19 Hambre Cero en las Escuelas lo fortalece."],
];
out.push(...etapas);

export const bank3: Raw[] = out;
