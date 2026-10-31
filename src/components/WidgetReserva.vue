<!-- WidgetReserva.vue — El widget de reserva tal como lo ve el cliente en el móvil: actividad → día y turno →
     personas y material → datos, código de descuento y pago. El pago es una pantalla simulada (no hay pasarela):
     en el producto real aquí se abre el TPV del banco del centro (Redsys) con tarjeta o Bizum. -->
<template>
  <div class="min-h-full bg-white text-slate-800 flex flex-col">
    <header class="px-4 py-3 flex items-center gap-3 border-b border-slate-100 lg:sticky lg:top-0 bg-white/95 backdrop-blur z-10">
      <button v-if="atras" @click="atras()" class="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-xl text-navy-900 hover:bg-slate-100" :aria-label="t('w.volver')">‹</button>
      <div class="w-9 h-9 rounded-full bg-[#0b84d8] text-white flex items-center justify-center text-lg shrink-0" aria-hidden="true">🌊</div>
      <div class="min-w-0 flex-1">
        <p class="font-extrabold text-navy-900 leading-tight truncate">{{ act ? act.nombre : CENTRO.nombre }}</p>
        <p class="text-[11px] text-slate-500 truncate">{{ act ? `${CENTRO.nombre} · ${act.duracion}` : t('w.reservaOnline') }}</p>
      </div>
    </header>

    <main class="px-4 py-4 flex-1">
      <!-- Pasos -->
      <ol v-if="indice >= 0" class="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider mb-4" :aria-label="t('w.pasos')">
        <li v-for="(p, i) in PASOS" :key="p" class="flex items-center gap-1" :class="i <= indice ? 'text-navy-900' : 'text-slate-300'">
          <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px]" :class="i <= indice ? 'bg-[#0b84d8] text-white' : 'bg-slate-100'">{{ i < indice ? '✓' : i + 1 }}</span>
          <span :class="i === indice ? '' : 'hidden'">{{ t('w.paso.' + p) }}</span>
          <span v-if="i < PASOS.length - 1" class="w-3 h-px bg-slate-200 mx-0.5"></span>
        </li>
      </ol>

      <!-- 1. Actividad -->
      <section v-if="paso === 'actividad'" class="rise space-y-3">
        <h2 class="text-xl font-extrabold text-navy-900">{{ t('w.queHacer') }}</h2>
        <button v-for="a in ACTIVIDADES" :key="a.codigo" @click="elegir(a)" class="w-full text-left card p-3 flex gap-3 hover:border-[#0b84d8] active:scale-[.99] transition">
          <span class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" :style="{ background: a.color + '1a' }">{{ a.icono }}</span>
          <span class="min-w-0 flex-1">
            <span class="flex items-baseline justify-between gap-2"><b class="text-navy-900">{{ a.nombre }}</b><b class="cifra text-sm shrink-0">{{ euros(a.precio) }}</b></span>
            <span class="block text-xs text-slate-500 mt-0.5">{{ a.texto }}</span>
            <span class="block text-[11px] text-slate-400 mt-1">{{ a.duracion }} · {{ a.horas.join(' · ') }}</span>
          </span>
        </button>
      </section>

      <!-- 2. Día y turno -->
      <section v-else-if="paso === 'fecha'" class="rise">
        <div class="flex items-center justify-between mb-2">
          <button @click="cambiarMes(-1)" :disabled="mes <= mesHoy" class="paso" :aria-label="t('w.mesAnterior')">‹</button>
          <p class="font-extrabold text-navy-900">{{ nombreMes }}</p>
          <button @click="cambiarMes(1)" :disabled="mes >= mesMax" class="paso" :aria-label="t('w.mesSiguiente')">›</button>
        </div>
        <div class="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 mb-1"><span v-for="(d, i) in t('w.diasSemana')" :key="i">{{ d }}</span></div>
        <div class="grid grid-cols-7 gap-1">
          <span v-for="n in huecoInicial" :key="'h' + n"></span>
          <button v-for="d in diasMes" :key="d.fecha" :data-fecha="d.fecha" :disabled="!d.abierto" @click="fecha = d.fecha; hora = null"
            class="aspect-square rounded-xl text-sm font-bold flex flex-col items-center justify-center transition"
            :class="fecha === d.fecha ? 'bg-[#0b84d8] text-white' : d.abierto ? 'bg-slate-50 text-navy-900 hover:bg-ocean-50' : 'text-slate-300'">
            {{ d.dia }}<span v-if="d.completo" class="text-[8px] font-semibold leading-none">{{ t('w.lleno') }}</span>
          </button>
        </div>
        <div v-if="fecha" class="mt-5">
          <p class="lbl">{{ mayus(fechaLarga(fecha)) }}</p>
          <div class="grid grid-cols-2 gap-2">
            <button v-for="s in turnosDia" :key="s.hora" :disabled="s.libres <= 0" @click="hora = s.hora"
              class="rounded-xl border-2 px-3 py-2.5 text-left transition" :class="hora === s.hora ? 'border-[#0b84d8] bg-ocean-50' : 'border-slate-200 hover:border-slate-300'">
              <b class="block text-lg text-navy-900 font-mono">{{ s.hora }}</b>
              <span class="text-xs" :class="s.libres <= 0 ? 'text-rose-600' : s.libres <= 3 ? 'text-amber-600 font-semibold' : 'text-slate-500'">{{ s.libres <= 0 ? t('w.completo') : t('w.quedan', { n: s.libres }) }}</span>
            </button>
          </div>
          <p v-if="!turnosDia.length" class="text-sm text-slate-500">{{ t('w.sinTurnos') }}</p>
        </div>
        <button class="btn-marca w-full !py-3 mt-6" :disabled="!hora" @click="paso = 'personas'">{{ t('w.continuar') }}</button>
      </section>

      <!-- 3. Personas, material y extras -->
      <section v-else-if="paso === 'personas'" class="rise space-y-5">
        <div>
          <p class="lbl">{{ t('w.personas') }}</p>
          <div class="card p-3 flex items-center justify-between">
            <span><b class="text-navy-900">{{ t('personas', { n: pax }) }}</b><span class="block text-xs text-slate-500">{{ t('w.porPersona', { precio: euros(act.precio), n: libresTurno }) }}</span></span>
            <span class="flex items-center gap-2"><button class="paso" :disabled="pax <= 1" @click="cambiarPax(-1)" :aria-label="t('w.menosPersona')">−</button><b class="cifra w-6 text-center">{{ pax }}</b><button class="paso" :disabled="pax >= Math.min(libresTurno, 10)" @click="cambiarPax(1)" :aria-label="t('w.masPersona')">+</button></span>
          </div>
        </div>
        <div>
          <p class="lbl">{{ t('w.alquila') }}</p>
          <div class="space-y-2">
            <div v-for="m in MATERIAL" :key="m.id" class="card p-3">
              <div class="flex items-baseline justify-between gap-2"><b class="text-sm text-navy-900">{{ m.nombre }}</b><span class="text-xs text-slate-500 shrink-0">{{ euros(m.precio) }} {{ t('w.porUnidad') }}</span></div>
              <div class="flex flex-wrap gap-2 mt-2">
                <div v-for="f in filasDe(m.id)" :key="f.talla || 'u'" class="flex items-center gap-1.5 rounded-lg bg-slate-50 pl-2 pr-1 py-1">
                  <span v-if="f.talla" class="text-xs font-bold text-slate-600 w-6">{{ f.talla }}</span>
                  <button class="paso !w-7 !h-7 !text-base" :disabled="!f.cantidad" @click="f.cantidad--" :aria-label="t('w.quitar', { nombre: m.nombre, talla: f.talla })">−</button>
                  <b class="cifra text-sm w-4 text-center">{{ f.cantidad }}</b>
                  <button class="paso !w-7 !h-7 !text-base" :disabled="totalDe(m.id) >= pax" @click="f.cantidad++" :aria-label="t('w.anadir', { nombre: m.nombre, talla: f.talla })">+</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <p class="lbl">{{ t('w.extras') }}</p>
          <label v-for="e in EXTRAS" :key="e.id" class="card p-3 flex items-center gap-3 mb-2 cursor-pointer">
            <input type="checkbox" :value="e.id" v-model="extras" class="w-5 h-5 accent-[#0b84d8]" />
            <span class="flex-1 text-sm font-semibold text-navy-900">{{ e.nombre }}</span>
            <span class="text-xs text-slate-500">{{ euros(e.precio) }}{{ e.porPersona ? t('w.barraPersona') : '' }}</span>
          </label>
        </div>
        <button class="btn-marca w-full !py-3" @click="paso = 'datos'">{{ t('w.continuarTotal', { total: euros(precio.total) }) }}</button>
      </section>

      <!-- 4. Datos y resumen -->
      <section v-else-if="paso === 'datos'" class="rise space-y-4">
        <div class="space-y-3">
          <div><label class="lbl" for="w-nombre">{{ t('w.nombre') }}</label><input id="w-nombre" v-model="nombre" class="inp" autocomplete="name" :placeholder="t('w.nombrePh')" /></div>
          <div><label class="lbl" for="w-email">{{ t('w.email') }}</label><input id="w-email" v-model="email" type="email" class="inp" autocomplete="email" :placeholder="t('w.emailPh')" /></div>
          <div><label class="lbl" for="w-tel">{{ t('w.telefono') }}</label><input id="w-tel" v-model="telefono" type="tel" class="inp" autocomplete="tel" /></div>
        </div>
        <div>
          <label class="lbl" for="w-cupon">{{ t('w.cupon') }}</label>
          <div class="flex gap-2">
            <input id="w-cupon" v-model="cuponTexto" class="inp uppercase" :placeholder="t('w.cuponPh', { codigo: t('cupon.ejemplo') })" @keyup.enter="aplicarCupon" />
            <button class="btn-soft shrink-0" @click="aplicarCupon">{{ t('w.aplicar') }}</button>
          </div>
          <p v-if="avisoCupon" class="text-xs mt-1" :class="cupon ? 'text-emerald-700' : 'text-rose-600'">{{ avisoCupon }}</p>
        </div>
        <div class="rounded-xl bg-slate-50 p-3 text-sm">
          <p class="font-bold text-navy-900">{{ act.nombre }}</p>
          <p class="text-slate-500 text-xs mb-2">{{ mayus(fechaLarga(fecha)) }} · {{ t('hora', { h: hora }) }}</p>
          <div v-for="(l, i) in precio.lineas" :key="i" class="flex justify-between gap-3 py-0.5" :class="l.importe < 0 ? 'text-emerald-700' : ''"><span>{{ l.texto }}</span><span class="font-mono tabular-nums shrink-0">{{ euros(l.importe) }}</span></div>
          <div class="flex justify-between border-t border-slate-200 mt-2 pt-2 font-extrabold text-navy-900"><span>{{ t('w.total') }}</span><span class="font-mono">{{ euros(precio.total) }}</span></div>
        </div>
        <p v-if="error" class="text-sm text-rose-600">{{ error }}</p>
        <button class="btn-marca w-full !py-3" :disabled="!datosOk" @click="paso = 'pago'">{{ t('w.irPago') }}</button>
        <p v-if="!datosOk" class="text-xs text-slate-400 text-center -mt-2">{{ t('w.faltanDatos') }}</p>
      </section>

      <!-- 5. Pago simulado -->
      <section v-else-if="paso === 'pago'" class="rise space-y-4">
        <div class="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-4 text-amber-900">
          <p class="font-extrabold">{{ t('w.pagoSimulado') }}</p>
          <p class="text-sm mt-1">{{ t('w.pagoTexto') }}</p>
        </div>
        <div class="text-center py-2"><p class="text-sm text-slate-500">{{ t('w.importe') }}</p><p class="text-4xl cifra">{{ euros(precio.total) }}</p></div>
        <div v-if="procesando" class="text-center py-6 text-slate-500"><span class="inline-block w-8 h-8 border-4 border-slate-200 border-t-[#0b84d8] rounded-full animate-spin"></span><p class="mt-2 text-sm">{{ t('w.simulando') }}</p></div>
        <template v-else>
          <button class="btn-marca w-full !py-3" @click="pagar('tarjeta')">{{ t('w.pagarTarjeta') }}</button>
          <button class="btn w-full !py-3 text-white bg-[#00a6a0] hover:bg-[#008f8a]" @click="pagar('bizum')">{{ t('w.pagarBizum') }}</button>
          <button class="btn-soft w-full !py-3" @click="pagar(null)">{{ t('w.pagarCentro') }}</button>
        </template>
        <p v-if="error" class="text-sm text-rose-600">{{ error }}</p>
      </section>

      <!-- Hecho -->
      <section v-else-if="paso === 'ok'" class="rise text-center py-4">
        <div class="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl bg-emerald-100 text-emerald-600">✓</div>
        <h2 class="text-xl font-extrabold text-navy-900 mt-4">{{ t('w.confirmada') }}</h2>
        <p class="text-slate-600 mt-2">{{ act.nombre }}<br />{{ mayus(fechaLarga(hecha.fecha)) }} · {{ t('hora', { h: hecha.hora }) }}</p>
        <p class="text-slate-500 text-sm mt-1">{{ hecha.nombre }} · {{ t('personas', { n: hecha.pax }) }} · {{ euros(hecha.monto) }}</p>
        <p class="mt-3"><span class="chip" :class="hecha.pagado ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'">{{ hecha.pagado ? t('w.pagada', { metodo: hecha.metodo === 'tarjeta' ? metodoTexto(hecha.metodo).toLowerCase() : metodoTexto(hecha.metodo) }) : t('w.pendiente') }}</span></p>
        <p class="text-xs text-slate-500 mt-3">{{ t('w.numero') }} <b class="font-mono text-slate-800">{{ hecha.numero }}</b></p>
        <p class="text-xs text-slate-400 mt-1">{{ t('w.emailAviso') }}</p>
        <div class="mt-6 flex flex-col gap-2">
          <button class="btn-primary !py-3" @click="$emit('ver-agenda', hecha)">{{ t('w.verAgenda') }}</button>
          <button class="btn-soft !py-3" @click="empezar">{{ t('w.otra') }}</button>
        </div>
      </section>
    </main>
    <p class="text-[10px] text-slate-400 text-center pb-3">{{ t('w.pie') }}</p>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { CENTRO, ACTIVIDADES, MATERIAL, EXTRAS, DESCUENTOS, turnos, libres, calcular, crearReserva, iso, sumarDias, fechaLarga, mayus, euros, metodoTexto, DIAS_RESERVA } from '../almacen.js'
