<script setup lang="ts">
import roles from "@/assets/data/roles.json";

const players = usePlayersInfo();

const isAddPlayerModalVisible = ref<boolean>(false);
const handleAddPlayer = (playerName: string) => {
  try {
    players.addPlayer(playerName);
    isAddPlayerModalVisible.value = false;
  } catch (error) {
    console.error(error);
    alert(error);
  }
};

const handleStartGame = () => {
  if (players.activePlayers.length < 6) {
    alert("Недостаточно игроков");
    return;
  } else {
    navigateTo("/game");
  }
};
</script>

<template>
  <NuxtLayout name="enter">
    <div class="flex flex-col gap-[24px] items-center px-[20px]">
      <h1 class="font-bold">Добро пожаловать в мафию</h1>
      <div class="flex flex-col gap-[24px]">
        <h2 class="font-semibold">Список игроков</h2>
        <TransitionGroup name="fade">
          <IndexPlayerCard
            v-for="player in players.activePlayers"
            :key="player.name"
            :player="player"
            @remove-player="players.removePlayer"
          ></IndexPlayerCard>
        </TransitionGroup>
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
      <SharedUiButton
        text="Начать игру"
        @click="handleStartGame"
      ></SharedUiButton>
    </div>
    <Transition name="fade">
      <IndexAddPlayerModal
        :isModalVisible="isAddPlayerModalVisible"
        @close-modal="isAddPlayerModalVisible = false"
        @add-player="handleAddPlayer"
      ></IndexAddPlayerModal>
    </Transition>
  </NuxtLayout>
</template>
