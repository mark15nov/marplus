/* ==========================================================================
   MARPLUS · DATOS MAESTROS
   Fuente única de verdad. Todo el resto de la app deriva de aquí.
   ========================================================================== */

/* --------------------- CLIENTES --------------------- */
export const CLIENTES = [
  { id: 'c1', nombre: 'Hospital Ángeles Pedregal', sector: 'Salud',       personal: 24, contrato: 'A',  estado: 'activo',   desde: 2021, zona: 'centro',   mrr: 264.5, mrrDelta: '+8.4K', margen: 32.4, margenDelta: '+2.4', tickets: 3, satisfaccion: 9.2, nps: 72, slaUptime: 96, slaResp: 2.1 },
  { id: 'c2', nombre: 'Torre BBVA Reforma',        sector: 'Corporativo', personal: 18, contrato: 'A+', estado: 'activo',   desde: 2019, zona: 'centro',   mrr: 232.3, mrrDelta: '+11.1K', margen: 39.5, margenDelta: '+1.1', tickets: 1, satisfaccion: 9.5, nps: 82, slaUptime: 99, slaResp: 1.4 },
  { id: 'c3', nombre: 'Plaza Antara',              sector: 'Retail',      personal: 31, contrato: 'B',  estado: 'activo',   desde: 2020, zona: 'poniente', mrr: 308.4, mrrDelta: '-6.2K',  margen: 28.4, margenDelta: '-1.8', tickets: 5, satisfaccion: 8.6, nps: 54, slaUptime: 91, slaResp: 3.4 },
  { id: 'c4', nombre: 'Corporativo Citibanamex',   sector: 'Corporativo', personal: 14, contrato: 'A',  estado: 'activo',   desde: 2022, zona: 'norte',    mrr: 184.8, mrrDelta: '+3.6K',  margen: 37.2, margenDelta: '+0.8', tickets: 0, satisfaccion: 9.4, nps: 78, slaUptime: 98, slaResp: 1.8 },
  { id: 'c5', nombre: 'WeWork Insurgentes',        sector: 'Coworking',   personal: 9,  contrato: 'B',  estado: 'revision', desde: 2023, zona: 'sur',      mrr: 72.4,  mrrDelta: '-2.8K',  margen: 14.9, margenDelta: '-3.2', tickets: 4, satisfaccion: 7.8, nps: 38, slaUptime: 87, slaResp: 4.2 },
  { id: 'c6', nombre: 'Universidad Anáhuac Norte', sector: 'Educación',   personal: 28, contrato: 'A',  estado: 'activo',   desde: 2018, zona: 'norte',    mrr: 304.6, mrrDelta: '+9.4K',  margen: 29.3, margenDelta: '+0.4', tickets: 2, satisfaccion: 8.9, nps: 64, slaUptime: 94, slaResp: 2.8 },
]

export const ZONAS = [
  { id: 'norte',    nombre: 'Norte',    clientes: ['c4', 'c6'] },
  { id: 'centro',   nombre: 'Centro',   clientes: ['c1', 'c2'] },
  { id: 'sur',      nombre: 'Sur',      clientes: ['c5'] },
  { id: 'poniente', nombre: 'Poniente', clientes: ['c3'] },
]

export const getCliente = (id) => CLIENTES.find(c => c.id === id)