import { t, idioma, locale } from '../i18n.js'

defineEmits(['ver-agenda'])
const PASOS = ['actividad', 'fecha', 'personas', 'datos', 'pago']

const paso = ref('actividad'), act = ref(null), fecha = ref(null), hora = ref(null), pax = ref(2)
const filas = reactive([]), extras = ref([])
const nombre = ref(''), email = ref(''), telefono = ref(''), cuponTexto = ref(''), cupon = ref(null), cuponMal = ref(false)
const error = ref(''), procesando = ref(false), hecha = ref(null)

const indice = computed(() => PASOS.indexOf(paso.value))
const atras = computed(() => {
  const i = indice.value
  return i > 0 && !procesando.value ? () => { paso.value = PASOS[i - 1]; error.value = '' } : null
})

function empezar() {
  paso.value = 'actividad'; act.value = null; fecha.value = null; hora.value = null; pax.value = 2; extras.value = []
  cuponTexto.value = ''; cupon.value = null; cuponMal.value = false; error.value = ''; hecha.value = null
  filas.splice(0, filas.length, ...MATERIAL.flatMap((m) => (m.tallas.length ? m.tallas : ['']).map((talla) => ({ id: m.id, talla, cantidad: 0 }))))
}
empezar()

function elegir(a) { act.value = a; fecha.value = null; hora.value = null; paso.value = 'fecha'; mes.value = mesHoy }

