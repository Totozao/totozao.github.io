<script setup lang="ts">
const playersInfo = usePlayersInfo();
const router = useRouter();

const roleNames: Record<string, string> = {
    mafia: "Мафия",
    don: "Дон",
    sectarian: "Сектант",
    maniac: "Маньяк",
    detective: "Детектив",
    patrol: "Патрульный",
    doctor: "Доктор",
    journalist: "Журналист",
    "lucky-guy": "Везунчик",
    civilian: "Мирный житель",
};

const roleColors: Record<string, string> = {
    mafia: "from-red-600 to-rose-800",
    don: "from-red-700 to-red-900",
    sectarian: "from-purple-600 to-purple-900",
    maniac: "from-orange-600 to-red-800",
    detective: "from-blue-500 to-indigo-700",
    patrol: "from-cyan-500 to-blue-700",
    doctor: "from-emerald-500 to-green-700",
    journalist: "from-yellow-500 to-amber-700",
    "lucky-guy": "from-pink-500 to-rose-700",
    civilian: "from-neutral-500 to-neutral-700",
};

const donePlayers = ref<Set<string>>(new Set());
const selectedPlayer = ref<string>("");
const phase = ref<"select" | "reveal" | "done-one">("select");
const revealedRole = ref<string>("");
const animating = ref(false);

const remainingPlayers = computed(() =>
    playersInfo.activePlayers.filter((p) => !donePlayers.value.has(p.name)),
);

const allDone = computed(
    () => donePlayers.value.size === playersInfo.activePlayers.length,
);

const selectPlayer = (name: string) => {
    selectedPlayer.value = name;
    const player = playersInfo.activePlayers.find((p) => p.name === name);
    revealedRole.value = player?.role || "civilian";
    phase.value = "reveal";
    animating.value = true;
    setTimeout(() => {
        animating.value = false;
    }, 600);
};

const confirmSeen = () => {
    donePlayers.value = new Set([...donePlayers.value, selectedPlayer.value]);
    phase.value = allDone.value ? "select" : "done-one";
    selectedPlayer.value = "";
};

const continueNext = () => {
    phase.value = "select";
};

const goToGame = () => {
    playersInfo.fillMissingRoles();
    router.push("/game");
};

useHead({
    title: "Мафия - Раздача ролей",
    meta: [{ name: "description", content: "Каждый игрок узнаёт свою роль" }],
});
</script>

<template>
    <NuxtLayout>
        <div
            class="flex flex-col items-center gap-8 w-full max-w-lg mx-auto py-8 px-4"
        >
            <div class="text-center space-y-2">
                <h1
                    class="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"
                >
                    Раздача ролей
                </h1>
                <p class="text-neutral-400 font-medium">
                    {{
                        allDone
                            ? "Все роли розданы!"
                            : `Осталось: ${remainingPlayers.length} из ${playersInfo.activePlayers.length}`
                    }}
                </p>
            </div>
            <TransitionGroup name="flid" mode="out-in">
                <ClientOnly>
                    <!-- SELECT PHASE -->
                    <div
                        v-if="phase === 'select' && !allDone"
                        class="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col gap-4"
                    >
                        <p class="text-neutral-300 font-medium text-center">
                            Кто передо мной?
                        </p>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                v-for="player in remainingPlayers"
                                :key="player.name"
                                class="rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-3 text-left font-semibold text-neutral-200 hover:border-indigo-500/60 hover:bg-neutral-700 transition-all"
                                @click="selectPlayer(player.name)"
                            >
                                {{ player.name }}
                            </button>
                        </div>
                    </div>

                    <div
                        v-if="phase === 'reveal'"
                        key="reveal"
                        class="w-full rounded-2xl shadow-2xl overflow-hidden"
                        :class="
                            animating
                                ? 'scale-95 opacity-0'
                                : 'scale-100 opacity-100'
                        "
                        style="
                            transition:
                                transform 0.5s ease,
                                opacity 0.5s ease;
                        "
                    >
                        <div
                            class="flex flex-col items-center justify-center gap-6 p-10 bg-gradient-to-br text-white min-h-[320px]"
                            :class="
                                roleColors[revealedRole] || roleColors.civilian
                            "
                        >
                            <p
                                class="text-sm uppercase tracking-[0.3em] text-white/60"
                            >
                                Ваша роль
                            </p>
                            <h2
                                class="text-5xl font-extrabold text-center drop-shadow-lg"
                            >
                                {{ roleNames[revealedRole] || revealedRole }}
                            </h2>
                            <p class="text-white/70 text-sm text-center">
                                Запомните свою роль и никому не показывайте
                                экран.
                            </p>
                            <button
                                class="mt-4 rounded-xl border border-white/30 bg-white/10 px-8 py-3 font-semibold text-white hover:bg-white/20 transition-all"
                                @click="confirmSeen"
                            >
                                Понял, передаю устройство
                            </button>
                        </div>
                    </div>

                    <!-- DONE-ONE PHASE (screen cleared before next player) -->
                    <div
                        v-if="phase === 'done-one'"
                        class="w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-10 shadow-xl flex flex-col items-center gap-6 min-h-[280px] justify-center"
                    >
                        <div
                            class="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center"
                        >
                            <span class="text-3xl">✓</span>
                        </div>
                        <p
                            class="text-neutral-200 font-semibold text-lg text-center"
                        >
                            Роль получена. Передайте устройство следующему
                            игроку.
                        </p>
                        <SharedUiButton
                            text="Следующий игрок"
                            class="w-full max-w-xs"
                            @click="continueNext"
                        />
                    </div>

                    <!-- ALL DONE -->
                    <div
                        v-if="allDone"
                        class="w-full bg-neutral-900 border border-emerald-500/30 rounded-2xl p-8 shadow-xl flex flex-col items-center gap-6 text-center"
                    >
                        <h2 class="text-2xl font-bold text-emerald-400">
                            Все роли розданы!
                        </h2>
                        <p class="text-neutral-400">
                            Каждый игрок знает свою роль. Передайте устройство
                            ведущему и начните игру.
                        </p>
                        <SharedUiButton
                            text="Начать игру"
                            class="w-full max-w-xs !bg-gradient-to-r !from-rose-600 !to-purple-600 border-none shadow-[0_0_30px_rgba(225,29,72,0.3)]"
                            @click="goToGame"
                        />
                    </div>
                </ClientOnly>
            </TransitionGroup>
            <!-- Progress dots -->
            <div class="flex gap-2 flex-wrap justify-center">
                <div
                    v-for="player in playersInfo.activePlayers"
                    :key="player.name"
                    class="w-2.5 h-2.5 rounded-full transition-all duration-300"
                    :class="
                        donePlayers.has(player.name)
                            ? 'bg-emerald-400'
                            : 'bg-neutral-700'
                    "
                    :title="player.name"
                />
            </div>
        </div>
    </NuxtLayout>
</template>
