<script setup lang="ts">
import { computed, ref } from 'vue';
import { usePlayersInfo } from '~/stores/playersInfo.store';
import { useGameEngine } from '~/composables/useGameEngine';
import { useToast } from '~/composables/useToast';

const playersInfo = usePlayersInfo();
const { roleActions } = useGameEngine();
const toast = useToast();

const nightRoleOrder = ['mafia', 'don', 'sectarian', 'maniac', 'detective', 'patrol', 'doctor', 'journalist'];
const isNightActionModalVisible = ref(false);
const isNightLogModalVisible = ref(false);

const currentActiveRolesForNight = computed(() => {
  return nightRoleOrder.filter(r => {
    if (!playersInfo.activeRoles.includes(r) || playersInfo.isRoleInactive({ value: r })) {
      return false;
    }
    
    if (r === 'patrol') {
      const detectives = playersInfo.activePlayers.filter(p => p.role === 'detective');
      const isDetectiveDeadOrGone = detectives.length === 0 || detectives.every(p => p.lives <= 0);
      return isDetectiveDeadOrGone;
    }
    
    return true;
  });
});

const currentNightRoleIndex = ref(0);
const currentNightRole = computed(() => currentActiveRolesForNight.value[currentNightRoleIndex.value]);

const isNightPhase = computed(() => playersInfo.currentGameStep === 'night');
const isDayPhase = computed(() => playersInfo.currentGameStep === 'day');
const lastNightActions = computed(() => playersInfo.getLastNightActions() || []);
const isMafiaNightRole = computed(() => currentNightRole.value === 'mafia');
const currentRoleActor = computed(() => {
  const role = currentNightRole.value;
  return playersInfo.activePlayers.find(p => p.role === role && p.lives > 0);
});
const mafiaTeamMembersText = computed(() => {
  return playersInfo.activePlayers
    .filter(p => p.role === 'mafia' && p.lives > 0)
    .map(p => p.name)
    .join(', ');
});
const targetPlayerOptions = computed(() => {
  return playersInfo.activePlayers
    .filter(p => {
      if (isMafiaNightRole.value) {
        return p.role !== 'mafia';
      }

      return p.name !== currentRoleActor.value?.name;
    })
    .map(p => ({ label: p.name, value: p.name }));
});

const isRoleHolderDead = (role: string) => {
  const holders = playersInfo.activePlayers.filter(p => p.role === role);
  if (holders.length === 0) return true;
  return holders.every(p => p.lives <= 0);
};

// Selection state
const multiPlayersSelection = ref({
  firstSelection: '',
  secondSelection: ''
});

const isDoubleTarget = computed(() => currentNightRole.value === 'journalist');
const isSectarianNightRole = computed(() => currentNightRole.value === 'sectarian');
const isNightActionReady = computed(() => {
  if (!currentNightRole.value) return false;
  if (!isDoubleTarget.value) return true;
  return Boolean(
    multiPlayersSelection.value.firstSelection
    && multiPlayersSelection.value.secondSelection
    && multiPlayersSelection.value.firstSelection !== multiPlayersSelection.value.secondSelection
    && multiPlayersSelection.value.firstSelection !== currentRoleActor.value?.name
    && multiPlayersSelection.value.secondSelection !== currentRoleActor.value?.name,
  );
});

const getRoleTitle = (roleKey?: string) => {
  const titles: Record<string, string> = {
    mafia: 'Мафия',
    don: 'Дон',
    sectarian: 'Сектант',
    maniac: 'Маньяк',
    detective: 'Детектив',
    journalist: 'Журналист',
    patrol: 'Патрульный',
    doctor: 'Доктор',
  };
  return roleKey ? titles[roleKey] || roleKey : 'Ночное действие';
};

const finishNight = () => {
  playersInfo.currentNight++;
  checkWinConditions();
  isNightActionModalVisible.value = false;
  
  if (playersInfo.currentGameStep !== 'night') return; // game over
  
  playersInfo.currentGameStep = 'day';
  currentNightRoleIndex.value = 0;
};

