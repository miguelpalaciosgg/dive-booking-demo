<!-- AgendaDia.vue — La agenda del centro en vista Día, como la pizarra del muelle: una fila por hora y en cada una
     las salidas de cada barco con sus plazas ocupadas/libres y la lista de clientes. En el ordenador se arrastra
     una reserva a otro barco u otra hora si caben; en el móvil se mueve desde la ficha («Mover a…»). -->
<template>
  <div class="space-y-3">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p class="eyebrow">{{ CENTRO.nombre }}</p>
        <h1 class="text-2xl md:text-[28px] font-bold tracking-[-.02em] text-navy-900">{{ t('a.titulo') }}</h1>
      </div>
      <div class="flex items-center gap-1.5">
        <button @click="cambiarDia(-1)" class="btn-soft !px-3" :aria-label="t('a.diaAnterior')">‹</button>
        <input type="date" v-model="estado.diaAgenda" class="inp !w-auto !py-1.5" :aria-label="t('a.dia')" :lang="idioma" />
        <button @click="cambiarDia(1)" class="btn-soft !px-3" :aria-label="t('a.diaSiguiente')">›</button>
        <button @click="estado.diaAgenda = iso()" class="btn-ghost !px-2.5">{{ t('a.hoy') }}</button>
      </div>
    </div>

    <!-- Resumen del día (sin importes: en el producto real lo económico solo lo ve el admin en Cuentas) -->
    <div class="card px-4 py-3 flex flex-wrap items-center gap-x-5 gap-y-1.5">
      <p class="font-semibold text-navy-900 w-full sm:w-auto">{{ mayus(fechaLarga(estado.diaAgenda)) }}</p>
      <span class="text-sm"><b class="cifra">{{ resumen.salidas }}</b> <span class="text-slate-500">{{ t('a.salidas', { n: resumen.salidas }) }}</span></span>
      <span class="text-sm"><b class="cifra">{{ resumen.personas }}</b> <span class="text-slate-500">{{ t('a.personas', { n: resumen.personas }) }}</span></span>
      <span v-if="resumen.sinCheckin" class="text-sm"><b class="cifra !text-amber-600">{{ resumen.sinCheckin }}</b> <span class="text-slate-500">{{ t('a.sinCheckin') }}</span></span>
      <span v-if="resumen.porCobrar" class="text-sm"><b class="cifra !text-rose-600">{{ resumen.porCobrar }}</b> <span class="text-slate-500">{{ t('a.porCobrar') }}</span></span>
    </div>

    <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
      <span v-for="a in ACTIVIDADES" :key="a.codigo" class="inline-flex items-center gap-1"><b class="font-mono" :style="{ color: a.color }">{{ a.sigla }}</b>{{ a.nombre }}</span>
      <span><b class="text-rose-600">€</b> {{ t('a.leyendaPago') }} · <span class="text-emerald-600">✓</span> {{ t('a.leyendaCheckin') }}</span>
    </div>
    <p class="text-xs text-slate-500"><span class="hidden md:inline">{{ t('a.arrastra') }}</span>{{ t('a.pincha') }}</p>
    <p v-if="aviso" class="text-sm rounded-lg px-3 py-2" :class="aviso.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'" role="status">{{ aviso.texto }}</p>

    <!-- Cabecera de barcos (solo en pantallas anchas) -->
    <div class="hidden md:grid grid-cols-[56px_repeat(3,minmax(0,1fr))] gap-2 px-1 text-[11px] uppercase tracking-wider font-semibold text-slate-500">
      <span class="text-center">{{ t('a.hora') }}</span><span v-for="b in BARCOS" :key="b.id">{{ b.nombre }} <span class="normal-case tracking-normal text-slate-400">· {{ t('a.plazas', { tipo: b.tipo, n: b.plazas }) }}</span></span>
    </div>

    <div v-for="fila in horas" :key="fila.hora" class="md:grid grid-cols-[56px_repeat(3,minmax(0,1fr))] gap-2">
      <p class="font-mono font-bold text-navy-900 md:text-center md:pt-2 mb-1 md:mb-0">{{ fila.hora }}</p>
      <template v-for="s in fila.salidas" :key="s.clave">
        <div v-if="!s.programada" class="hidden md:flex rounded-xl border border-dashed border-slate-200 items-center justify-center text-[11px] text-slate-300 min-h-[52px]"
          :class="destino === s.clave ? (admite(s) ? '!border-emerald-500 !bg-emerald-50 !text-emerald-700' : '!border-rose-400 !bg-rose-50') : ''"
          @dragover.prevent="sobre(s)" @dragleave="destino === s.clave && (destino = null)" @drop.prevent="soltar(s)">{{ t('a.sinSalida') }}</div>
        <div v-else class="card overflow-hidden mb-2 md:mb-0 transition" :data-salida="s.clave"
          :class="destino === s.clave ? (admite(s) ? '!border-emerald-500 ring-2 ring-emerald-500/30' : '!border-rose-400 ring-2 ring-rose-400/30') : ''"
          @dragover.prevent="sobre(s)" @dragleave="destino === s.clave && (destino = null)" @drop.prevent="soltar(s)">
          <div class="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-100">
            <b class="text-sm text-navy-900">{{ s.barco.nombre }}</b>
            <span class="ml-auto font-mono text-[11px]" :class="s.libres <= 0 ? 'text-rose-600 font-bold' : 'text-slate-500'">{{ s.ocupadas }}/{{ s.capacidad }} · {{ s.libres <= 0 ? t('a.lleno') : t('a.libres', { n: s.libres }) }}</span>
          </div>
          <div class="h-1 bg-slate-100"><div class="h-1 transition-all" :class="s.libres <= 0 ? 'bg-rose-500' : 'bg-[#16b4ea]'" :style="{ width: Math.min(100, (s.ocupadas / s.capacidad) * 100) + '%' }"></div></div>
          <ul>
            <li v-for="(r, i) in s.clientes" :key="r.id">
              <button draggable="true" @dragstart="arrastrar(r, $event)" @dragend="arrastre = null; destino = null" @click="$emit('abrir', r.id)" :data-reserva="r.numero"
                class="w-full flex items-center gap-2 px-3 py-1.5 text-left text-[13px] border-b border-slate-100 last:border-0 hover:bg-ocean-50 cursor-pointer md:cursor-grab"
                :class="[estado.ultima === r.id ? 'nueva font-semibold' : '', arrastre?.id === r.id ? 'opacity-40' : '']">
                <span class="w-4 text-[11px] text-slate-400 tabular-nums">{{ i + 1 }}</span>
                <b class="font-mono text-[11px] w-8" :style="{ color: actividad(r.codigo).color }">{{ actividad(r.codigo).sigla }}</b>
                <span class="flex-1 min-w-0 truncate">{{ r.nombre }}<span v-if="r.pax > 1" class="text-slate-400"> ×{{ r.pax }}</span></span>
                <span v-if="estado.ultima === r.id" class="chip bg-[#16b4ea] text-white">{{ t('a.nueva') }}</span>
                <b v-if="r.pagado < r.monto" class="text-rose-600" :title="t('a.sinPagar')">€</b>
                <span v-if="r.checkin" class="text-emerald-600" :title="t('a.checkinHecho')">✓</span>
              </button>
            </li>
            <li v-if="!s.clientes.length" class="px-3 py-2 text-[12px] text-slate-400">{{ t('a.vacia') }}</li>
          </ul>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { CENTRO, BARCOS, ACTIVIDADES, estado, salidasDelDia, actividad, mover, iso, sumarDias, fechaLarga, mayus } from '../almacen.js'
