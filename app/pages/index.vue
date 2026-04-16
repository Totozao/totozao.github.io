<script setup lang="ts">
import roles from "@/assets/data/roles.json";

const players = usePlayersInfo();

const isAddPlayerModalVisible = ref<boolean>(false);
const handleAddPlayer = (playerName: string) => {
  players.addPlayer(playerName);
  isAddPlayerModalVisible.value = false;
};
</script>

<template>
  <NuxtLayout name="enter">
    <div class="flex flex-col items-center">
      <h1 class="font-bold">Добро пожаловать в мафию</h1>
      <div class="flex flex-col gap-[24px]">
        <h2 class="font-semibold">Список игроков</h2>
        <IndexPlayerCard
          v-for="player in players.activePlayers"
          :key="player.id"
          :player="player"
          @remove-player="players.removePlayer"
        ></IndexPlayerCard>
        <SharedUiButton
          text="Добавить игрока"
          @click="isAddPlayerModalVisible = true"
        ></SharedUiButton>
      </div>
      <div class="flex flex-col gap-[24px]">
        <h2 class="font-semibold">Список ролей</h2>
        <div v-for="(role, key) in roles" :key="key">
          <h3 class="font-semibold">{{ role.name }}</h3>
          <p>{{ role.description }}</p>
        </div>
      </div>
    </div>
    <IndexAddPlayerModal
      :isModalVisible="isAddPlayerModalVisible"
      @close-modal="isAddPlayerModalVisible = false"
      @add-player="handleAddPlayer"
    ></IndexAddPlayerModal>
  </NuxtLayout>
</template>
