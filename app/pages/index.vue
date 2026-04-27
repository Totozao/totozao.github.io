<script setup lang="ts">
import roles from "@/assets/data/roles.json";
import { useToast } from "~/composables/useToast";

const playersInfo = usePlayersInfo();
const toast = useToast();

const isAddPlayerModalVisible = ref<boolean>(false);
const handleAddPlayer = (playerName: string) => {
  try {
    playersInfo.addPlayer(playerName);
    isAddPlayerModalVisible.value = false;
    toast.success(`Игрок ${playerName} успешно добавлен`);
  } catch (error: unknown) {
    console.error(error);
    toast.error(error instanceof Error ? error.message : "Ошибка при добавлении игрока");
  }
};

const handleStartGame = () => {
  if (playersInfo.players.length < 6) {
    toast.warning("Недостаточно игроков (минимум 6)");
    return;
  } else {
    playersInfo.activePlayers = [...playersInfo.players];
    playersInfo.currentNight = 0;
    playersInfo.nightsLogs = [];
    playersInfo.lastCirclePlayers = [...playersInfo.players];
    playersInfo.totalSectariansCreated = 0;
    playersInfo.currentGameStep = "night";
    playersInfo.resetActivePlayers();
    playersInfo.setActiveRoles();
    navigateTo({
      path: "/first-circle",
      query: {
        role: "detectiveZero",
      },
    });
  }
};

useHead({
  title: "Мафия - Настройка игры",
  meta: [
    { name: "description", content: "Настройте игру и добавьте участников перед началом" },
  ],
});
</script>

<template>
  <NuxtLayout name="enter">
    <div class="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto py-12 px-6">
      <div class="text-center space-y-4">
        <h1 class="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
          Добро пожаловать в Мафию
        </h1>
        <p class="text-neutral-400">Настройте игру и добавьте участников перед началом</p>
      </div>

      <div class="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
        <div class="flex flex-col gap-6 relative z-10">
          <div class="flex justify-between items-center border-b border-neutral-800 pb-4">
            <h2 class="text-xl font-bold text-neutral-200">Список игроков <span class="text-rose-500">({{ playersInfo.players.length }})</span></h2>
            <SharedUiButton
              text="+ Добавить"
              class="!py-2 !px-4 text-sm"
              @click="isAddPlayerModalVisible = true"
            />
          </div>
          
          <ClientOnly>
            <TransitionGroup name="fade" tag="div" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <IndexPlayerCard
                v-for="player in playersInfo.players"
                :key="player.name"
                :player="player"
                @remove-player="playersInfo.removePlayer"
                class="bg-neutral-800/50 p-3 rounded-xl border border-neutral-700 flex justify-between items-center"
              />
            </TransitionGroup>
            
            <div v-if="playersInfo.players.length === 0" class="text-center py-8 text-neutral-500">
              Пока нет ни одного игрока. Добавьте участников чтобы начать игру.
            </div>
          </ClientOnly>
        </div>
      </div>

      <div class="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
        <div class="flex flex-col gap-6 relative z-10">
          <h2 class="text-xl font-bold text-neutral-200 border-b border-neutral-800 pb-4">Настройки сессии</h2>
          
          <ClientOnly>
            <div class="flex flex-col gap-4">
              <h3 class="font-medium text-neutral-400">Исключаемые роли</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div v-for="(role, key) in roles" :key="key">
                  <IndexRoleCard :role="role" />
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-neutral-800">
              <SharedUiInput
                label="Количество сектантов"
                v-model="playersInfo.maxSectarians"
                type="number"
              />
              <SharedUiInput
                label="Количество мафий"
                v-model="playersInfo.amountOfMafia"
                type="number"
              />
              <SharedUiInput
                label="Колесо Фортуны (кругов)"
                v-model="playersInfo.circleOfFortuneRounds"
                type="number"
              />
            </div>
          </ClientOnly>
        </div>
      </div>

      <SharedUiButton
        class="w-full max-w-sm mt-4 text-lg py-4 !bg-gradient-to-r !from-rose-600 !to-purple-600 border-none shadow-[0_0_30px_rgba(225,29,72,0.3)] hover:shadow-[0_0_40px_rgba(225,29,72,0.5)]"
        text="Начать игру"
        @click="handleStartGame"
      />
    </div>

    <SharedUiModal :isModalVisible="isAddPlayerModalVisible">
      <IndexAddPlayerModal
        :isModalVisible="isAddPlayerModalVisible"
        @close-modal="isAddPlayerModalVisible = false"
        @add-player="handleAddPlayer"
      />
    </SharedUiModal>
  </NuxtLayout>
</template>
