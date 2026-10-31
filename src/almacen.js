// almacen.js — Los «datos del servidor» de la demo, en memoria y con copia en localStorage.
// En el producto real esto lo hace la API (Express + PostgreSQL); aquí todo vive en el navegador para poder
// publicarlo en GitHub Pages. Centro, barcos, actividades y clientes son inventados.
// localStorage puede no existir (modo privado, almacenamiento bloqueado): por eso todo va con try/catch
// y la demo funciona igual sin él, solo que vuelve a empezar al recargar.
// Bilingüe: las reservas guardan claves (código de actividad, id de barco, método…) y los nombres salen
// del diccionario de i18n.js con getters, así que cambiar de idioma con reservas hechas no rompe nada.
import { reactive, watch } from 'vue'
import { t, locale } from './i18n.js'

export const CENTRO = { get nombre() { return t('centro.nombre') } }

// Barcos y piscina con su aforo. Las actividades comparten el aforo del recurso donde salen.
const recurso = (id, plazas, tipo) => ({ id, plazas, get nombre() { return t('barco.' + id) }, get tipo() { return t('tipo.' + tipo) } })
export const BARCOS = [recurso('delfin', 12, 'barco'), recurso('mero', 8, 'barco'), recurso('piscina', 6, 'tierra')]

// codigo es la clave interna (la guardan las reservas); sigla es lo que se ve en la agenda según el idioma
const act = (codigo, datos) => ({
  codigo, ...datos,
  get sigla() { return t(`act.${codigo}.sigla`) },
  get nombre() { return t(`act.${codigo}.nombre`) },
  get texto() { return t(`act.${codigo}.texto`) },
})
export const ACTIVIDADES = [
  act('BAU', { precio: 69, duracion: '3 h', recurso: 'delfin', horas: ['09:30', '12:30'], color: '#0b84d8', icono: '🤿' }),
  act('INM', { precio: 45, duracion: '2 h 30 min', recurso: 'mero', horas: ['09:00', '12:00', '16:00'], color: '#0d9488', icono: '🐠' }),
  act('SNK', { precio: 30, duracion: '2 h', recurso: 'delfin', horas: ['12:30', '16:30'], color: '#d97706', icono: '🐢' }),
  act('OW', { precio: 120, duracion: '4 h', recurso: 'piscina', horas: ['10:00', '16:00'], color: '#7c3aed', icono: '🎓' }),
]

// Alquiler de material por unidad (con tallas) y extras de la reserva
const mat = (id, precio, tallas) => ({ id, precio, tallas, get nombre() { return t('mat.' + id) } })
export const MATERIAL = [mat('traje', 8, ['XS', 'S', 'M', 'L', 'XL']), mat('ordenador', 10, []), mat('camara', 15, [])]
const extra = (id, precio, porPersona) => ({ id, precio, porPersona, get nombre() { return t('extra.' + id) } })
export const EXTRAS = [extra('fotos', 25, false), extra('seguro', 6, true)]
// SUMMER10 y VERANO10 son el mismo descuento (cada idioma enseña el suyo); DEMO5 vale en los dos
export const DESCUENTOS = { SUMMER10: { tipo: '%', valor: 10 }, VERANO10: { tipo: '%', valor: 10 }, DEMO5: { tipo: '€', valor: 5 } }
// Métodos de cobro en mostrador (claves; el texto sale con metodoTexto)
export const METODOS = ['efectivo', 'datafono', 'bizum', 'transferencia']
export const metodoTexto = (m) => (m ? t('metodo.' + m) : '')

// ---------- fechas en hora local ----------
const dos = (n) => String(n).padStart(2, '0')
export const iso = (d = new Date()) => `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`
export const sumarDias = (f, n) => { const d = new Date(f + 'T12:00:00'); d.setDate(d.getDate() + n); return iso(d) }
export const fechaLarga = (f) => new Date(f + 'T12:00:00').toLocaleDateString(locale(), { weekday: 'long', day: 'numeric', month: 'long' })
export const mayus = (s) => s.charAt(0).toUpperCase() + s.slice(1)
export const euros = (n) => (Math.round(n * 100) / 100).toLocaleString(locale(), { style: 'currency', currency: 'EUR' })
export const ahoraHora = () => { const d = new Date(); return `${dos(d.getHours())}:${dos(d.getMinutes())}` }
export const DIAS_RESERVA = 60