/* --------------------- CONTACTOS Y UBICACIONES POR CLIENTE --------------------- */
export const CLIENTE_META = {
  c1: {
    supervisor: 'Esmeralda Rodríguez Vega',
    contacto: { nombre: 'Dra. Marcela Fuentes', puesto: 'Dir. Operaciones', email: 'm.fuentes@angelespedregal.mx', tel: '55 5449 5500' },
    ubicaciones: ['Torre Médica', 'Urgencias', 'Quirófanos', 'Cafetería', 'Estacionamiento', 'Consultorios planta baja'],
  },
  c2: {
    supervisor: 'Carlos Pérez Núñez',
    contacto: { nombre: 'Ing. Alberto Solís', puesto: 'Facility Manager', email: 'a.solis@bbva.com', tel: '55 5621 3434' },
    ubicaciones: ['Lobby', 'Pisos 10-20', 'Pisos 21-30', 'Pent-house', 'Sótano 1', 'Sótano 2'],
  },
  c3: {
    supervisor: 'María Solís Ramos',
    contacto: { nombre: 'Lic. Rodrigo Mendoza', puesto: 'Gerente General', email: 'r.mendoza@plazaantara.mx', tel: '55 5280 1010' },
    ubicaciones: ['Plaza central', 'Food court', 'Estacionamiento norte', 'Estacionamiento sur', 'Oficinas admin', 'Zonas VIP'],
  },
  c4: {
    supervisor: 'Rubén Estrada López',
    contacto: { nombre: 'Arq. Mariana López', puesto: 'Admin Facilities', email: 'm.lopez@banamex.com', tel: '55 5226 2001' },
    ubicaciones: ['Edificio principal', 'Torre ejecutiva', 'Data center', 'Cafetería'],
  },
  c5: {
    supervisor: 'Luis Vázquez Martínez',
    contacto: { nombre: 'Paula Núñez', puesto: 'Community Manager', email: 'p.nunez@wework.mx', tel: '55 4155 6677' },
    ubicaciones: ['Lobby', 'Pisos privados', 'Salas comunes', 'Cocina'],
  },
  c6: {
    supervisor: 'Felipe Castro Ruiz',
    contacto: { nombre: 'Mtro. Javier Ortiz', puesto: 'Dir. Servicios', email: 'j.ortiz@anahuac.mx', tel: '55 5627 0210' },
    ubicaciones: ['Edificio A', 'Edificio B', 'Biblioteca', 'Auditorio', 'Cafetería', 'Laboratorios', 'Canchas'],
  },
}

/* --------------------- PLANTILLA REAL (134 empleados) --------------------- */
/* Notación compacta. Luego expandimos con helpers.                            */

function E(nombre, puesto, cliente, turno, desde, sueldo, rating, zona) {
  return { nombre, puesto, cliente, turno, desde, sueldo, rating, zona: zona || (cliente && getCliente(cliente)?.zona) || 'centro', antiguedad: `${((new Date().getFullYear() - parseInt(desde)) + (1 - Math.random()) * 0.6).toFixed(1)} años` }
}

const C1 = 'c1', C2 = 'c2', C3 = 'c3', C4 = 'c4', C5 = 'c5', C6 = 'c6'
const M = 'Matutino', V = 'Vespertino', N = 'Nocturno', X = 'Variable'