const nextNightRole = () => {
  multiPlayersSelection.value = { firstSelection: '', secondSelection: '' };
  
  if (currentNightRoleIndex.value < currentActiveRolesForNight.value.length - 1) {
    currentNightRoleIndex.value++;
  } else {
    finishNight();
  }
};

const executeNightAction = (target1?: string, target2?: string) => {
  const role = currentNightRole.value;
  const actor = isMafiaNightRole.value ? 'Мафия' : currentRoleActor.value?.name || 'Неизвестный';
  
  if (role && isRoleHolderDead(role)) {
    nextNightRole();
    return;
  }

  if (target1 === actor || target2 === actor) {
    toast.warning('Игрок не может выбрать самого себя.');
    return;
  }

  if (role === 'journalist' && target1 && target2) {
    roleActions.journalist(target1, target2);
  } else if (role === 'detective' && target1) {
    roleActions.detective(target1);
  } else if (role === 'mafia' && target1) {
    roleActions.mafiaTeamKill(target1);
  } else if (role === 'maniac' && target1) {
    roleActions.maniacKill(actor, target1);
  } else if (role === 'don' && target1) {
    roleActions.don(actor, target1);
  } else if (role === 'sectarian' && target1) {
    roleActions.sectarian(actor, target1);
  } else if (role === 'patrol' && target1) {
    roleActions.patrol(actor, target1);
  } else if (role === 'doctor' && target1) {
    roleActions.doctor(actor, target1);
  }

  nextNightRole();
};

const skipNightAction = () => {
  const role = currentNightRole.value;
  const actor = isMafiaNightRole.value
    ? 'Мафия'
    : playersInfo.activePlayers.find(p => p.role === role && p.lives > 0)?.name || getRoleTitle(role);

  if (role) {
    playersInfo.createNightAction(
      { affectedPlayer: '', actionPlayer: actor, action: 'skip' },
      playersInfo.currentNight,
    );
  }

  nextNightRole();
};

const getRoleText = (roleKey: string) => {
  const texts: Record<string, string> = {
    mafia: "Мафия: выберите жертву",
    don: "Дон: выберите игрока для проверки",
    sectarian: "Сектант: выберите игрока для вербовки или пропустите выбор цели",
    maniac: "Маньяк: выберите жертву",
    detective: "Детектив: выберите игрока для проверки",
    journalist: "Журналист: выберите двух игроков",
    patrol: "Патрульный: выберите игрока для проверки",
    doctor: "Доктор: выберите игрока для лечения",
  };
  return texts[roleKey] || "Сделайте выбор";
};

// --- DAY PHASE (VOTING) ---
const votes = ref<Record<string, number>>({});

const startVoting = () => {
  playersInfo.currentGameStep = 'voting';
  votes.value = {};
  playersInfo.activePlayers.forEach(p => {
    votes.value[p.name] = 0;
  });
};

const recordVote = (target: string) => {
  if (votes.value[target] !== undefined) {
    votes.value[target]++;
  }
};

const skipVoting = () => {
  toast.info("Голосование пропущено. Никто не изгнан.");
  finishVotingPhase();
};

const showFortuneWheel = ref(false);
const fortuneWheelActivePlayer = ref('');

const finishVotingPhase = (kickedPlayer?: string, wasSavedByFortune: boolean = false) => {
  if (kickedPlayer && !wasSavedByFortune) {
    const p = playersInfo.activePlayers.find(p => p.name === kickedPlayer);
    if (p) {
      p.lives = 0;
      toast.error(`Игрок ${kickedPlayer} изгнан голосованием!`);
    }
  }

  showFortuneWheel.value = false;
  playersInfo.clearDeadPlayers();
  checkWinConditions();
  
  if (playersInfo.currentGameStep !== 'day' && playersInfo.currentGameStep !== 'voting') {
    // game over handled in checkWinConditions
  } else {
    playersInfo.saveLastCirclePlayers(playersInfo.activePlayers);
    currentNightRoleIndex.value = 0;
    playersInfo.currentGameStep = 'night';
  }
};

