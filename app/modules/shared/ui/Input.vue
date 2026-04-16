<script setup lang="ts">
const { label, type } = defineProps<{
  label: string;
  type?: string;
}>();

const model = defineModel<string>();
</script>

<template>
  <div class="flex flex-col gap-[8px]">
    <label class="font-semibold">{{ label }}</label>
    <input
      v-model="model"
      :type="type || 'text'"
      class="outline-none border border-[#7996FC] rounded-[12px] p-[8px]"
    />
  </div>
</template>
