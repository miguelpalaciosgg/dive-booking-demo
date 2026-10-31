// i18n.js — La demo en inglés y en español, sin librerías: un diccionario por idioma y t(clave, datos).
// Idioma: ?lang=es|en en la URL manda; si no, el último elegido (localStorage, con try/catch porque puede
// no existir); si no, inglés. Al cambiarlo se actualizan <html lang>, el título y la descripción.
// Los textos pueden ser cadenas con {marcadores} o funciones (para plurales).
import { ref, watch } from 'vue'

const CLAVE = 'dive-booking-demo-idioma'
const VALIDO = (x) => (x === 'es' || x === 'en' ? x : null)

function inicial() {
  try { const q = VALIDO(new URLSearchParams(location.search).get('lang')); if (q) return q } catch { /* sin location */ }
  try { const g = VALIDO(localStorage.getItem(CLAVE)); if (g) return g } catch { /* sin almacenamiento */ }
  return 'en'
}

export const idioma = ref(inicial())
export const locale = () => (idioma.value === 'es' ? 'es-ES' : 'en-GB')
export function cambiarIdioma(l) {
  if (!VALIDO(l)) return
  idioma.value = l
  try { localStorage.setItem(CLAVE, l) } catch { /* sin almacenamiento */ }
  // si la URL lleva ?lang=, se actualiza para que recargar no devuelva al idioma anterior
  try {
    const u = new URL(location.href)
    if (u.searchParams.has('lang')) { u.searchParams.set('lang', l); history.replaceState(null, '', u) }
  } catch { /* sin history (iframe, file://) */ }
}

const pl = (uno, varios) => ({ n }) => `${n} ${n === 1 ? uno : varios}`