export const actividad = (codigo) => ACTIVIDADES.find((a) => a.codigo === codigo)
export const barco = (id) => BARCOS.find((b) => b.id === id)

// ---------- datos de ejemplo (deterministas por día para que la agenda no salga vacía) ----------
const NOMBRES = ['Emma Clarke', 'Lucas Martin', 'Sofia Rossi', 'Jonas Becker', 'Mia Jansen', 'Noah Fischer', 'Olivia Hughes', 'Mateo Silva',
  'Freya Larsen', 'Kenji Tanaka', 'Ava Thompson', 'Lena Novak', 'Daniel Kowalski', 'Isla Murray', 'Pablo Ortega', 'Elena Vidal', 'Tom Walker', 'Nina Petrova']
function azar(semilla) { let s = semilla; return () => (s = (s * 9301 + 49297) % 233280) / 233280 }

function sembrar() {
  const hoy = iso(), lista = []
  let n = 0
  for (let d = -1; d <= 6; d++) {
    const fecha = sumarDias(hoy, d), r = azar(Number(fecha.replaceAll('-', '')) % 100000)
    for (const a of ACTIVIDADES) for (const hora of a.horas) {
      const cuantas = Math.floor(r() * 3)
      for (let i = 0; i < cuantas; i++) {
        const pax = 1 + Math.floor(r() * 3)
        if (ocupadasEn(lista, fecha, hora, a.recurso) + pax > barco(a.recurso).plazas) continue
        const pagado = r() > 0.25
        n++
        lista.push({ id: 'r' + n, numero: String(204100 + n * 37), codigo: a.codigo, fecha, hora, recursoId: a.recurso, nombre: NOMBRES[Math.floor(r() * NOMBRES.length)],
          email: '', telefono: '', pax, material: [], extras: [], descuento: null, monto: a.precio * pax, pagado: pagado ? a.precio * pax : 0,
          metodo: pagado ? (r() > 0.5 ? 'tarjeta' : 'bizum') : null, estado: 'confirmada', checkin: d < 0 || (d === 0 && r() > 0.5), origen: r() > 0.4 ? 'web' : 'mostrador' })
      }
    }
  }
  return lista
}

// ---------- estado y persistencia ----------
// Clave nueva: la versión bilingüe guarda claves en vez de textos y no debe leer reservas de la anterior
const CLAVE = 'dive-booking-demo-v2'
function leer() {
  try {
    const g = JSON.parse(localStorage.getItem(CLAVE) || 'null')
    if (g?.version === 2 && Array.isArray(g.reservas)) return g
  } catch { /* sin almacenamiento */ }
  return null
}
const guardado = leer()
export const estado = reactive({
  reservas: guardado?.reservas || sembrar(),
  // de la interfaz (no se guarda)
  diaAgenda: iso(),
  ultima: null,
})
watch(() => estado.reservas, (reservas) => {
  try { localStorage.setItem(CLAVE, JSON.stringify({ version: 2, reservas })) } catch { /* sin almacenamiento */ }
}, { deep: true })

export function reiniciar() {
  estado.reservas = sembrar(); estado.ultima = null; estado.diaAgenda = iso()
  try { localStorage.removeItem(CLAVE) } catch { /* sin almacenamiento */ }
}

// ---------- aforo ----------
// function (no const) porque sembrar() la usa al cargar el módulo, antes de llegar aquí
function vivas(lista) { return lista.filter((r) => r.estado !== 'cancelada') }
function ocupadasEn(lista, fecha, hora, recursoId, excepto) {
  return vivas(lista).filter((r) => r.fecha === fecha && r.hora === hora && r.recursoId === recursoId && r.id !== excepto).reduce((s, r) => s + r.pax, 0)
}
export const ocupadas = (fecha, hora, recursoId, excepto) => ocupadasEn(estado.reservas, fecha, hora, recursoId, excepto)
export const libres = (fecha, hora, recursoId, excepto) => barco(recursoId).plazas - ocupadas(fecha, hora, recursoId, excepto)

// Turnos de una actividad en un día (sin los que ya han pasado hoy)
export function turnos(codigo, fecha) {
  const a = actividad(codigo), hoy = iso()
  if (fecha < hoy || fecha > sumarDias(hoy, DIAS_RESERVA)) return []
  return a.horas.filter((h) => fecha > hoy || h > ahoraHora()).map((hora) => ({ hora, libres: libres(fecha, hora, a.recurso) }))
}

