<!-- App.vue — Marco de la demo. En pantallas anchas se ven a la vez el widget (dentro de un móvil) y la agenda
     del centro, para que la reserva aparezca en directo; en el móvil van en dos pestañas (#reservar / #agenda).
     En la cabecera, el selector de idioma EN / ES (ver i18n.js). -->
<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-navy-900 text-white">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
        <Marca claro class="text-[15px] sm:text-xl min-w-0" />
        <p class="hidden md:block text-sm text-slate-300 ml-2">{{ t('app.lema') }}</p>
        <div class="ml-auto flex items-center gap-2 sm:gap-3 shrink-0">
          <div class="flex rounded-md bg-white/10 p-0.5 text-[11px] font-bold" role="group" :aria-label="t('app.idioma')">
            <button v-for="l in ['en', 'es']" :key="l" :lang="l" :aria-pressed="idioma === l" @click="cambiarIdioma(l)"
              class="px-2 py-1 rounded uppercase transition" :class="idioma === l ? 'bg-white text-navy-900' : 'text-slate-300 hover:text-white'">{{ l }}</button>
          </div>
          <button class="text-xs font-semibold text-slate-300 hover:text-white underline-offset-2 hover:underline" @click="volverAEmpezar"><span class="sm:hidden">{{ t('app.reiniciarCorto') }}</span><span class="hidden sm:inline">{{ t('app.reiniciar') }}</span></button>
        </div>
      </div>
    </header>

    <div class="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs">
      <p class="max-w-7xl mx-auto px-4 py-2">{{ t('app.aviso') }}</p>
    </div>

    <!-- Pestañas (móvil y tableta) -->
    <nav class="lg:hidden sticky top-0 z-20 bg-sand/95 backdrop-blur border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 flex gap-1 py-2" role="tablist">
        <button v-for="p in PESTANAS" :key="p.id" role="tab" :aria-selected="pestana === p.id" @click="ir(p.id)"
          class="flex-1 rounded-lg py-2 text-sm font-bold transition" :class="pestana === p.id ? 'bg-white text-navy-900 shadow-sm border border-slate-200' : 'text-slate-500'">{{ t(p.texto) }}</button>
      </div>
    </nav>

    <main class="flex-1 max-w-7xl w-full mx-auto px-4 py-4 lg:py-6 lg:grid lg:grid-cols-[400px_minmax(0,1fr)] lg:gap-8 lg:items-start">
      <!-- Widget: en el ordenador, dentro de un móvil -->
      <section :class="pestana === 'reservar' ? '' : 'hidden lg:block'" :aria-label="t('app.ariaWidget')">
        <p class="hidden lg:block eyebrow mb-2 text-center">{{ t('app.veCliente') }}</p>
        <div class="-mx-4 lg:mx-0 lg:rounded-[2.4rem] lg:border-[10px] lg:border-navy-900 lg:shadow-pop overflow-hidden bg-white lg:h-[780px] lg:sticky lg:top-6">
          <div class="h-full overflow-y-auto"><WidgetReserva @ver-agenda="verEnAgenda" /></div>
        </div>
      </section>

      <!-- Agenda del centro -->
      <section :class="pestana === 'agenda' ? '' : 'hidden lg:block'" :aria-label="t('app.ariaAgenda')">
        <p class="hidden lg:block eyebrow mb-2">{{ t('app.veCentro') }}</p>
        <AgendaDia @abrir="ficha = $event" />
      </section>
    </main>

    <footer class="text-center text-xs text-slate-500 px-4 py-6">{{ t('app.pie') }}</footer>

    <FichaReserva v-if="ficha" :id="ficha" @cerrar="ficha = null" />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Marca from './components/Marca.vue'
import WidgetReserva from './components/WidgetReserva.vue'
import AgendaDia from './components/AgendaDia.vue'
import FichaReserva from './components/FichaReserva.vue'
import { estado, reiniciar } from './almacen.js'
import { t, idioma, cambiarIdioma } from './i18n.js'

const PESTANAS = [{ id: 'reservar', texto: 'app.pestanaReservar' }, { id: 'agenda', texto: 'app.pestanaAgenda' }]
const desdeHash = () => (location.hash === '#agenda' ? 'agenda' : 'reservar')
const pestana = ref(desdeHash()), ficha = ref(null)

function ir(id) {
  pestana.value = id
  try { history.replaceState(null, '', '#' + id) } catch { /* sin history (iframe, file://) */ }
  window.scrollTo({ top: 0 })
}
const alCambiarHash = () => { pestana.value = desdeHash() }
onMounted(() => window.addEventListener('hashchange', alCambiarHash))
onBeforeUnmount(() => window.removeEventListener('hashchange', alCambiarHash))

function verEnAgenda(r) {
  estado.diaAgenda = r.fecha
  estado.ultima = r.id
  ir('agenda')
  // en pantallas anchas la agenda ya está a la vista: se baja hasta la salida
  setTimeout(() => document.querySelector(`[data-reserva="${r.numero}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80)
}
function volverAEmpezar() {
  if (window.confirm(t('app.reiniciarConfirmar'))) { ficha.value = null; reiniciar() }
}
</script>
