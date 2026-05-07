<script setup lang="ts">
import affectedRoles from "@/assets/data/affectedRoles.json";
import { useGameEngine } from '~/composables/useGameEngine';

const firstCircleOrder = [
  { name: "detectiveZero", role: "detective" },
  { name: "patrolZero", role: "patrol" },
  { name: "journalistZero", role: "journalist" },
  { name: "lucky-guyZero", role: "lucky-guy" },
  { name: "maniacZero", role: "maniac" },
  { name: "mafia", role: "mafia" },
  { name: "don", role: "don" },
  { name: "sectarian", role: "sectarian" },
  { name: "maniac", role: "maniac" },
  { name: "detective", role: "patrol" },
  { name: "patrol", role: "doctor" },
  { name: "doctor", role: "detectiveZero" },
];

const route = useRoute();
const playersInfo = usePlayersInfo();
const { handleNextRole, roleActions } = useGameEngine();
const toast = useToast();

const currentRoleName = computed(() => route.query.role as string);

const multiPlayersSelection = ref<{
  firstSelection: string;
  secondSelection: string;
}>({
  firstSelection: "",
  secondSelection: "",
});
const mafiaSelections = ref<string[]>([]);
const mafiaTargetSelection = ref("");

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
const selectedActorTargetOptions = computed(() => {
  return playersInfo.activePlayers
    .filter((player) => player.name !== multiPlayersSelection.value.firstSelection)
    .map((player) => ({ label: player.name, value: player.name }));
});
const mafiaSelectionCount = computed(() => {
  return Math.max(parseInt(playersInfo.amountOfMafia.toString()) || 0, 0);
});
const mafiaSelectionSlots = computed(() => {
  return Array.from({ length: mafiaSelectionCount.value }, (_, index) => index);
});
const isMafiaSelection = computed(() => currentRoleName.value === 'mafia');
const getMafiaPlayerOptions = (currentIndex: number) => {
  const selectedByOtherDropdowns = new Set(
    mafiaSelections.value
      .slice(0, mafiaSelectionCount.value)
      .filter((playerName, index) => playerName && index !== currentIndex),
  );

  return playersInfo.activePlayers
    .filter((player) => !selectedByOtherDropdowns.has(player.name))
    .map((player) => ({ label: player.name, value: player.name }));
};
const selectedMafiaPlayers = computed(() => {
  return mafiaSelections.value.slice(0, mafiaSelectionCount.value);
});
const mafiaTargetOptions = computed(() => {
  const selectedMafia = new Set(selectedMafiaPlayers.value.filter(Boolean));

  return playersInfo.activePlayers
    .filter((player) => !selectedMafia.has(player.name))
    .map((player) => ({ label: player.name, value: player.name }));
});
const currentActionActor = computed(() => {
  if (currentRoleName.value.toLowerCase().includes('zero') || isDoubleAction.value) {
    return null;
  }

  return playersInfo.activePlayers.find((player) => player.role === currentRoleName.value && player.lives > 0) || null;
});
const singleActionPlayerOptions = computed(() => {
  return playersInfo.activePlayers
    .filter((player) => player.name !== currentActionActor.value?.name)
    .map((player) => ({ label: player.name, value: player.name }));
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

const executeMafiaSetup = () => {
  const selectedMafia = selectedMafiaPlayers.value;
  const uniqueSelectedMafia = new Set(selectedMafia);

  if (selectedMafia.length !== mafiaSelectionCount.value || selectedMafia.some((playerName) => !playerName)) {
    toast.warning("Выберите всех игроков мафии.");
    return;
  }

  if (uniqueSelectedMafia.size !== selectedMafia.length) {
    toast.warning("Один игрок не может быть выбран мафией несколько раз.");
    return;
  }

  if (!mafiaTargetSelection.value) {
    toast.warning("Выберите цель мафии.");
    return;
  }

  if (uniqueSelectedMafia.has(mafiaTargetSelection.value)) {
    toast.warning("Мафия не может выбрать себя целью.");
    return;
  }

  roleActions.assignMafiaPlayers(selectedMafia);
  roleActions.mafiaTeamKill(mafiaTargetSelection.value);
  mafiaSelections.value = [];
  mafiaTargetSelection.value = "";
  onNextRole();
};

const executeAction = (actionName: string, arg1: string, arg2?: string) => {
  if (arg2 !== undefined && arg1 === arg2) {
    toast.warning("Игрок не может выбрать самого себя.");
    return;
  }

  if (arg2 === undefined && currentActionActor.value?.name === arg1) {
    toast.warning("Игрок не может выбрать самого себя.");
    return;
  }

  if (actionName === 'detectiveZero') {
    roleActions.detectiveZero(arg1);
  } else if (actionName === 'patrolZero') {
    roleActions.patrolZero(arg1);
  } else if (actionName === 'journalistZero') {
    roleActions.journalistZero(arg1);
  } else if (actionName === 'lucky-guyZero') {
    roleActions['lucky-guyZero'](arg1);
  } else if (actionName === 'detective') {
    roleActions.detective(arg1);
  } else if (actionName === 'mafia' && arg2 !== undefined) {
    roleActions.mafia(arg1, arg2);
  } else if (actionName === 'don' && arg2 !== undefined) {
    roleActions.don(arg1, arg2);
  } else if (actionName === 'maniacZero') {
    roleActions.maniacZero(arg1);
  } else if (actionName === 'maniac') {
    roleActions.maniacKill(currentActionActor.value?.name || '', arg1);
  } else if (actionName === 'sectarian') {
    roleActions.sectarian(arg1, arg2);
  } else if (actionName === 'journalist' && arg2 !== undefined) {
    roleActions.journalist(arg1, arg2);
  } else if (actionName === 'patrol' && arg2 !== undefined) {
    roleActions.patrol(arg1, arg2);
  } else if (actionName === 'doctor' && arg2 !== undefined) {
    roleActions.doctor(arg1, arg2);
  } else {
    return;
  }

  multiPlayersSelection.value = {
    firstSelection: "",
    secondSelection: "",
  };

  onNextRole();
};

const getRoleText = (roleKey: string) => {
  const texts: Record<string, string> = {
    detectiveZero: "Выберите игрока на роли детектива",
    patrolZero: "Выберите игрока на роли Патрульного",
    journalistZero: "Выберите игрока на роли журналиста",
    "lucky-guyZero": "Выберите игрока на роли счастливчика",
    mafia: `Выберите игроков мафии: ${mafiaSelectionCount.value}, затем общую цель`,
    don: "Выберите игрока на роли дона и его цель",
    sectarian: "Выберите сектанта. Второй сектант необязателен.",
    maniacZero: "Выберите игрока на роли маньяка",
    maniac: "Маньяк выбирает жертву",
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
    maniacZero: "Маньяк",
    maniac: "Маньяк",
    detective: "Детектив",
    journalist: "Журналист",
    patrol: "Патрульный",
    doctor: "Доктор",
  };
  return titles[roleKey] || "Первый круг";
};

const isDoubleAction = computed(() => {
  const doubleActionRoles = ['don', 'sectarian', 'journalist', 'patrol', 'doctor'];
  return doubleActionRoles.includes(currentRoleName.value);
});

const isSectarianSelection = computed(() => currentRoleName.value === 'sectarian');

const isMafiaSetupReady = computed(() => {
  const selectedMafia = selectedMafiaPlayers.value;

  return selectedMafia.length === mafiaSelectionCount.value
    && selectedMafia.every(Boolean)
    && new Set(selectedMafia).size === selectedMafia.length
    && Boolean(mafiaTargetSelection.value)
    && !selectedMafia.includes(mafiaTargetSelection.value);
});

const isDoubleActionReady = computed(() => {
  if (isSectarianSelection.value) {
    return Boolean(
      multiPlayersSelection.value.firstSelection
      && multiPlayersSelection.value.firstSelection !== multiPlayersSelection.value.secondSelection,
    );
  }

  return Boolean(
    multiPlayersSelection.value.firstSelection
    && multiPlayersSelection.value.secondSelection
    && multiPlayersSelection.value.firstSelection !== multiPlayersSelection.value.secondSelection,
  );
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

          <Transition name="role-card" mode="out-in">
            <div :key="currentRoleName" class="flex flex-col gap-6 relative z-10">
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
                <div v-if="isMafiaSelection" class="w-full flex flex-col gap-4">
                  <SharedUiDropDown
                    v-for="index in mafiaSelectionSlots"
                    :key="index"
                    v-model="mafiaSelections[index]"
                    :label="`Мафия ${index + 1}`"
                    :options="getMafiaPlayerOptions(index)"
                  />
                  <p
                    v-if="mafiaSelectionCount === 0"
                    class="text-sm text-amber-300"
                  >
                    Количество игроков мафии равно 0.
                  </p>
                  <SharedUiDropDown
                    v-model="mafiaTargetSelection"
                    label="Цель мафии"
                    :options="mafiaTargetOptions"
                  />
                  <SharedUiButton
                    class="mt-2 w-full"
                    text="Продолжить"
                    :disabled="!isMafiaSetupReady"
                    @click="executeMafiaSetup"
                  />
                </div>

                <div v-else-if="isDoubleAction" class="w-full flex flex-col gap-4">
                  <SharedUiDropDown
                    v-model="multiPlayersSelection.firstSelection"
                    :label="isSectarianSelection ? 'Сектант 1' : 'Игрок 1'"
                    :options="playerOptions"
                  />
                  <SharedUiDropDown
                    v-model="multiPlayersSelection.secondSelection"
                    :label="isSectarianSelection ? 'Игрок 2 (необязательно)' : 'Игрок 2 (Цель)'"
                    :options="selectedActorTargetOptions"
                  />
                  <p
                    v-if="multiPlayersSelection.firstSelection && multiPlayersSelection.firstSelection === multiPlayersSelection.secondSelection"
                    class="text-sm text-amber-300"
                  >
                    Игрок не может выбрать самого себя.
                  </p>
                  <SharedUiButton
                    class="mt-2 w-full"
                    :text="isSectarianSelection && !multiPlayersSelection.secondSelection ? 'Завершить выбор' : 'Продолжить'"
                    :disabled="!isDoubleActionReady"
                    @click="executeAction(currentRoleName, multiPlayersSelection.firstSelection, multiPlayersSelection.secondSelection)"
                  />
                </div>

                <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  <SharedUiButton
                    v-for="player in singleActionPlayerOptions"
                    :key="player.value"
                    :text="player.label"
                    class="w-full"
                    @click="executeAction(currentRoleName, player.value)"
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
          </Transition>
        </div>
      </ClientOnly>
    </div>
  </NuxtLayout>
</template>

<style scoped>
/* Role card slide-fade transition */
.role-card-enter-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.role-card-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.role-card-enter-from {
  opacity: 0;
  transform: translateX(24px);
}
.role-card-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}
</style>