const resolveVoting = () => {
  let maxVotes = -1;
  let kickedPlayer = '';
  let isTie = false;

  for (const [playerName, count] of Object.entries(votes.value)) {
    if (count > maxVotes) {
      maxVotes = count;
      kickedPlayer = playerName;
      isTie = false;
    } else if (count === maxVotes && maxVotes > 0) {
      isTie = true;
    }
  }

  if (maxVotes === 0 || isTie || !kickedPlayer) {
    toast.info("Голосование пропущено или ничья. Никто не изгнан.");
    finishVotingPhase();
  } else {
    // Circle of Fortune
    const circleRounds = parseInt(playersInfo.circleOfFortuneRounds.toString()) || 2;
    if (playersInfo.currentNight <= circleRounds) {
      const alivePlayers = playersInfo.activePlayers.filter(p => p.lives > 0);
      const savedPlayer = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
      
      showFortuneWheel.value = true;
      playersInfo.currentGameStep = 'voting'; // keep in voting visually but show wheel
      
      let spins = 0;
      const maxSpins = 25;
      let delay = 50;
      
      const spin = () => {
        if (spins < maxSpins) {
           const randomP = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
           fortuneWheelActivePlayer.value = randomP?.name || '';
           spins++;
           delay += 15; // smooth slow down
           setTimeout(spin, delay);
        } else {
           fortuneWheelActivePlayer.value = savedPlayer?.name || '';
           setTimeout(() => {
             const wasKickedPlayerSaved = savedPlayer?.name === kickedPlayer;

             if (wasKickedPlayerSaved) {
               toast.success(`Колесо Фортуны спасло игрока: ${kickedPlayer}! Никто не изгнан.`, 'Колесо Фортуны', 6000);
             } else {
               toast.info(`Колесо Фортуны выбрало игрока: ${savedPlayer?.name || ''}. ${kickedPlayer} изгнан голосованием.`, 'Колесо Фортуны', 6000);
             }

             finishVotingPhase(kickedPlayer, wasKickedPlayerSaved);
           }, 1500);
        }
      };
      
      spin();
    } else {
      finishVotingPhase(kickedPlayer, false);
    }
  }
};

// --- WIN CONDITIONS ---
const winnerMessage = ref<string | null>(null);

const checkWinConditions = () => {
  playersInfo.clearDeadPlayers();
  const alive = playersInfo.activePlayers;
  
  if (alive.length === 0) {
    winnerMessage.value = "Ничья! Все мертвы.";
    playersInfo.currentGameStep = 'day'; // Stop loop
    return;
  }

  const negativeRoles = ['mafia', 'don', 'sectarian', 'maniac'];
  const isNegative = (r: string) => negativeRoles.includes(r);
  
  const aliveNegatives = alive.filter(p => isNegative(p.role));
  const aliveCivilians = alive.filter(p => !isNegative(p.role));

  // Civilians Win: All negative roles are dead or kicked
  if (aliveNegatives.length === 0) {
    winnerMessage.value = "Победа Мирных! Все мафии и сектанты уничтожены.";
    playersInfo.currentGameStep = 'day';
    return;
  }

  // Civilians Win (Showdown): Exactly two players left: Detective/Patrol and a negative player
  if (alive.length === 2) {
    const hasDetectiveOrPatrol = alive.some(p => p.role === 'detective' || p.role === 'patrol');
    const hasNegative = alive.some(p => isNegative(p.role));
    
    if (hasDetectiveOrPatrol && hasNegative) {
      winnerMessage.value = "Победа Мирных (Шоудаун)! Представитель закона одолел преступника 1 на 1.";
      playersInfo.currentGameStep = 'day';
      return;
    }
  }

  // Negative Team Wins: Only 1 civilian left alive alongside surviving members of a negative team.
  // Wait, if there are multiple negative teams (mafia vs sectarian)? 
  // Let's just check if there's <= 1 civilian and > 0 negatives.
  if (aliveCivilians.length <= 1 && aliveNegatives.length >= 1) {
    // If there are sectarians AND mafias, it might be a tie or they fight each other.
    // The prompt just says: "Negative Team Wins: Only 1 non-negative (civilian) player is left alive, alongside surviving members of a negative team."
    winnerMessage.value = "Победа Темных сил! Город захвачен.";
    playersInfo.currentGameStep = 'day';
    return;
  }
};