// ---------- calendario ----------
const hoy = iso(), mesHoy = hoy.slice(0, 7), mesMax = sumarDias(hoy, DIAS_RESERVA).slice(0, 7)
const mes = ref(mesHoy)
const nombreMes = computed(() => mayus(new Date(mes.value + '-15T12:00:00').toLocaleDateString(locale(), { month: 'long', year: 'numeric' })))
function cambiarMes(n) { const d = new Date(mes.value + '-15T12:00:00'); d.setMonth(d.getMonth() + n); mes.value = iso(d).slice(0, 7) }
const huecoInicial = computed(() => (new Date(mes.value + '-01T12:00:00').getDay() + 6) % 7)
const diasMes = computed(() => {
  const [a, m] = mes.value.split('-').map(Number), total = new Date(a, m, 0).getDate()
  return Array.from({ length: total }, (_, i) => {
    const f = `${mes.value}-${String(i + 1).padStart(2, '0')}`, ts = act.value ? turnos(act.value.codigo, f) : []
    return { fecha: f, dia: i + 1, abierto: ts.some((s) => s.libres > 0), completo: ts.length > 0 && ts.every((s) => s.libres <= 0) }
  })
})
const turnosDia = computed(() => (act.value && fecha.value ? turnos(act.value.codigo, fecha.value) : []))
const libresTurno = computed(() => (act.value && hora.value ? libres(fecha.value, hora.value, act.value.recurso) : 0))