// Salidas del día: cada barco a cada hora en que sale alguna actividad suya (o hay alguien movido allí)
export function salidasDelDia(fecha) {
  const horas = new Set()
  for (const a of ACTIVIDADES) a.horas.forEach((h) => horas.add(h))
  const delDia = vivas(estado.reservas).filter((r) => r.fecha === fecha)
  delDia.forEach((r) => horas.add(r.hora))
  return [...horas].sort().map((hora) => ({
    hora,
    salidas: BARCOS.map((b) => {
      const clientes = delDia.filter((r) => r.hora === hora && r.recursoId === b.id)
      const programada = ACTIVIDADES.some((a) => a.recurso === b.id && a.horas.includes(hora))
      const ocup = clientes.reduce((s, r) => s + r.pax, 0)
      return { clave: `${hora}|${b.id}`, hora, recursoId: b.id, barco: b, programada: programada || clientes.length > 0, clientes, ocupadas: ocup, capacidad: b.plazas, libres: b.plazas - ocup }
    }),
  }))
}

// ---------- precios ----------
export function calcular({ codigo, pax, material = [], extras = [], cupon = null }) {
  const a = actividad(codigo), lineas = [{ texto: `${a.nombre} × ${pax}`, importe: a.precio * pax }]
  for (const m of material) {
    const def = MATERIAL.find((x) => x.id === m.id)
    if (m.cantidad) lineas.push({ texto: t('linea.alquiler', { nombre: def.nombre, talla: m.talla, n: m.cantidad }), importe: def.precio * m.cantidad })
  }
  for (const id of extras) { const e = EXTRAS.find((x) => x.id === id); lineas.push({ texto: e.nombre + (e.porPersona ? ` × ${pax}` : ''), importe: e.precio * (e.porPersona ? pax : 1) }) }
  const bruto = lineas.reduce((s, l) => s + l.importe, 0)
  let descuento = 0
  if (cupon && DESCUENTOS[cupon]) { const d = DESCUENTOS[cupon]; descuento = Math.min(bruto, d.tipo === '%' ? Math.round(bruto * d.valor) / 100 : d.valor) }
  if (descuento) lineas.push({ texto: t('linea.codigo', { codigo: cupon }), importe: -descuento })
  return { lineas, bruto, descuento, total: Math.round((bruto - descuento) * 100) / 100 }
}

// ---------- operaciones (lo que en el producto real son rutas de la API) ----------
function nuevoNumero() {
  const usados = new Set(estado.reservas.map((r) => r.numero))
  let n
  do { n = String(Math.floor(100000 + Math.random() * 900000)) } while (usados.has(n))
  return n
}

export function crearReserva(datos) {
  const a = actividad(datos.codigo)
  if (libres(datos.fecha, datos.hora, a.recurso) < datos.pax) throw new Error(t('error.sinPlazas'))
  const precio = calcular(datos)
  const r = {
    id: 'w' + Date.now().toString(36), numero: nuevoNumero(), codigo: a.codigo, fecha: datos.fecha, hora: datos.hora, recursoId: a.recurso,
    nombre: datos.nombre.trim(), email: datos.email.trim(), telefono: (datos.telefono || '').trim(), pax: datos.pax,
    material: datos.material.filter((m) => m.cantidad).map((m) => ({ ...m })), extras: [...datos.extras],
    descuento: precio.descuento ? { codigo: datos.cupon, importe: precio.descuento } : null,
    monto: precio.total, pagado: datos.metodo ? precio.total : 0, metodo: datos.metodo || null, estado: 'confirmada', checkin: false, origen: 'web',
  }
  estado.reservas.push(r)
  estado.ultima = r.id
  return r
}

export function mover(id, { fecha, hora, recursoId }) {
  const r = estado.reservas.find((x) => x.id === id)
  if (!r) return
  if (libres(fecha, hora, recursoId, id) < r.pax) throw new Error(t('error.noCaben', { n: r.pax, barco: barco(recursoId).nombre, hora }))
  Object.assign(r, { fecha, hora, recursoId })
}
const buscar = (id) => estado.reservas.find((x) => x.id === id)
export function cobrar(id, metodo) { const r = buscar(id); if (r) { r.pagado = r.monto; r.metodo = metodo } }
export function alternarCheckin(id) { const r = buscar(id); if (r) r.checkin = !r.checkin }
export function cancelar(id) { const r = buscar(id); if (r) r.estado = 'cancelada' }
