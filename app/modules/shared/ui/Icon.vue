<script setup lang="ts">
const { icon } = defineProps<{
  icon: string;
}>();
</script>

<template>
  <div class="w-[24px] h-[24px] flex items-center justify-center">
    <img class="w-full h-full" :src="`/icons/${icon}-icon.svg`" alt="" />
  </div>
</template>