import { t, idioma } from '../i18n.js'

defineEmits(['abrir'])
const horas = computed(() => salidasDelDia(estado.diaAgenda))
const resumen = computed(() => {
  const todas = horas.value.flatMap((h) => h.salidas), clientes = todas.flatMap((s) => s.clientes)
  return {
    salidas: todas.filter((s) => s.clientes.length).length,
    personas: clientes.reduce((n, r) => n + r.pax, 0),
    sinCheckin: clientes.filter((r) => !r.checkin).length,
    porCobrar: clientes.filter((r) => r.pagado < r.monto).length,
  }
})
function cambiarDia(n) { estado.diaAgenda = sumarDias(estado.diaAgenda, n) }

// ---------- arrastrar y soltar (HTML5) ----------
const arrastre = ref(null), destino = ref(null), aviso = ref(null)
let temporizador
function avisar(texto, ok) { aviso.value = { texto, ok }; clearTimeout(temporizador); temporizador = setTimeout(() => (aviso.value = null), 3500) }
function arrastrar(r, ev) { arrastre.value = r; ev.dataTransfer.effectAllowed = 'move'; ev.dataTransfer.setData('text/plain', r.id) }
const mismaSalida = (s) => arrastre.value && arrastre.value.hora === s.hora && arrastre.value.recursoId === s.recursoId
const admite = (s) => !!arrastre.value && !mismaSalida(s) && s.libres >= arrastre.value.pax
function sobre(s) { if (arrastre.value) destino.value = s.clave }
function soltar(s) {
  const r = arrastre.value
  destino.value = null; arrastre.value = null
  if (!r || (r.hora === s.hora && r.recursoId === s.recursoId)) return
  try {
    mover(r.id, { fecha: estado.diaAgenda, hora: s.hora, recursoId: s.recursoId })
    avisar(t('a.movida', { nombre: r.nombre, barco: s.barco.nombre, hora: s.hora }), true)
  } catch (e) { avisar(e.message, false) }
}
</script>