export const EMPLEADOS = [
  /* === HOSPITAL ÁNGELES PEDREGAL (c1 · 24 personas) === */
  E('Esmeralda Rodríguez Vega', 'Supervisora', C1, M, '2022', 14500, 4.9),
  E('Carlos Pérez Núñez',       'Operativo',   C1, M, '2023', 8200, 4.6),
  E('María Solís Fuentes',      'Operativa',   C1, M, '2023', 8200, 4.7),
  E('Pedro Núñez Ayala',        'Operativo',   C1, N, '2022', 8800, 4.8),
  E('Brenda García Torres',     'Operativa',   C1, M, '2023', 8200, 4.5),
  E('Jorge Hernández Reyes',    'Operativo',   C1, M, '2023', 8200, 4.4),
  E('Lucía Morales Pinto',      'Operativa',   C1, V, '2022', 8400, 4.6),
  E('Ángel Domínguez Luna',     'Operativo',   C1, V, '2024', 7800, 4.2),
  E('Teresa Guzmán Méndez',     'Operativa',   C1, M, '2021', 8600, 4.8),
  E('Raúl Ortega Cortés',       'Operativo',   C1, N, '2023', 8600, 4.5),
  E('Mónica Ibarra Peña',       'Operativa',   C1, V, '2023', 8200, 4.4),
  E('Sergio Castillo Acosta',   'Operativo',   C1, M, '2022', 8400, 4.7),
  E('Guadalupe Flores Silva',   'Operativa',   C1, M, '2021', 8600, 4.9),
  E('Héctor Cruz Rivera',       'Operativo',   C1, V, '2024', 7800, 4.3),
  E('Claudia Luna Campos',      'Operativa',   C1, M, '2022', 8400, 4.6),
  E('Fernando Ayala Reyes',     'Operativo',   C1, V, '2023', 8000, 4.5),
  E('Silvia Montes Beltrán',    'Operativa',   C1, M, '2023', 8200, 4.6),
  E('Alejandro Vega Ruiz',      'Operativo',   C1, N, '2022', 8800, 4.7),
  E('Rosa Cervantes Cortez',    'Operativa',   C1, V, '2024', 7800, 4.3),
  E('Mario Sánchez Báez',       'Operativo',   C1, M, '2023', 8200, 4.4),
  E('Paola Ramírez López',      'Operativa',   C1, V, '2023', 8200, 4.5),
  E('Enrique Torres Navarro',   'Operativo',   C1, N, '2023', 8600, 4.5),
  E('Isabel Guerrero Durán',    'Operativa',   C1, M, '2024', 7800, 4.3),
  E('Arturo Medina Vázquez',    'Operativo',   C1, V, '2022', 8400, 4.7),

  /* === TORRE BBVA REFORMA (c2 · 18 personas) === */
  E('Carlos Pérez Castañeda',   'Supervisor',  C2, M, '2020', 15200, 4.8),
  E('Lidia Moreno Hernández',   'Operativa',   C2, M, '2022', 8400, 4.9),
  E('Jorge Hdz Castañeda',      'Operativo',   C2, M, '2021', 8600, 4.7),
  E('Eduardo Ríos López',       'Operativo',   C2, V, '2023', 8000, 4.5),
  E('Gabriela Luna Ramos',      'Operativa',   C2, V, '2023', 8000, 4.6),
  E('Óscar Beltrán Ortiz',      'Operativo',   C2, M, '2022', 8400, 4.6),
  E('Adriana Jiménez Ríos',     'Operativa',   C2, M, '2021', 8600, 4.8),
  E('Rafael Ochoa Silva',       'Operativo',   C2, V, '2022', 8400, 4.5),
  E('Laura Campos Herrera',     'Operativa',   C2, M, '2022', 8400, 4.7),
  E('Manuel Solano Ibarra',     'Operativo',   C2, N, '2023', 8600, 4.6),
  E('Perla Jiménez Correa',     'Operativa',   C2, V, '2023', 8000, 4.5),
  E('Hugo Castillo Mora',       'Operativo',   C2, M, '2022', 8400, 4.7),
  E('Martha Acosta Cabrera',    'Operativa',   C2, V, '2023', 8000, 4.4),
  E('Alberto Mora Vega',        'Operativo',   C2, N, '2023', 8600, 4.5),
  E('Verónica Peña Torres',     'Operativa',   C2, M, '2024', 7600, 4.3),
  E('Ricardo Guzmán Durán',     'Operativo',   C2, V, '2022', 8400, 4.6),
  E('Natalia Rojas Béjar',      'Operativa',   C2, M, '2023', 8000, 4.5),
  E('Daniel Ortiz Zamora',      'Operativo',   C2, V, '2024', 7600, 4.2),

  /* === PLAZA ANTARA (c3 · 31 personas) === */
  E('María Solís Ramos',        'Supervisora', C3, M, '2021', 14800, 4.6),
  E('Felipe Castro Guzmán',     'Operativo',   C3, M, '2022', 8000, 4.3),
  E('Ana Solano Ibarra',        'Operativa',   C3, V, '2022', 8000, 4.4),
  E('Mario Guzmán Peña',        'Operativo',   C3, V, '2023', 7800, 4.2),
  E('Diana Peña Morales',       'Operativa',   C3, N, '2023', 8200, 4.5),
  E('Jorge Luna Ortega',        'Operativo',   C3, N, '2024', 7600, 4.1),
  E('Javier Rojas Ayala',       'Supervisor',  C3, V, '2022', 14200, 4.5),
  E('Susana Vega Montes',       'Operativa',   C3, M, '2021', 8200, 4.7),
  E('Raúl Sánchez Cabrera',     'Operativo',   C3, M, '2023', 7800, 4.3),
  E('Daniela Torres Correa',    'Operativa',   C3, V, '2023', 7800, 4.4),
  E('Pablo Martínez Pérez',     'Operativo',   C3, M, '2022', 8000, 4.5),
  E('Lorena Ramírez García',    'Operativa',   C3, N, '2024', 8000, 4.3),
  E('Andrés Gómez Mendoza',     'Operativo',   C3, M, '2023', 7800, 4.4),
  E('Julia Hernández Ortega',   'Operativa',   C3, V, '2022', 8000, 4.6),
  E('Víctor González Reyes',    'Operativo',   C3, N, '2023', 8200, 4.4),
  E('Mariana López Guerrero',   'Operativa',   C3, M, '2023', 7800, 4.5),
  E('Diego Méndez Aguilar',     'Operativo',   C3, V, '2022', 8000, 4.6),
  E('Carmen Rivera Núñez',      'Operativa',   C3, M, '2024', 7600, 4.2),
  E('Guillermo Cruz Acosta',    'Operativo',   C3, V, '2023', 7800, 4.3),
  E('Itzel Ortiz Vega',         'Operativa',   C3, N, '2023', 8200, 4.5),
  E('Roberto Flores Luna',      'Operativo',   C3, M, '2022', 8000, 4.5),
  E('Fernanda Morales Cruz',    'Operativa',   C3, V, '2024', 7600, 4.3),
  E('Antonio Ayala Silva',      'Operativo',   C3, N, '2023', 8200, 4.4),
  E('Patricia Durán Hernández', 'Operativa',   C3, M, '2021', 8200, 4.7),
  E('Ernesto Luna Campos',      'Operativo',   C3, V, '2022', 8000, 4.5),
  E('Yolanda Castro Solís',     'Operativa',   C3, M, '2023', 7800, 4.4),
  E('Miguel Herrera Navarro',   'Operativo',   C3, N, '2024', 8000, 4.2),
  E('Elena Peña Martínez',      'Operativa',   C3, V, '2023', 7800, 4.5),
  E('Francisco Zamora León',    'Operativo',   C3, M, '2022', 8000, 4.6),
  E('Valeria Ochoa Ruiz',       'Operativa',   C3, V, '2024', 7600, 4.3),
  E('Armando Cervantes Luna',   'Operativo',   C3, N, '2023', 8200, 4.4),

  /* === CORPORATIVO CITIBANAMEX (c4 · 14 personas) === */
  E('Rubén Estrada López',      'Supervisor',  C4, M, '2022', 14200, 4.7),
  E('Hugo Castillo Méndez',     'Operativo',   C4, M, '2023', 8000, 4.5),
  E('Perla Jiménez Torres',     'Operativa',   C4, V, '2023', 8000, 4.6),
  E('Rafael Ochoa Silva',       'Operativo',   C4, N, '2024', 8200, 4.3),
  E('Verónica Moreno Luna',     'Operativa',   C4, M, '2023', 8000, 4.5),
  E('Sergio Reyes Beltrán',     'Operativo',   C4, V, '2022', 8200, 4.6),
  E('Claudia Herrera Vega',     'Operativa',   C4, M, '2022', 8200, 4.7),
  E('Antonio Méndez Cruz',      'Operativo',   C4, N, '2023', 8200, 4.4),
  E('Rosa Flores García',       'Operativa',   C4, V, '2024', 7800, 4.3),
  E('Fernando Solís Ayala',     'Operativo',   C4, M, '2023', 8000, 4.5),
  E('Silvia Ibarra Cortés',     'Operativa',   C4, V, '2023', 8000, 4.5),
  E('Gabriel Torres Ochoa',     'Operativo',   C4, N, '2024', 8200, 4.3),
  E('Mariana Pérez Durán',      'Operativa',   C4, M, '2022', 8200, 4.7),
  E('Raúl Cervantes Ríos',      'Operativo',   C4, V, '2023', 8000, 4.5),

  /* === WEWORK INSURGENTES (c5 · 9 personas) === */
  E('Luis Vázquez Martínez',    'Supervisor',  C5, M, '2023', 13800, 4.2),
  E('Pedro Núñez Guerrero',     'Operativo',   C5, M, '2023', 7800, 4.4),
  E('Marisol Báez Castro',      'Operativa',   C5, V, '2024', 7600, 4.0),
  E('Marco Hernández Luna',     'Operativo',   C5, V, '2023', 7800, 4.3),
  E('Itzel Ramírez Peña',       'Operativa',   C5, M, '2024', 7600, 4.1),
  E('Jaime Reyes Ortiz',        'Operativo',   C5, V, '2023', 7800, 4.2),
  E('Sofía Medina Vega',        'Operativa',   C5, M, '2024', 7600, 4.1),
  E('David Mendoza Solís',      'Operativo',   C5, N, '2023', 8000, 4.3),
  E('Paola Campos Ortega',      'Operativa',   C5, V, '2024', 7600, 4.0),

  /* === UNIVERSIDAD ANÁHUAC NORTE (c6 · 28 personas) === */
  E('Felipe Castro Ruiz',       'Supervisor',  C6, M, '2019', 15000, 4.6),
  E('Juan Ramírez González',    'Operativo',   C6, M, '2020', 8600, 4.5),
  E('Adriana Montes Silva',     'Operativa',   C6, M, '2021', 8400, 4.7),
  E('Óscar Beltrán Cortés',     'Operativo',   C6, V, '2022', 8000, 4.4),
  E('Laura Campos Aguilar',     'Operativa',   C6, V, '2023', 7800, 4.6),
  E('Alberto Mora Cervantes',   'Operativo',   C6, N, '2023', 8200, 4.3),
  E('Miguel Solís Rivera',      'Supervisor',  C6, V, '2021', 14500, 4.6),
  E('Carmen Flores Guerrero',   'Operativa',   C6, M, '2022', 8200, 4.7),
  E('Andrés Vázquez Torres',    'Operativo',   C6, V, '2023', 7800, 4.4),
  E('Mónica Ruiz Luna',         'Operativa',   C6, N, '2024', 8000, 4.3),
  E('Rafael Jiménez Ayala',     'Operativo',   C6, M, '2022', 8400, 4.6),
  E('Teresa Cruz Mendoza',      'Operativa',   C6, V, '2021', 8200, 4.8),
  E('Jorge Peña Ortiz',         'Operativo',   C6, N, '2023', 8200, 4.4),
  E('Brenda Acosta Domínguez',  'Operativa',   C6, M, '2023', 8000, 4.5),
  E('Héctor Sánchez León',      'Operativo',   C6, V, '2022', 8000, 4.5),
  E('Lucía Guerrero Pérez',     'Operativa',   C6, M, '2024', 7800, 4.3),
  E('Raúl Ortega Reyes',        'Operativo',   C6, N, '2023', 8200, 4.4),
  E('Isabel Núñez Flores',      'Operativa',   C6, V, '2022', 8200, 4.6),
  E('Víctor Hernández Campos',  'Operativo',   C6, M, '2023', 8000, 4.5),
  E('Silvia Domínguez Cruz',    'Operativa',   C6, V, '2023', 7800, 4.4),
  E('Arturo Reyes Méndez',      'Operativo',   C6, N, '2024', 8200, 4.3),
  E('Daniela Cortés Silva',     'Operativa',   C6, M, '2024', 7800, 4.2),
  E('Fernando Mendoza Luna',    'Operativo',   C6, V, '2022', 8000, 4.5),
  E('Elena Rivera Ochoa',       'Operativa',   C6, M, '2023', 8000, 4.5),
  E('Guillermo León Peña',      'Operativo',   C6, N, '2023', 8200, 4.4),
  E('Julia Báez Torres',        'Operativa',   C6, V, '2024', 7800, 4.3),
  E('Ricardo Cabrera Vega',     'Operativo',   C6, M, '2023', 8000, 4.5),
  E('Patricia Ortiz Beltrán',   'Operativa',   C6, V, '2021', 8400, 4.7),

  /* === COMODINES (8 personas · sin cliente fijo) === */
  E('Karla Méndez Silva',       'Comodín', null, X, '2022', 9400, 4.8, 'norte'),
  E('Juan Salazar Moreno',      'Comodín', null, X, '2022', 9200, 4.6, 'centro'),
  E('Patricia Ríos Herrera',    'Comodín', null, X, '2021', 9600, 4.9, 'centro'),
  E('Marco Hernández Luna',     'Comodín', null, X, '2023', 9000, 4.5, 'sur'),
  E('Lucía Olvera Pérez',       'Comodín', null, X, '2022', 9400, 4.7, 'poniente'),
  E('Diego Aguilar Torres',     'Comodín', null, X, '2023', 9000, 4.4, 'norte'),
  E('Natalia Ruiz Guerrero',    'Comodín', null, X, '2022', 9200, 4.6, 'centro'),
  E('Alejandra Cortés Vega',    'Comodín', null, X, '2023', 9000, 4.5, 'poniente'),

  /* === CORPORATIVO / ADMIN (4 personas) === */
  E('Mario Trachtman Hirsch',   'Dirección',   null, M, '2018', 32000, 5.0, 'centro'),
  E('Dolores Ruiz Cervantes',   'Coordinación operativa', null, M, '2019', 22000, 4.9, 'centro'),
  E('Arturo López Monroy',      'Compras',     null, M, '2020', 18000, 4.7, 'centro'),
  E('Beatriz Campos Aguirre',   'RRHH + NOI',  null, M, '2019', 20000, 4.8, 'centro'),
]

