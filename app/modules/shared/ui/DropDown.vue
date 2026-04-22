<script setup lang="ts">
const { options, label } = defineProps<{
  options: {
    label: string;
    value: string;
  }[];
  label?: string;
}>();

const DropDownId = `dropdown-${Math.random().toString(36).substring(2, 9)}`;

const model = defineModel<string>();
</script>

<template>
  <div class="flex flex-col">
    <ClientOnly>
      <label :for="DropDownId">{{ label }}</label>
      <select :name="DropDownId" v-model="model">
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
    </ClientOnly>
  </div>
</template>