// ---------- personas y material ----------
const filasDe = (id) => filas.filter((f) => f.id === id)
const totalDe = (id) => filasDe(id).reduce((s, f) => s + f.cantidad, 0)
function cambiarPax(n) {
  pax.value += n
  // si bajan las personas, no puede quedar más material que personas
  for (const m of MATERIAL) { let sobra = totalDe(m.id) - pax.value; for (const f of filasDe(m.id).reverse()) while (sobra > 0 && f.cantidad > 0) { f.cantidad--; sobra-- } }
}

// ---------- datos, descuento y pago ----------
const precio = computed(() => (act.value ? calcular({ codigo: act.value.codigo, pax: pax.value, material: filas, extras: extras.value, cupon: cupon.value }) : { lineas: [], total: 0 }))
function aplicarCupon() {
  const c = cuponTexto.value.trim().toUpperCase()
  cuponMal.value = false
  if (!c) { cupon.value = null; return }
  if (DESCUENTOS[c]) cupon.value = c
  else { cupon.value = null; cuponMal.value = true }
}
// el aviso se calcula (no se guarda como texto) para que cambie con el idioma
const avisoCupon = computed(() => {
  if (cuponMal.value) return t('w.cuponMal', { codigo: t('cupon.ejemplo') })
  if (!cupon.value) return ''
  const d = DESCUENTOS[cupon.value]
  return t('w.cuponOk', { valor: d.tipo === '%' ? d.valor + (idioma.value === 'es' ? ' %' : '%') : euros(d.valor) })
})
const datosOk = computed(() => nombre.value.trim().length >= 3 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()))

function pagar(metodo) {
  error.value = ''; procesando.value = true
  setTimeout(() => {
    try {
      hecha.value = crearReserva({ codigo: act.value.codigo, fecha: fecha.value, hora: hora.value, pax: pax.value, material: filas, extras: extras.value, cupon: cupon.value, nombre: nombre.value, email: email.value, telefono: telefono.value, metodo })
      paso.value = 'ok'
    } catch (e) { error.value = e.message }
    procesando.value = false
  }, 900)
}
</script>