/* --------------------- HELPERS --------------------- */

export function personalByCliente(clienteId) {
  return EMPLEADOS.filter(e => e.cliente === clienteId)
}

export function comodines() {
  return EMPLEADOS.filter(e => e.puesto === 'Comodín').map(c => ({
    id: 'co-' + c.nombre.split(' ')[0].toLowerCase(),
    nombre: c.nombre,
    zona: c.zona,
    rating: c.rating,
    dispo: ['Inmediata', 'En 1h', 'En 2h', 'Inmediata'][Math.floor(c.rating * 2) % 4],
  }))
}

export function nominaTotal() {
  return EMPLEADOS.reduce((a, e) => a + e.sueldo, 0)
}

export function countByCliente() {
  const counts = {}
  for (const e of EMPLEADOS) if (e.cliente) counts[e.cliente] = (counts[e.cliente] || 0) + 1
  return counts
}

/* --------------------- MAQUINARIA POR CLIENTE --------------------- */
export const MAQUINARIA = {
  c1: [
    { item: 'Aspiradora industrial 60L', marca: 'Karcher T 12/1',  serie: 'KR-8821', estado: 'Operativa',      mantPróx: 'en 12 días' },
    { item: 'Pulidora baja velocidad',    marca: 'Tornado BR-1700', serie: 'TR-4412', estado: 'Operativa',      mantPróx: 'en 28 días' },
    { item: 'Hidrolavadora 1900 PSI',     marca: 'Karcher K5',      serie: 'KR-1051', estado: 'Mantenimiento',  mantPróx: 'en curso' },
    { item: 'Carrito multifuncional',     marca: 'Rubbermaid',      serie: 'RB-7720', estado: 'Operativa',      mantPróx: 'en 45 días' },
    { item: 'Aspiradora de mochila',      marca: 'ProTeam 6',       serie: 'PT-3318', estado: 'Operativa',      mantPróx: 'en 20 días' },
    { item: 'Enceradora de alta vel.',    marca: 'Tornado BR-2000', serie: 'TR-4420', estado: 'Operativa',      mantPróx: 'en 33 días' },
  ],
  c2: [
    { item: 'Barredora eléctrica',        marca: 'Tennant S10',     serie: 'TN-6612', estado: 'Operativa', mantPróx: 'en 8 días' },
    { item: 'Aspiradora seca/húmeda',     marca: 'Karcher NT 35/1', serie: 'KR-2201', estado: 'Operativa', mantPróx: 'en 14 días' },
    { item: 'Hidrolavadora 2000 PSI',     marca: 'Karcher HD 7/15', serie: 'KR-7015', estado: 'Operativa', mantPróx: 'en 30 días' },
    { item: 'Máquina limpieza vidrios',   marca: 'IPC Gansow',      serie: 'IP-8840', estado: 'Operativa', mantPróx: 'en 40 días' },
    { item: 'Pulidora alta velocidad',    marca: 'Makita 9237CB',   serie: 'MK-9228', estado: 'Operativa', mantPróx: 'en 22 días' },
  ],
  c3: [
    { item: 'Barredora industrial',       marca: 'Tennant T16',     serie: 'TN-1616', estado: 'Operativa',     mantPróx: 'en 6 días' },
    { item: 'Aspiradora industrial 60L',  marca: 'Karcher T 12/1',  serie: 'KR-8823', estado: 'Mantenimiento', mantPróx: 'en curso' },
    { item: 'Pulidora alta velocidad',    marca: 'Makita 9237CB',   serie: 'MK-9237', estado: 'Operativa',     mantPróx: 'en 22 días' },
    { item: 'Carrito multifuncional',     marca: 'Rubbermaid',      serie: 'RB-7721', estado: 'Operativa',     mantPróx: 'en 35 días' },
    { item: 'Hidrolavadora 1600 PSI',     marca: 'Karcher K4',      serie: 'KR-1041', estado: 'Operativa',     mantPróx: 'en 18 días' },
    { item: 'Máquina limpieza vidrios',   marca: 'IPC Gansow',      serie: 'IP-8841', estado: 'Operativa',     mantPróx: 'en 28 días' },
    { item: 'Aspiradora de mochila',      marca: 'ProTeam 6',       serie: 'PT-3320', estado: 'Operativa',     mantPróx: 'en 15 días' },
    { item: 'Enceradora baja vel.',       marca: 'Tornado BR-1500', serie: 'TR-4415', estado: 'Operativa',     mantPróx: 'en 40 días' },
  ],
  c4: [
    { item: 'Aspiradora industrial',      marca: 'Karcher T 10/1',  serie: 'KR-8810', estado: 'Operativa', mantPróx: 'en 10 días' },
    { item: 'Pulidora baja velocidad',    marca: 'Tornado BR-1500', serie: 'TR-4410', estado: 'Operativa', mantPróx: 'en 25 días' },
    { item: 'Carrito multifuncional',     marca: 'Rubbermaid',      serie: 'RB-7723', estado: 'Operativa', mantPróx: 'en 40 días' },
    { item: 'Máquina limpieza vidrios',   marca: 'IPC Gansow',      serie: 'IP-8845', estado: 'Operativa', mantPróx: 'en 38 días' },
  ],
  c5: [
    { item: 'Aspiradora seca/húmeda',     marca: 'Karcher NT 22/1', serie: 'KR-2220', estado: 'Operativa', mantPróx: 'en 15 días' },
    { item: 'Carrito multifuncional',     marca: 'Rubbermaid',      serie: 'RB-7724', estado: 'Operativa', mantPróx: 'en 35 días' },
    { item: 'Pulidora portátil',          marca: 'Makita 9227CB',   serie: 'MK-9220', estado: 'Operativa', mantPróx: 'en 28 días' },
  ],
  c6: [
    { item: 'Barredora industrial',       marca: 'Tennant T7',       serie: 'TN-0707', estado: 'Operativa',     mantPróx: 'en 9 días' },
    { item: 'Aspiradora industrial',      marca: 'Karcher T 12/1',   serie: 'KR-8824', estado: 'Operativa',     mantPróx: 'en 17 días' },
    { item: 'Pulidora baja velocidad',    marca: 'Tornado BR-1700',  serie: 'TR-4413', estado: 'Operativa',     mantPróx: 'en 32 días' },
    { item: 'Hidrolavadora 1900 PSI',     marca: 'Karcher K5',       serie: 'KR-1052', estado: 'Mantenimiento', mantPróx: 'en curso' },
    { item: 'Máquina limpieza vidrios',   marca: 'IPC Gansow',       serie: 'IP-8842', estado: 'Operativa',     mantPróx: 'en 38 días' },
    { item: 'Aspiradora de mochila',      marca: 'ProTeam 6',        serie: 'PT-3322', estado: 'Operativa',     mantPróx: 'en 20 días' },
    { item: 'Enceradora alta vel.',       marca: 'Tornado BR-2000',  serie: 'TR-4421', estado: 'Operativa',     mantPróx: 'en 26 días' },
  ],
}

