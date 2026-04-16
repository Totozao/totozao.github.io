import type { IPlayer } from "~/models/playerInfo";

export const usePlayersInfo = defineStore(
  "playersInfo",
  () => {
    const activePlayers = ref<IPlayer[]>([]);
    const lastCirclePlayers = ref<IPlayer[]>([]);
    const addPlayer = (playerName: string) => {
      if (activePlayers.value.some((player) => player.name === playerName)) {
        throw new Error("Игрок с таким именем уже существует");
      }
      activePlayers.value.push({
        name: playerName,
        role: "",
        isAlive: true,
      });
    };

    const removePlayer = (playerName: string) => {
      activePlayers.value = activePlayers.value.filter(
        (player) => player.name !== playerName,
      );
    };

    const saveLastCirclePlayers = () => {
      lastCirclePlayers.value = activePlayers.value.filter(
        (player) => player.isAlive,
      );
    };

    return {
      activePlayers,
      lastCirclePlayers,
      addPlayer,
      removePlayer,
      saveLastCirclePlayers,
    };
  },
  {
    persist: {
      storage: piniaPluginPersistedstate.localStorage(),
    },
  },
);