useHead({
  title: "Мафия - Игра",
  meta: [
    { name: "description", content: "Играйте в Мафию и узнайте, кто из вас мафия" },
  ],
});
</script>

<template>
  <NuxtLayout>
    <div class="flex flex-col items-center gap-8 w-full max-w-lg mx-auto py-8">
      
      <div v-if="winnerMessage" class="text-center space-y-4 w-full bg-neutral-900 border border-green-500 rounded-2xl p-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
        <h1 class="text-3xl font-bold text-green-400">Игра Окончена</h1>
        <p class="text-xl text-neutral-200">{{ winnerMessage }}</p>
        <SharedUiButton text="Новая игра" @click="$router.push('/')" class="mt-4" />
      </div>

      <template v-else>
        <!-- NIGHT PHASE -->
        <template v-if="isNightPhase">
          <div class="text-center space-y-2">
            <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-500 to-indigo-400 bg-clip-text text-transparent">
              Ночь {{ playersInfo.currentNight }}
            </h1>
            <p class="text-neutral-400 font-medium">Просыпаются ночные жители...</p>
          </div>

          <ClientOnly>
            <div class="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 pointer-events-none"></div>

              <Transition name="role-card" mode="out-in">
                <div :key="currentNightRole" class="flex flex-col gap-6 relative z-10">
                  <div class="flex items-start justify-between gap-4">
                    <div class="space-y-2">
                      <p class="text-xs uppercase tracking-[0.3em] text-blue-300/70">Текущий ход</p>
                      <h2 class="text-2xl font-bold text-neutral-100">
                        {{ currentNightRole ? getRoleTitle(currentNightRole) : 'Ночь без действий' }}
                      </h2>
                      <p class="text-neutral-400">
                        {{ currentNightRole ? getRoleText(currentNightRole) : 'Нет активных ролей для этой ночи.' }}
                      </p>
                      <p
                        v-if="isMafiaNightRole && mafiaTeamMembersText"
                        class="w-fit rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-200"
                      >
                        Мафия действует командой: {{ mafiaTeamMembersText }}. Выберите одну общую жертву.
                      </p>
                      <p
                        v-else-if="currentRoleActor"
                        class="w-fit rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-200"
                      >
                        {{ currentRoleActor.name }} на роли {{ getRoleTitle(currentNightRole) }} жив и делает ход.
                      </p>
                    </div>
                    <span class="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-sm font-semibold text-blue-200">
                      {{ currentNightRoleIndex + 1 }}/{{ Math.max(currentActiveRolesForNight.length, 1) }}
                    </span>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <SharedUiButton
                      class="w-full !bg-gradient-to-r !from-blue-600 !to-indigo-600 border-none shadow-[0_0_24px_rgba(37,99,235,0.25)]"
                      text="Открыть действие"
                      :disabled="!currentNightRole"
                      @click="isNightActionModalVisible = true"
                    />
                    <SharedUiButton
                      class="w-full !bg-neutral-800 !text-neutral-300 hover:!bg-neutral-700"
                      text="Завершить ночь"
                      @click="finishNight"
                    />
                  </div>
                </div>
              </Transition>
            </div>
          </ClientOnly>
        </template>

        <!-- DAY PHASE -->
        <template v-else-if="isDayPhase">
          <div class="text-center space-y-2">
            <h1 class="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-400 bg-clip-text text-transparent">
              День {{ playersInfo.currentNight }}
            </h1>
            <p class="text-neutral-400 font-medium">Город просыпается. Обсуждение и голосование.</p>
          </div>

          <div class="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl text-center flex flex-col gap-4">
            <h2 class="text-xl font-bold text-neutral-200">Дневное обсуждение</h2>
            <p class="text-neutral-400">Живые игроки: {{ playersInfo.activePlayers.length }}</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              <SharedUiButton text="Перейти к голосованию" @click="startVoting" class="w-full" />
              <SharedUiButton
                text="Лог прошлой ночи"
                class="w-full !bg-neutral-800 !text-neutral-300 hover:!bg-neutral-700"
                :disabled="lastNightActions.length === 0"
                @click="isNightLogModalVisible = true"
              />
            </div>
          </div>
        </template>

        <!-- VOTING PHASE -->
        <template v-else-if="playersInfo.currentGameStep === 'voting'">
          <!-- FORTUNE WHEEL ANIMATION -->
          <div v-if="showFortuneWheel" class="text-center space-y-4 w-full bg-neutral-900 border border-purple-500 rounded-2xl p-8 shadow-[0_0_30px_rgba(168,85,247,0.3)] flex flex-col items-center justify-center min-h-[350px]">
            <h1 class="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
              Колесо Фортуны
            </h1>
            <p class="text-neutral-400 font-medium mb-8">Боги решают судьбу...</p>
            
            <div class="relative w-48 h-48 rounded-full border-4 border-purple-500 flex items-center justify-center bg-neutral-800 shadow-[0_0_20px_rgba(168,85,247,0.4)] overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 animate-spin" style="animation-duration: 3s;"></div>
              <span class="text-2xl font-bold text-neutral-100 z-10 transition-all duration-75 text-center px-4 break-words">
                {{ fortuneWheelActivePlayer || '...' }}
              </span>
            </div>
          </div>

          <!-- NORMAL VOTING -->
          <div v-else class="w-full flex flex-col gap-6">
            <div class="text-center space-y-2">
              <h1 class="text-3xl font-bold text-red-500">Голосование</h1>
              <p class="text-neutral-400 font-medium">Выберите кого изгнать</p>
            </div>

            <div class="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col gap-6">
              <div v-for="player in playersInfo.activePlayers" :key="player.name" class="flex justify-between items-center bg-neutral-800 p-3 rounded-xl">
                <span class="text-neutral-200 font-medium">{{ player.name }}</span>
                <div class="flex items-center gap-4">
                  <span class="text-rose-400 font-bold text-lg">{{ votes[player.name] }}</span>
                  <SharedUiButton text="+ Голос" @click="recordVote(player.name)" class="!py-1 !px-3 text-sm" />
                </div>
              </div>

              <div class="pt-4 border-t border-neutral-800 flex flex-col gap-3">
                <SharedUiButton text="Завершить голосование" @click="resolveVoting" class="w-full !bg-rose-600" />
                <SharedUiButton text="Пропустить голосование" @click="skipVoting" class="w-full !bg-neutral-700" />
              </div>
            </div>
          </div>
        </template>

      </template>

      <SharedUiModal :isModalVisible="isNightActionModalVisible">
        <Transition name="role-card" mode="out-in">
          <div :key="currentNightRole" class="relative z-10 flex flex-col gap-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs uppercase tracking-[0.3em] text-blue-300/70">Ночное действие</p>
                <h2 class="mt-2 text-2xl font-bold text-neutral-100">{{ getRoleTitle(currentNightRole) }}</h2>
                <p class="mt-2 text-sm text-neutral-400">{{ currentNightRole ? getRoleText(currentNightRole) : 'Нет доступных действий.' }}</p>
                <p
                  v-if="isMafiaNightRole && mafiaTeamMembersText"
                  class="mt-3 w-fit sm:rounded-full max-sm:rounded-[16px] border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-200"
                >
                  Мафия действует командой: {{ mafiaTeamMembersText }}. Игроков мафии нельзя выбрать целью.
                </p>
                <p
                  v-else-if="currentRoleActor"
                  class="mt-3 w-fit rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-200"
                >
                  Ходит {{ currentRoleActor.name }}. Его нельзя выбрать целью.
                </p>
                <p
                  v-if="isSectarianNightRole"
                  class="mt-3 text-sm text-amber-200"
                >
                  Сектанты могут не выбирать цель этой ночью.
                </p>
              </div>
              <button
                class="rounded-full border border-neutral-700 bg-neutral-800/80 px-3 py-1 text-sm text-neutral-300 hover:border-blue-400/60 hover:text-blue-100 transition-colors"
                @click="isNightActionModalVisible = false"
              >
                Закрыть
              </button>
            </div>

            <div class="rounded-2xl border border-blue-400/10 bg-blue-400/5 p-4">
              <div class="w-full flex flex-col gap-4" v-if="isDoubleTarget">
                <SharedUiDropDown
                  v-model="multiPlayersSelection.firstSelection"
                  label="Игрок 1"
                  :options="targetPlayerOptions"
                />
                <SharedUiDropDown
                  v-model="multiPlayersSelection.secondSelection"
                  label="Игрок 2"
                  :options="targetPlayerOptions"
                />
                <p
                  v-if="multiPlayersSelection.firstSelection && multiPlayersSelection.firstSelection === multiPlayersSelection.secondSelection"
                  class="text-sm text-amber-300"
                >
                  Выберите двух разных игроков.
                </p>
                <SharedUiButton
                  class="mt-2 w-full"
                  text="Продолжить"
                  @click="executeNightAction(multiPlayersSelection.firstSelection, multiPlayersSelection.secondSelection)"
                  :disabled="!isNightActionReady"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full" v-else>
                <SharedUiButton
                  v-for="player in targetPlayerOptions"
                  :key="player.value"
                  :text="player.label"
                  class="w-full"
                  @click="executeNightAction(player.value)"
                />
              </div>
            </div>

            <div class="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row gap-3">
              <SharedUiButton
                class="w-full !bg-neutral-800 !text-neutral-400 hover:!bg-neutral-700"
                :text="isSectarianNightRole ? 'Не выбирать цель' : 'Пропустить действие'"
                @click="skipNightAction"
              />
              <SharedUiButton
                class="w-full !bg-neutral-800 !text-neutral-400 hover:!bg-neutral-700"
                text="Закрыть"
                @click="isNightActionModalVisible = false"
              />
            </div>
          </div>
        </Transition>
      </SharedUiModal>

      <SharedUiModal :isModalVisible="isNightLogModalVisible">
        <div class="relative z-10 flex flex-col gap-5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-[0.3em] text-purple-300/70">История</p>
              <h2 class="mt-2 text-2xl font-bold text-neutral-100">Лог прошлой ночи</h2>
              <p class="mt-2 text-sm text-neutral-400">Все действия, которые были записаны в последнюю ночь.</p>
            </div>
            <button
              class="rounded-full border border-neutral-700 bg-neutral-800/80 px-3 py-1 text-sm text-neutral-300 hover:border-purple-400/60 hover:text-purple-100 transition-colors"
              @click="isNightLogModalVisible = false"
            >
              Закрыть
            </button>
          </div>

          <div v-if="lastNightActions.length" class="flex flex-col gap-3">
            <GameNightLogCard
              v-for="(action, i) of lastNightActions"
              :key="`${action.action}-${i}`"
              :action="action"
            />
          </div>
          <div v-else class="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 text-center text-neutral-400">
            Лог пуст.
          </div>
        </div>
      </SharedUiModal>
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