/* --------------------- CONSUMO / ACTIVIDAD POR CLIENTE --------------------- */
export const CONSUMO = {
  c1: [ { stock: 78, consumo: 62 }, { stock: 85, consumo: 71 }, { stock: 72, consumo: 68 }, { stock: 88, consumo: 74 }, { stock: 92, consumo: 81 }, { stock: 76, consumo: 88 } ],
  c2: [ { stock: 82, consumo: 54 }, { stock: 88, consumo: 62 }, { stock: 85, consumo: 58 }, { stock: 90, consumo: 65 }, { stock: 87, consumo: 68 }, { stock: 84, consumo: 71 } ],
  c3: [ { stock: 65, consumo: 71 }, { stock: 70, consumo: 78 }, { stock: 68, consumo: 82 }, { stock: 72, consumo: 85 }, { stock: 75, consumo: 88 }, { stock: 62, consumo: 91 } ],
  c4: [ { stock: 72, consumo: 48 }, { stock: 75, consumo: 52 }, { stock: 78, consumo: 50 }, { stock: 80, consumo: 55 }, { stock: 82, consumo: 58 }, { stock: 79, consumo: 62 } ],
  c5: [ { stock: 55, consumo: 68 }, { stock: 58, consumo: 74 }, { stock: 52, consumo: 81 }, { stock: 60, consumo: 88 }, { stock: 54, consumo: 95 }, { stock: 48, consumo: 102 } ],
  c6: [ { stock: 82, consumo: 65 }, { stock: 85, consumo: 72 }, { stock: 88, consumo: 70 }, { stock: 90, consumo: 76 }, { stock: 86, consumo: 79 }, { stock: 84, consumo: 82 } ],
}

