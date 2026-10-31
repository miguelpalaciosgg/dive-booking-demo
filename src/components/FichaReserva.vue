<!-- FichaReserva.vue — Ventana de una reserva desde la agenda: datos, estado de pago y cobro en mostrador,
     check-in, mover a otro barco u hora (lo que en el móvil sustituye al arrastre) y cancelar.
     En el producto real la ficha hace además facturas Verifactu, devoluciones por Redsys y el check-in con firma. -->
<template>
  <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 sm:p-4" @click.self="$emit('cerrar')" role="dialog" aria-modal="true" :aria-label="t('f.reserva', { numero: r.numero })">
    <div class="bg-white w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-pop rise">
      <div class="sticky top-0 bg-white flex items-start gap-3 px-4 pt-4 pb-3 border-b border-slate-100">
        <div class="min-w-0 flex-1">
          <p class="eyebrow">{{ t('f.reserva', { numero: r.numero }) }} · {{ t('origen.' + r.origen) }}</p>
          <h2 class="text-lg font-extrabold text-navy-900 truncate">{{ r.nombre }}</h2>
          <p class="text-sm text-slate-500"><b :style="{ color: act.color }">{{ act.sigla }}</b> {{ act.nombre }} · {{ t('personas', { n: r.pax }) }}</p>
        </div>
        <button class="btn-ghost !px-2.5 text-lg" @click="$emit('cerrar')" :aria-label="t('f.cerrar')">✕</button>
      </div>

      <div class="p-4 space-y-4 text-sm">
        <div class="flex flex-wrap gap-1.5">
          <span v-if="r.estado === 'cancelada'" class="chip bg-slate-200 text-slate-700">{{ t('f.cancelada') }}</span>
          <span v-else class="chip bg-ocean-100 text-ocean-600">{{ t('f.confirmada') }}</span>
          <span class="chip" :class="pagada ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'">{{ pagada ? t('f.pagada', { metodo: metodoTexto(r.metodo) }) : t('f.pendiente') }}</span>
          <span class="chip" :class="r.checkin ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'">{{ r.checkin ? t('f.checkinHecho') : t('f.sinCheckin') }}</span>
        </div>

        <dl class="grid grid-cols-[110px_1fr] gap-y-1.5">
          <dt class="text-slate-500">{{ t('f.dia') }}</dt><dd class="font-semibold text-navy-900">{{ mayus(fechaLarga(r.fecha)) }}</dd>
          <dt class="text-slate-500">{{ t('f.salida') }}</dt><dd class="font-semibold text-navy-900">{{ t('hora', { h: r.hora }) }} · {{ barco(r.recursoId).nombre }}</dd>
          <template v-if="r.email"><dt class="text-slate-500">{{ t('f.email') }}</dt><dd class="truncate">{{ r.email }}</dd></template>
          <template v-if="r.telefono"><dt class="text-slate-500">{{ t('f.telefono') }}</dt><dd>{{ r.telefono }}</dd></template>
          <template v-if="r.material.length"><dt class="text-slate-500">{{ t('f.material') }}</dt><dd>{{ r.material.map((m) => `${nombreMaterial(m.id)}${m.talla ? ' ' + m.talla : ''} ×${m.cantidad}`).join(', ') }}</dd></template>
          <template v-if="r.extras.length"><dt class="text-slate-500">{{ t('f.extras') }}</dt><dd>{{ r.extras.map(nombreExtra).join(', ') }}</dd></template>
          <template v-if="r.descuento"><dt class="text-slate-500">{{ t('f.descuento') }}</dt><dd class="text-emerald-700">{{ r.descuento.codigo }} · −{{ euros(r.descuento.importe) }}</dd></template>
          <dt class="text-slate-500">{{ t('f.total') }}</dt><dd class="cifra">{{ euros(r.monto) }} <span class="font-sans font-normal text-slate-500">{{ t('f.pagado', { importe: euros(r.pagado) }) }}</span></dd>
        </dl>

        <template v-if="r.estado !== 'cancelada'">
          <!-- Check-in -->
          <div class="card p-3 flex items-center gap-3">
            <div class="flex-1"><p class="font-semibold text-navy-900">{{ t('f.checkin') }}</p><p class="text-xs text-slate-500">{{ t('f.checkinTexto') }}</p></div>
            <button class="btn shrink-0" :class="r.checkin ? 'btn-soft' : 'btn-primary'" @click="alternarCheckin(r.id)">{{ r.checkin ? t('f.deshacer') : t('f.hacerCheckin') }}</button>
          </div>

          <!-- Cobro -->
          <div v-if="!pagada" class="card p-3">
            <p class="font-semibold text-navy-900">{{ t('f.cobrarMostrador') }} <span class="cifra text-rose-600">{{ euros(r.monto - r.pagado) }}</span></p>
            <div class="flex gap-2 mt-2">
              <select v-model="metodo" class="inp" :aria-label="t('f.formaPago')"><option v-for="m in METODOS" :key="m" :value="m">{{ metodoTexto(m) }}</option></select>
              <button class="btn-primary shrink-0" @click="cobrar(r.id, metodo)">{{ t('f.cobrar') }}</button>
            </div>
            <p class="text-[11px] text-slate-400 mt-1">{{ t('f.simulado') }}</p>
          </div>

          <!-- Mover -->
          <div class="card p-3">
            <p class="font-semibold text-navy-900">{{ t('f.mover') }}</p>
            <div class="flex gap-2 mt-2">
              <select v-model="destino" class="inp" :aria-label="t('f.salidaDestino')">
                <option value="">{{ t('f.elige') }}</option>
                <option v-for="s in opciones" :key="s.clave" :value="s.clave" :disabled="s.libres < r.pax">{{ s.hora }} · {{ s.barco.nombre }} · {{ s.libres < r.pax ? t('f.noCabe') : t('f.libres', { n: s.libres }) }}</option>
              </select>
              <button class="btn-soft shrink-0" :disabled="!destino" @click="moverA">{{ t('f.moverBoton') }}</button>
            </div>
            <p v-if="error" class="text-xs text-rose-600 mt-1">{{ error }}</p>
          </div>

          <button class="btn w-full text-rose-600 hover:bg-rose-50" @click="confirmarCancelar">{{ t('f.cancelar') }}</button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { estado, actividad, barco, MATERIAL, EXTRAS, METODOS, metodoTexto, salidasDelDia, mover, cobrar, alternarCheckin, cancelar, fechaLarga, mayus, euros } from '../almacen.js'
