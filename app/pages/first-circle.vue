<script setup lang="ts">
import roles from "@/assets/data/roles.json";
import affectedRoles from "@/assets/data/affectedRoles.json";
import { useGameEngine } from '~/composables/useGameEngine';

const firstCircleOrder = [
  { name: "detectiveZero", role: "detective" },
  { name: "patrolZero", role: "patrol" },
  { name: "journalistZero", role: "journalist" },
  { name: "lucky-guyZero", role: "lucky-guy" },
  { name: "mafia", role: "mafia" },
  { name: "don", role: "don" },
  { name: "sectarian", role: "sectarian" },
  { name: "detective", role: "patrol" },
  { name: "patrol", role: "doctor" },
  { name: "doctor", role: "detectiveZero" },
];

const route = useRoute();
const playersInfo = usePlayersInfo();
const { handleNextRole, roleActions } = useGameEngine();

const currentRoleName = computed(() => route.query.role as string);

const multiPlayersSelection = ref<{
  firstSelection: string;
  secondSelection: string;
}>({
  firstSelection: "",
  secondSelection: "",
});

const inactiveRoles = computed(() => {
  return Object.keys(playersInfo.inactiveRoles).filter(
    (role) => playersInfo.inactiveRoles[role]
  );
});

const filteredFirstCircleOrder = computed(() => {
  return firstCircleOrder.filter(
    (role) => !inactiveRoles.value.includes(role.role)
  );
});

const currentStepIndex = computed(() => {
  const index = filteredFirstCircleOrder.value.findIndex((role) => role.name === currentRoleName.value);
  return index === -1 ? 0 : index;
});

const playerOptions = computed(() => {
  return playersInfo.activePlayers.map((player) => ({ label: player.name, value: player.name }));
});

const isEmergencyAvailable = computed(() => {
  return playersInfo.activeRoles.includes(currentRoleName.value)
    && !currentRoleName.value.toLowerCase().includes('zero');
});

const onNextRole = () => {
  const nextRoleName = handleNextRole(currentRoleName.value, filteredFirstCircleOrder.value);
  
  if (nextRoleName && affectedRoles[nextRoleName as keyof typeof affectedRoles]) {
    const corePlayer = playersInfo.activePlayers.filter((player) => 
      player.role === affectedRoles[nextRoleName as keyof typeof affectedRoles]
    );
    // If we need to skip a role or do automatic checks:
    // This is simplified based on the original recursive logic
    if (corePlayer && corePlayer.length > 0) {
      handleNextRole(nextRoleName, filteredFirstCircleOrder.value);
    }
  }
};

const executeAction = (actionName: string, arg1: string, arg2?: string) => {
  const action = roleActions[actionName as keyof typeof roleActions];
  if (action) {
    if (arg2 !== undefined) {
      (action as any)(arg1, arg2);
    } else {
      (action as any)(arg1);
    }
    onNextRole();
  }
};

const getRoleText = (roleKey: string) => {
  const texts: Record<string, string> = {
    detectiveZero: "Выберите игрока на роли детектива",
    patrolZero: "Выберите игрока на роли Патрульного",
    journalistZero: "Выберите игрока на роли журналиста",
    "lucky-guyZero": "Выберите игрока на роли счастливчика",
    mafia: "Выберите игрока на роли мафии и его цель",
    don: "Выберите игрока на роли дона и его цель",
    sectarian: "Выберите игрока на роли сектанта и его цель",
    detective: "Выберите цель для проверки детектива",
    journalist: "Выберите цели игрока на роли журналиста для проверки",
    patrol: "Выберите цели игрока на роли патрульного",
    doctor: "Выберите игрока на роли доктора и его цель",
  };
  return texts[roleKey] || "Сделайте выбор";
};

const getRoleTitle = (roleKey: string) => {
  const titles: Record<string, string> = {
    detectiveZero: "Детектив",
    patrolZero: "Патрульный",
    journalistZero: "Журналист",
    "lucky-guyZero": "Счастливчик",
    mafia: "Мафия",
    don: "Дон",
    sectarian: "Сектант",
    detective: "Детектив",
    journalist: "Журналист",
    patrol: "Патрульный",
    doctor: "Доктор",
  };
  return titles[roleKey] || "Первый круг";
};

const isDoubleAction = computed(() => {
  const doubleActionRoles = ['mafia', 'don', 'sectarian', 'journalist', 'patrol', 'doctor'];
  return doubleActionRoles.includes(currentRoleName.value);
});

const isDoubleActionReady = computed(() => {
  return Boolean(multiPlayersSelection.value.firstSelection && multiPlayersSelection.value.secondSelection);
});

useHead({
  title: "Мафия - Первый круг игры",
  meta: [
    { name: "description", content: "Выберите игрока на первый круг игры" },
  ],
});
</script>

<template>
  <NuxtLayout>
    <div class="flex flex-col items-center gap-8 w-full max-w-lg mx-auto py-8">
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-red-500 to-rose-400 bg-clip-text text-transparent">
          Первый круг игры
        </h1>
        <p class="text-neutral-400 font-medium">Ночь опускается на город...</p>
      </div>

      <ClientOnly>
        <div class="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 pointer-events-none"></div>
          
          <div class="flex flex-col gap-6 relative z-10">
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-2">
                <p class="text-xs uppercase tracking-[0.3em] text-blue-300/70">Первый круг</p>
                <h2 class="text-2xl font-bold text-neutral-100">
                  {{ getRoleTitle(currentRoleName) }}
                </h2>
                <p class="text-neutral-400">
                  {{ getRoleText(currentRoleName) }}
                </p>
              </div>
              <span class="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-sm font-semibold text-blue-200">
                {{ currentStepIndex + 1 }}/{{ Math.max(filteredFirstCircleOrder.length, 1) }}
              </span>
            </div>

            <div class="rounded-2xl border border-blue-400/10 bg-blue-400/5 p-4">
              <div class="w-full flex flex-col gap-4" v-if="isDoubleAction">
                <SharedUiDropDown
                  v-model="multiPlayersSelection.firstSelection"
                  :label="`Игрок 1`"
                  :options="playerOptions"
                />
                <SharedUiDropDown
                  v-model="multiPlayersSelection.secondSelection"
                  label="Игрок 2 (Цель)"
                  :options="playerOptions"
                />
                <SharedUiButton
                  class="mt-2 w-full"
                  text="Продолжить"
                  :disabled="!isDoubleActionReady"
                  @click="executeAction(currentRoleName, multiPlayersSelection.firstSelection, multiPlayersSelection.secondSelection)"
                />
              </div>

              <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <SharedUiButton
                  v-for="player in playersInfo.activePlayers"
                  :key="player.name"
                  :text="player.name"
                  class="w-full"
                  @click="executeAction(currentRoleName, player.name)"
                />
              </div>
            </div>

            <div
              v-if="isEmergencyAvailable"
              class="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full"
            >
              <div>
                <h3 class="text-sm font-medium text-neutral-300 uppercase tracking-wider">Экстренная функция</h3>
                <p class="text-sm text-neutral-500">Пропустить действие, если игрок уже в секте.</p>
              </div>
              <SharedUiButton
                class="w-full sm:w-auto min-w-[150px] !bg-neutral-800 !text-neutral-300 hover:!bg-neutral-700"
                text="В секте"
                @click="onNextRole"
              />
            </div>
          </div>
        </div>
      </ClientOnly>
    </div>
  </NuxtLayout>
</template>
