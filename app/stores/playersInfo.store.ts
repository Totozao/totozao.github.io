import {
  type INight,
  type INightAction,
  type IPlayer,
  type IRole,
} from "~/models/playerInfo";
import rolesData from "@/assets/data/roles.json";

// Explicitly type the roles object
const roles: Record<string, any> = rolesData;

export const usePlayersInfo = defineStore(
  "playersInfo",
  () => {
    const activePlayers = ref<IPlayer[]>([]);
    const lastCirclePlayers = ref<IPlayer[]>([]);
    const maxSectarians = ref<string>("2");
    const inactiveRoles = ref<{ [key: string]: boolean }>({});
    const players = ref<IPlayer[]>([]);
    const currentNight = ref<number>(0);
    const nightsLogs = ref<INight[]>([]);
    const amountOfMafia = ref<string>("1");
    const currentGameStep = ref<"voting" | "night" | "day">("voting");
    const currentRestrictedMembersCount = ref<{
      mafia: number;
      sectarian: number;
    }>({
      mafia: 0,
      sectarian: 0,
    });

    const activeRoles = ref<string[]>([]);
    const currentRole = ref<string | undefined>(undefined);

    const setActiveRoles = () => {
      let roleNames = Object.keys(roles);
      let excludingRoles = ["lucky-guy", "civilian"];
      activeRoles.value = roleNames.filter((role) => !excludingRoles.includes(role));
    };

    const getCurrentNightActions = () => {
      return nightsLogs.value[currentNight.value]?.actions || null;
    };

    const fillMissingRoles = () => {
      activePlayers.value = activePlayers.value.map((player) => ({
        name: player.name,
        role: player.role || "civilian",
        lives: player.lives,
      }));
    };

    const startGame = () => {
      currentGameStep.value = "day";
      clearDeadPlayers();
      fillMissingRoles();
      nightsLogs.value = [];
    };

    const handleNextRole = (roleList: string[]) => {
      const roleIndex = roleList.findIndex((role) => role === currentRole.value);
      if (roleIndex === roleList.length - 1) {
        currentRole.value = undefined;
      } else {
        const playerWithNextRole = activePlayers.value.filter(
          (player) => player.role === roleList[roleIndex + 1]
        );
        if (playerWithNextRole.length > 0) {
          currentRole.value = roleList[roleIndex + 1];
        } else {
          handleNextRole(roleList);
        }
      }
    };

    const getPlayersWithRole = (role: string) => {
      return activePlayers.value.filter((player) => player.role === role);
    };

    const addPlayer = (playerName: string) => {
      if (players.value.some((player) => player.name === playerName)) {
        throw new Error("Игрок с таким именем уже существует");
      }
      players.value.push({
        name: playerName,
        role: "",
        lives: 1,
      });
    };

    const updatePlayerData = (player: IPlayer) => {
      const playerIndex = activePlayers.value.findIndex((p) => p.name === player.name);
      if (playerIndex !== -1) {
        activePlayers.value[playerIndex] = player;
      }
    };

    const isRoleInactive = (changingRole: IRole) => {
      return inactiveRoles.value[changingRole.value];
    };

    const resetActivePlayers = () => {
      activePlayers.value = [...players.value];
    };

    const createNightAction = (action: INightAction, nightIndex: number) => {
      if (nightsLogs.value[nightIndex]) {
        nightsLogs.value[nightIndex].actions.push(action);
      } else {
        nightsLogs.value.push({
          indexOfNight: nightIndex,
          actions: [action],
        });
      }
    };

    const mutateInactiveRoles = (changingRole: string) => {
      inactiveRoles.value[changingRole] = !inactiveRoles.value[changingRole];
    };

    const setPlayerRole = (playerName: string, role: string, lives?: number) => {
      const player = activePlayers.value.find((p) => p.name === playerName);
      if (player) {
        player.role = role;
        if (lives !== undefined) {
          player.lives = lives;
        }
      }
    };

    const removePlayer = (playerName: string) => {
      players.value = players.value.filter((player) => player.name !== playerName);
    };

    const clearDeadPlayers = () => {
      activePlayers.value = activePlayers.value.filter((player) => player.lives > 0);
    };

    const saveLastCirclePlayers = () => {
      lastCirclePlayers.value = [...players.value];
    };

    const resetStore = () => {
      activePlayers.value = [];
    };

    const getPlayerRole = (playerName: string): string | undefined => {
      return activePlayers.value.find((player) => player.name === playerName)?.role;
    };

    return {
      activePlayers,
      lastCirclePlayers,
      maxSectarians,
      amountOfMafia,
      nightsLogs,
      inactiveRoles,
      currentGameStep,
      players,
      currentRestrictedMembersCount,
      activeRoles,
      fillMissingRoles,
      getCurrentNightActions,
      startGame,
      getPlayersWithRole,
      setActiveRoles,
      clearDeadPlayers,
      resetActivePlayers,
      updatePlayerData,
      createNightAction,
      isRoleInactive,
      mutateInactiveRoles,
      setPlayerRole,
      addPlayer,
      removePlayer,
      saveLastCirclePlayers,
      resetStore,
      getPlayerRole,
    };
  },
  {
    persist: {
      storage: piniaPluginPersistedstate.localStorage(),
    },
  }
);