import { t } from '../i18n.js'

const props = defineProps({ id: { type: String, required: true } })
const emit = defineEmits(['cerrar'])
const r = computed(() => estado.reservas.find((x) => x.id === props.id))
const act = computed(() => actividad(r.value.codigo))
const pagada = computed(() => r.value.pagado >= r.value.monto)
const metodo = ref(METODOS[0]), destino = ref(''), error = ref('')
const nombreMaterial = (id) => MATERIAL.find((m) => m.id === id)?.nombre || id
const nombreExtra = (id) => EXTRAS.find((e) => e.id === id)?.nombre || id

// Salidas del mismo día donde podría ir (sin la suya); el aforo se cuenta sin esta reserva
const opciones = computed(() => salidasDelDia(r.value.fecha).flatMap((h) => h.salidas).filter((s) => s.programada && !(s.hora === r.value.hora && s.recursoId === r.value.recursoId)))
function moverA() {
  const s = opciones.value.find((x) => x.clave === destino.value)
  error.value = ''
  try { mover(r.value.id, { fecha: r.value.fecha, hora: s.hora, recursoId: s.recursoId }); destino.value = '' } catch (e) { error.value = e.message }
}
function confirmarCancelar() {
  if (window.confirm(t('f.cancelarConfirmar'))) { cancelar(r.value.id); emit('cerrar') }
}
</script>
