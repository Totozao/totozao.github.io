<script setup lang="ts">
const { isModalVisible } = defineProps<{
  isModalVisible: boolean;
}>();

const emits = defineEmits<{
  (e: "closeModal"): void;
  (e: "addPlayer", playerName: string): void;
}>();

const playerName = ref<string>("");

const handleKeyPress = () => {
  if (playerName.value) {
    emits("addPlayer", playerName.value);
  } else {
    useToast().addToast({
      type: "error",
      message: "Пожалуйста, введите имя",
    });
  }
};
</script>

<template>
  <SharedUiModal :isModalVisible="isModalVisible">
    <div
      class="rounded-[24px] relative flex flex-col gap-[12px] bg-white select-none p-[24px]"
    >
      <button
        class="absolute flex items-center justify-center top-[12px] right-[12px] cursor-pointer"
        @click="emits('closeModal')"
      >
        <SharedUiIcon icon="cross"></SharedUiIcon>
      </button>
      <SharedUiInput
        label="Имя"
        v-model="playerName"
        @enterPressed="handleKeyPress"
      ></SharedUiInput>
      <SharedUiButton
        :disabled="!playerName"
        text="Добавить"
        @click="emits('addPlayer', playerName)"
      ></SharedUiButton>
    </div>
  </SharedUiModal>
</template>