export const ACTIVIDAD = {
  c1: [
    { fecha: 'Hoy · 11:42',  tipo: 'reporte',   texto: 'Reporte EQ-1184: aspiradora no enciende' },
    { fecha: 'Hoy · 09:14',  tipo: 'solicitud', texto: 'Solicitud SOL-2847 aprobada · $18.4K' },
    { fecha: 'Ayer · 17:30', tipo: 'nomina',    texto: 'Pre-nómina enviada a NOI · 24 recibos' },
    { fecha: '21 Abr',       tipo: 'sla',       texto: 'SLA mensual cumplido al 96%' },
    { fecha: '18 Abr',       tipo: 'mensaje',   texto: 'WhatsApp automático enviado a contacto' },
  ],
  c2: [
    { fecha: 'Hoy · 08:52',  tipo: 'solicitud', texto: 'SOL-2846 en pre-revisión · $9.87K' },
    { fecha: 'Ayer · 09:15', tipo: 'reporte',   texto: 'Reporte EQ-1183: pulidora cable dañado' },
    { fecha: '20 Abr',       tipo: 'contrato',  texto: 'Renovación contrato firmada · 12 meses' },
    { fecha: '15 Abr',       tipo: 'sla',       texto: 'SLA 99% · sin incidencias críticas' },
  ],
  c3: [
    { fecha: 'Hoy · 08:30',  tipo: 'solicitud', texto: 'SOL-2845 pendiente · $31.3K (sin SAE)' },
    { fecha: 'Ayer · 14:22', tipo: 'alerta',    texto: 'Consumo 91% · sobre promedio' },
    { fecha: '21 Abr',       tipo: 'cxc',       texto: 'Factura F-8801 vencida 15 días' },
    { fecha: '20 Abr',       tipo: 'reporte',   texto: 'Reporte EQ-1182: hidrolavadora reparada' },
  ],
  c4: [
    { fecha: 'Ayer · 17:11', tipo: 'solicitud', texto: 'SOL-2844 aprobada · $6.4K' },
    { fecha: '21 Abr',       tipo: 'nomina',    texto: 'Pre-nómina mensual procesada' },
    { fecha: '17 Abr',       tipo: 'sla',       texto: 'Cumplimiento 98% · excelente' },
  ],
  c5: [
    { fecha: 'Hoy · 06:00',  tipo: 'incidente', texto: 'Falta · Luis Vázquez sin cubrir' },
    { fecha: 'Ayer · 16:02', tipo: 'solicitud', texto: 'SOL-2843 rechazada · sobre presupuesto (102%)' },
    { fecha: '22 Abr',       tipo: 'alerta',    texto: 'Presupuesto rebasado · crítico' },
    { fecha: '15 Abr',       tipo: 'cxc',       texto: 'Factura F-8745 vencida 42 días' },
    { fecha: '10 Abr',       tipo: 'contrato',  texto: 'Revisión de contrato solicitada' },
  ],
  c6: [
    { fecha: 'Ayer · 14:45', tipo: 'solicitud', texto: 'SOL-2842 en pre-revisión · $24.5K' },
    { fecha: '20 Abr',       tipo: 'sla',       texto: 'SLA 94% · dentro de meta' },
    { fecha: '18 Abr',       tipo: 'cxc',       texto: 'Factura F-8702 vencida 64 días' },
  ],
}