const TEXTOS = {
  en: {
    'doc.titulo': 'Dive booking demo',
    'doc.descripcion': 'Dive centre booking demo: book as a customer on your phone and watch the booking appear in the centre’s schedule. Made-up data, no charges.',
    // datos de ejemplo
    'centro.nombre': 'Demo Dive Centre',
    'barco.delfin': 'Dolphin', 'barco.mero': 'Barracuda', 'barco.piscina': 'Pool',
    'tipo.barco': 'Boat', 'tipo.tierra': 'Shore',
    'act.BAU.sigla': 'TRY', 'act.BAU.nombre': 'Try Dive', 'act.BAU.texto': 'Your first dive, with an instructor just for you. No experience needed.',
    'act.INM.sigla': 'GD', 'act.INM.nombre': 'Guided Dive', 'act.INM.texto': 'For certified divers. Marine reserves and local wrecks.',
    'act.SNK.sigla': 'SNK', 'act.SNK.nombre': 'Boat Snorkelling', 'act.SNK.texto': 'Boat trip to coves with crystal-clear water. Mask and snorkel included.',
    'act.OW.sigla': 'OW', 'act.OW.nombre': 'Open Water Course (pool)', 'act.OW.texto': 'Hands-on pool session for the first diving level, with an instructor.',
    'mat.traje': '5 mm wetsuit', 'mat.ordenador': 'Dive computer', 'mat.camara': 'Underwater camera',
    'extra.fotos': 'Photo and video package', 'extra.seguro': 'One-day dive insurance',
    'metodo.efectivo': 'Cash', 'metodo.datafono': 'Card terminal', 'metodo.tarjeta': 'Card', 'metodo.bizum': 'Bizum', 'metodo.transferencia': 'Bank transfer',
    'origen.web': 'Online', 'origen.mostrador': 'Front desk',
    'cupon.ejemplo': 'SUMMER10',
    // almacen
    'linea.alquiler': ({ nombre, talla, n }) => `${nombre} rental${talla ? ' (' + talla + ')' : ''} × ${n}`,
    'linea.codigo': 'Code {codigo}',
    'error.sinPlazas': 'Sorry, there are no longer enough places left on that slot.',
    'error.noCaben': ({ n, barco, hora }) => `There isn’t room for ${n === 1 ? '1 more person' : n + ' more people'} on ${barco} at ${hora}.`,
    // comunes
    personas: pl('person', 'people'),
    hora: '{h}',
    // App
    'app.lema': 'Bookings and management for dive and watersports centres',
    'app.reiniciar': 'Reset demo', 'app.reiniciarCorto': 'Reset',
    'app.reiniciarConfirmar': 'Go back to the sample data? The bookings you have made will be deleted.',
    'app.aviso': 'Demo with made-up data that runs entirely in your browser: nothing is charged, no emails are sent and whatever you do is only saved on this device.',
    'app.pestanaReservar': '1 · Book (customer)', 'app.pestanaAgenda': '2 · Schedule (centre)',
    'app.ariaWidget': 'Customer booking widget', 'app.veCliente': 'What the customer sees',
    'app.ariaAgenda': 'Centre schedule', 'app.veCentro': 'What the centre sees',
    'app.pie': 'This demo is open source (MIT); the product code is private.',
    'app.idioma': 'Language', 'app.marca': 'Dive booking demo',
    // Widget
    'w.volver': 'Back', 'w.reservaOnline': 'Online booking', 'w.pasos': 'Booking steps',
    'w.paso.actividad': 'Activity', 'w.paso.fecha': 'Date & time', 'w.paso.personas': 'People', 'w.paso.datos': 'Your details', 'w.paso.pago': 'Payment',
    'w.queHacer': 'What would you like to do?',
    'w.mesAnterior': 'Previous month', 'w.mesSiguiente': 'Next month',
    'w.diasSemana': ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    'w.lleno': 'full',
    'w.completo': 'Full',
    'w.quedan': ({ n }) => (n === 1 ? 'Only 1 place left' : `${n} places left`),
    'w.sinTurnos': 'No slots left on that day.',
    'w.continuar': 'Continue', 'w.continuarTotal': 'Continue · {total}',
    'w.personas': 'People',
    'w.porPersona': '{precio} per person · {n} left',
    'w.menosPersona': 'One person fewer', 'w.masPersona': 'One more person',
    'w.alquila': 'Rent your gear', 'w.porUnidad': '/ item',
    'w.quitar': 'Remove {nombre} {talla}', 'w.anadir': 'Add {nombre} {talla}',
    'w.extras': 'Extras', 'w.barraPersona': ' / person',
    'w.nombre': 'Full name', 'w.nombrePh': 'As on your ID',
    'w.email': 'Email', 'w.emailPh': 'We’ll send your confirmation here',
    'w.telefono': 'Phone (optional)',
    'w.cupon': 'Discount code', 'w.cuponPh': 'Try {codigo}', 'w.aplicar': 'Apply',
    'w.cuponOk': 'Code applied: {valor} off.',
    'w.cuponMal': 'That code doesn’t exist or has expired. In the demo, {codigo} and DEMO5 work.',
    'w.total': 'Total', 'w.irPago': 'Go to payment',
    'w.faltanDatos': 'Enter your name and a valid email to continue.',
    'w.pagoSimulado': 'Simulated payment · this is a demo',
    'w.pagoTexto': 'Nothing is charged and no card details are asked for. In the real product, this is where the centre’s bank payment page (Redsys) opens for card or Bizum, and the booking is confirmed when the bank notifies it.',
    'w.importe': 'Amount', 'w.simulando': 'Simulating payment…',
    'w.pagarTarjeta': '💳 Simulate card payment', 'w.pagarBizum': '📱 Simulate Bizum payment', 'w.pagarCentro': 'Pay at the centre on the day',
    'w.confirmada': 'Booking confirmed!',
    'w.pagada': 'Paid by {metodo} (simulated)', 'w.pendiente': 'To be paid at the centre',
    'w.numero': 'Booking ref.',
    'w.emailAviso': 'In the real product the customer receives an email with a QR code and the online check-in link. Nothing is sent in the demo.',
    'w.verAgenda': 'See the booking in the centre’s schedule →', 'w.otra': 'Make another booking',
    'w.pie': 'Booking demo with made-up data',
    // Agenda
    'a.titulo': 'Schedule', 'a.diaAnterior': 'Previous day', 'a.dia': 'Day', 'a.diaSiguiente': 'Next day', 'a.hoy': 'Today',
    'a.salidas': ({ n }) => (n === 1 ? 'trip with guests' : 'trips with guests'),
    'a.personas': ({ n }) => (n === 1 ? 'person' : 'people'),
    'a.sinCheckin': 'not checked in', 'a.porCobrar': 'unpaid',
    'a.leyendaPago': 'unpaid', 'a.leyendaCheckin': 'checked in',
    'a.arrastra': 'Drag a customer to another boat or time (only allowed if they fit). ',
    'a.pincha': 'Click a name to open the booking.',
    'a.hora': 'Time', 'a.plazas': '{tipo}, {n} places',
    'a.sinSalida': 'no trip', 'a.lleno': 'full', 'a.libres': '{n} free',
    'a.nueva': 'new', 'a.sinPagar': 'Unpaid', 'a.checkinHecho': 'Checked in', 'a.vacia': 'no one yet',
    'a.movida': '{nombre} moved to {barco} at {hora}.',
    // Ficha
    'f.reserva': 'Booking {numero}', 'f.cerrar': 'Close',
    'f.cancelada': 'Cancelled', 'f.confirmada': 'Confirmed',
    'f.pagada': 'Paid · {metodo}', 'f.pendiente': 'Payment due',
    'f.checkinHecho': 'Checked in', 'f.sinCheckin': 'Not checked in',
    'f.dia': 'Day', 'f.salida': 'Trip', 'f.email': 'Email', 'f.telefono': 'Phone', 'f.material': 'Gear', 'f.extras': 'Extras', 'f.descuento': 'Discount', 'f.total': 'Total',
    'f.pagado': '· paid {importe}',
    'f.checkin': 'Check-in', 'f.checkinTexto': 'In the real product the customer fills it in beforehand on their phone: details, health and signature.',
    'f.deshacer': 'Undo', 'f.hacerCheckin': 'Check in',
    'f.cobrarMostrador': 'Take payment at the desk', 'f.formaPago': 'Payment method', 'f.cobrar': 'Charge', 'f.simulado': 'Simulated: no money changes hands.',
    'f.mover': 'Move to another boat or time', 'f.salidaDestino': 'Destination trip', 'f.elige': 'Choose a trip…', 'f.noCabe': 'doesn’t fit', 'f.libres': '{n} free', 'f.moverBoton': 'Move',
    'f.cancelar': 'Cancel booking', 'f.cancelarConfirmar': 'Cancel this booking? There is no refund to make in the demo.',
  },
  es: {
    'doc.titulo': 'Demo de reservas de buceo',
    'doc.descripcion': 'Demo de reservas para centros de buceo: reserva como cliente desde el móvil y mira cómo aparece en la agenda del centro. Datos inventados, sin cobros.',
    'centro.nombre': 'Centro de buceo Demo',
    'barco.delfin': 'Delfín', 'barco.mero': 'Barracuda', 'barco.piscina': 'Piscina',
    'tipo.barco': 'Barco', 'tipo.tierra': 'Tierra',
    'act.BAU.sigla': 'BAU', 'act.BAU.nombre': 'Bautismo de buceo', 'act.BAU.texto': 'Tu primera inmersión, con un instructor solo para ti. Sin experiencia previa.',
    'act.INM.sigla': 'INM', 'act.INM.nombre': 'Inmersión guiada', 'act.INM.texto': 'Para buceadores con titulación. Reservas marinas y pecios de la zona.',
    'act.SNK.sigla': 'SNK', 'act.SNK.nombre': 'Snorkel en barco', 'act.SNK.texto': 'Salida en barco a calas de aguas transparentes. Gafas y tubo incluidos.',
    'act.OW.sigla': 'OW', 'act.OW.nombre': 'Curso Open Water (piscina)', 'act.OW.texto': 'Sesión práctica del primer nivel de buceo en piscina con instructor.',
    'mat.traje': 'Traje de neopreno 5 mm', 'mat.ordenador': 'Ordenador de buceo', 'mat.camara': 'Cámara acuática',
    'extra.fotos': 'Reportaje de fotos y vídeo', 'extra.seguro': 'Seguro de buceo de un día',
    'metodo.efectivo': 'Efectivo', 'metodo.datafono': 'Datáfono', 'metodo.tarjeta': 'Tarjeta', 'metodo.bizum': 'Bizum', 'metodo.transferencia': 'Transferencia',
    'origen.web': 'Web', 'origen.mostrador': 'Mostrador',
    'cupon.ejemplo': 'VERANO10',
    'linea.alquiler': ({ nombre, talla, n }) => `Alquiler ${nombre}${talla ? ' (' + talla + ')' : ''} × ${n}`,
    'linea.codigo': 'Código {codigo}',
    'error.sinPlazas': 'Ya no quedan plazas suficientes en ese turno.',
    'error.noCaben': 'No caben {n} en {barco} a las {hora}.',
    personas: pl('persona', 'personas'),
    hora: '{h} h',
    'app.lema': 'Reservas y gestión para centros de buceo y náutica',
    'app.reiniciar': 'Reiniciar demo', 'app.reiniciarCorto': 'Reiniciar',
    'app.reiniciarConfirmar': '¿Volver a los datos de ejemplo? Se borran las reservas que has hecho.',
    'app.aviso': 'Demo con datos inventados que funciona entera en tu navegador: no se cobra nada, no se envían emails y lo que hagas solo se guarda en este dispositivo.',
    'app.pestanaReservar': '1 · Reservar (cliente)', 'app.pestanaAgenda': '2 · Agenda (centro)',
    'app.ariaWidget': 'Widget de reserva del cliente', 'app.veCliente': 'Lo que ve el cliente',
    'app.ariaAgenda': 'Agenda del centro', 'app.veCentro': 'Lo que ve el centro',
    'app.pie': 'Esta demo es de código abierto (MIT); el código del producto es privado.',
    'app.idioma': 'Idioma', 'app.marca': 'Demo de reservas de buceo',
    'w.volver': 'Volver', 'w.reservaOnline': 'Reserva online', 'w.pasos': 'Pasos de la reserva',
    'w.paso.actividad': 'Actividad', 'w.paso.fecha': 'Día y hora', 'w.paso.personas': 'Personas', 'w.paso.datos': 'Tus datos', 'w.paso.pago': 'Pago',
    'w.queHacer': '¿Qué te apetece hacer?',
    'w.mesAnterior': 'Mes anterior', 'w.mesSiguiente': 'Mes siguiente',
    'w.diasSemana': ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
    'w.lleno': 'lleno',
    'w.completo': 'Completo',
    'w.quedan': ({ n }) => (n === 1 ? 'Queda 1 plaza' : `Quedan ${n} plazas`),
    'w.sinTurnos': 'No quedan turnos ese día.',
    'w.continuar': 'Continuar', 'w.continuarTotal': 'Continuar · {total}',
    'w.personas': 'Personas',
    'w.porPersona': '{precio} por persona · quedan {n}',
    'w.menosPersona': 'Una persona menos', 'w.masPersona': 'Una persona más',
    'w.alquila': 'Alquila tu equipo', 'w.porUnidad': '/ ud.',
    'w.quitar': 'Quitar {nombre} {talla}', 'w.anadir': 'Añadir {nombre} {talla}',
    'w.extras': 'Extras', 'w.barraPersona': ' / persona',
    'w.nombre': 'Nombre y apellidos', 'w.nombrePh': 'Como en tu documento',
    'w.email': 'Email', 'w.emailPh': 'Para enviarte la confirmación',
    'w.telefono': 'Teléfono (opcional)',
    'w.cupon': 'Código de descuento', 'w.cuponPh': 'Prueba {codigo}', 'w.aplicar': 'Aplicar',
    'w.cuponOk': 'Código aplicado: {valor} de descuento.',
    'w.cuponMal': 'Ese código no existe o ha caducado. En la demo funcionan {codigo} y DEMO5.',
    'w.total': 'Total', 'w.irPago': 'Ir al pago',
    'w.faltanDatos': 'Pon tu nombre y un email válido para seguir.',
    'w.pagoSimulado': 'Pago simulado · esto es una demo',
    'w.pagoTexto': 'No se cobra nada ni se piden datos de tarjeta. En el producto real, aquí se abre el TPV del banco del centro (Redsys) para pagar con tarjeta o Bizum, y la reserva se confirma cuando el banco avisa.',
    'w.importe': 'Importe', 'w.simulando': 'Simulando el pago…',
    'w.pagarTarjeta': '💳 Simular pago con tarjeta', 'w.pagarBizum': '📱 Simular pago con Bizum', 'w.pagarCentro': 'Pagar en el centro el día de la actividad',
    'w.confirmada': '¡Reserva confirmada!',
    'w.pagada': 'Pagada con {metodo} (simulado)', 'w.pendiente': 'Pendiente de pago en el centro',
    'w.numero': 'Nº de reserva',
    'w.emailAviso': 'En el producto real le llega un email con el QR y el enlace al check-in online. En la demo no se envía nada.',
    'w.verAgenda': 'Ver la reserva en la agenda del centro →', 'w.otra': 'Hacer otra reserva',
    'w.pie': 'Demo de reservas con datos inventados',
    'a.titulo': 'Agenda', 'a.diaAnterior': 'Día anterior', 'a.dia': 'Día', 'a.diaSiguiente': 'Día siguiente', 'a.hoy': 'Hoy',
    'a.salidas': ({ n }) => (n === 1 ? 'salida con gente' : 'salidas con gente'),
    'a.personas': ({ n }) => (n === 1 ? 'persona' : 'personas'),
    'a.sinCheckin': 'sin check-in', 'a.porCobrar': 'por cobrar',
    'a.leyendaPago': 'sin pagar', 'a.leyendaCheckin': 'check-in hecho',
    'a.arrastra': 'Arrastra a un cliente a otro barco u otra hora (solo se deja si caben). ',
    'a.pincha': 'Pincha un nombre para abrir su ficha.',
    'a.hora': 'Hora', 'a.plazas': '{tipo}, {n} plazas',
    'a.sinSalida': 'sin salida', 'a.lleno': 'lleno', 'a.libres': '{n} libres',
    'a.nueva': 'nueva', 'a.sinPagar': 'Sin pagar', 'a.checkinHecho': 'Check-in hecho', 'a.vacia': 'libre',
    'a.movida': '{nombre} pasa a {barco} a las {hora}.',
    'f.reserva': 'Reserva {numero}', 'f.cerrar': 'Cerrar',
    'f.cancelada': 'Cancelada', 'f.confirmada': 'Confirmada',
    'f.pagada': 'Pagada · {metodo}', 'f.pendiente': 'Pendiente de pago',
    'f.checkinHecho': 'Check-in hecho', 'f.sinCheckin': 'Sin check-in',
    'f.dia': 'Día', 'f.salida': 'Salida', 'f.email': 'Email', 'f.telefono': 'Teléfono', 'f.material': 'Material', 'f.extras': 'Extras', 'f.descuento': 'Descuento', 'f.total': 'Total',
    'f.pagado': '· pagado {importe}',
    'f.checkin': 'Check-in', 'f.checkinTexto': 'En el producto real el cliente lo rellena antes desde el móvil: datos, salud y firma.',
    'f.deshacer': 'Deshacer', 'f.hacerCheckin': 'Hacer check-in',
    'f.cobrarMostrador': 'Cobrar en mostrador', 'f.formaPago': 'Forma de pago', 'f.cobrar': 'Cobrar', 'f.simulado': 'Simulado: no se mueve dinero.',
    'f.mover': 'Mover a otro barco u hora', 'f.salidaDestino': 'Salida de destino', 'f.elige': 'Elige salida…', 'f.noCabe': 'no cabe', 'f.libres': '{n} libres', 'f.moverBoton': 'Mover',
    'f.cancelar': 'Cancelar la reserva', 'f.cancelarConfirmar': '¿Cancelar esta reserva? En la demo no hay devolución que hacer.',
  },
}

// t('w.quedan', { n: 3 }) → «3 places left». Si falta en un idioma, se usa el inglés y si no, la clave.
export function t(clave, datos = {}) {
  const s = TEXTOS[idioma.value][clave] ?? TEXTOS.en[clave] ?? clave
  if (typeof s === 'function') return s(datos)
  if (typeof s !== 'string') return s
  return s.replace(/\{(\w+)\}/g, (_, k) => (datos[k] ?? ''))
}

// <html lang>, título y descripción siguen al idioma
watch(idioma, () => {
  try {
    document.documentElement.lang = idioma.value
    document.title = t('doc.titulo')
    document.querySelector('meta[name="description"]')?.setAttribute('content', t('doc.descripcion'))
  } catch { /* sin document */ }
}, { immediate: true })
