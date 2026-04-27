<script setup lang="ts">
const { text, disabled } = defineProps<{
  text: string;
  disabled?: boolean;
}>();
</script>

<template>
  <button
    :disabled="disabled"
    class="relative group overflow-hidden font-semibold text-white rounded-xl px-6 py-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[
      disabled 
        ? 'bg-neutral-800 text-neutral-500' 
        : 'bg-neutral-900 border border-neutral-700 hover:border-rose-500/50 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:-translate-y-0.5'
    ]"
  >
    <div class="absolute inset-0 bg-gradient-to-r from-rose-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" v-if="!disabled"></div>
    <span class="relative z-10">{{ text }}</span>
  </button>
</template>
