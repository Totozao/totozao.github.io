<script setup lang="ts">
const { label, type } = defineProps<{
  label: string;
  type?: string;
}>();

const model = defineModel<string>();

const emit = defineEmits(["enterPressed"]);
</script>

<template>
  <div class="flex flex-col gap-2 w-full">
    <label class="text-sm font-medium text-neutral-400 ml-1">{{ label }}</label>
    <input
      @keydown.enter="emit('enterPressed')"
      v-model="model"
      :type="type || 'text'"
      class="w-full outline-none bg-neutral-900 border border-neutral-800 text-neutral-100 rounded-xl px-4 py-3 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 transition-all placeholder-neutral-600 shadow-inner hover:border-neutral-700"
    />
  </div>
</template>
