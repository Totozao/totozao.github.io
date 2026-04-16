<script setup lang="ts">
const { text, disabled } = defineProps<{
  text: string;
  disabled?: boolean;
}>();
</script>

<template>
  <button
    :disabled="disabled"
    class="cursor-pointer font-semibold text-[#DFE5FB] bg-[#7996FC] rounded-[12px] p-[12px]"
  >
    <span>{{ text }}</span>
  </button>
</template>
