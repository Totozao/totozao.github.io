<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isModalVisible"
        class="fixed top-0 left-0 z-[1010] overflow-hidden flex h-screen w-screen items-center justify-center bg-[#28282799]/60 backdrop-blur-md"
      >
        <slot />
      </div>
    </Transition>
  </Teleport>
</template>

<script lang="ts" setup>
const { isModalVisible } = defineProps<{
  isModalVisible: boolean;
}>();

watch(
  () => isModalVisible,
  (newValue) => {
    if (newValue) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  },
);
</script>

<style></style>
