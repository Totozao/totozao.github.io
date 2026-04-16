import type { IPlayer } from "~/models/playerInfo";

export const usePlayersInfo = defineStore(
  "playersInfo",
  () => {
    const activePlayers = ref<IPlayer[]>([]);
    const lastCirclePlayers = ref<string[]>([]);
    const addPlayer = (playerName: string) => {
      activePlayers.value.push({
        name: playerName,
        role: "",
        id: crypto.randomUUID(),
        isAlive: true,
      });
    };

    const removePlayer = (playerId: string) => {
      activePlayers.value = activePlayers.value.filter(
        (player) => player.id !== playerId,
      );
    };

    return {
      activePlayers,
      lastCirclePlayers,
      addPlayer,
      removePlayer,
    };
  },
  {
    persist: {
      storage: piniaPluginPersistedstate.sessionStorage(),
    },
  },
);
