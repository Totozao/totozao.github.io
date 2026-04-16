<script setup lang="ts">
const { label } = defineProps<{
  label: string;
}>();

const model = defineModel<string>();
</script>

<template>
  <div class="flex flex-col gap-[8px]">
    <label class="font-semibold">{{ label }}</label>
    <input
      v-model="model"
      type="text"
      class="border border-black rounded-[12px]"
    />
  </div>
</template>
