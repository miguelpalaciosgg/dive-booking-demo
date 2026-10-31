<!-- Marca.vue — Marca neutra de la demo: icono de olas (SVG propio, el mismo que el favicon) + «Dive booking demo». -->
<template>
  <span class="inline-flex items-center gap-[.4em] font-extrabold tracking-tight leading-none">
    <svg viewBox="0 0 32 32" class="h-[1.45em] w-[1.45em] shrink-0" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#0b84d8" />
      <path d="M5 12.5c2.8 0 2.8-3 5.5-3s2.7 3 5.5 3 2.8-3 5.5-3 2.7 3 5.5 3M5 19.5c2.8 0 2.8-3 5.5-3s2.7 3 5.5 3 2.8-3 5.5-3 2.7 3 5.5 3" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" />
      <circle cx="23" cy="25" r="1.6" fill="#fff" opacity=".8" />
    </svg>
    <span class="min-w-0 leading-[1.1]" :class="claro ? 'text-white' : 'text-navy-900'">{{ t('app.marca') }}</span>
  </span>
</template>

<script setup>
import { t } from '../i18n.js'
defineProps({ claro: Boolean })
</script>
