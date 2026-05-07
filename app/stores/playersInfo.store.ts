import type { INight, INightAction, IPlayer, IRole } from "~/models/playerInfo";
import rolesData from "@/assets/data/roles.json";

// Explicitly type the roles object
const roles: Record<string, IRole> = rolesData;
const clonePlayers = (players: IPlayer[]) => players.map((player) => ({ ...player }));

export const usePlayersInfo = defineStore(
  "playersInfo",
  () => {
    const activePlayers = ref<IPlayer[]>([]);
    const lastCirclePlayers = ref<IPlayer[]>([]);
    const maxSectarians = ref<string>("2");
    const amountOfMafia = ref<string>("1");
    const circleOfFortuneRounds = ref<number>(2);
    const inactiveRoles = ref<{ [key: string]: boolean }>({});
    const players = ref<IPlayer[]>([]);
    const currentNight = ref<number>(0);
    const nightsLogs = ref<INight[]>([]);
    const currentGameStep = ref<"voting" | "night" | "day">("voting");
    const currentRestrictedMembersCount = ref<{
      mafia: number;
      sectarian: number;
    }>({
      mafia: 0,
      sectarian: 0,
    });
    
    const totalSectariansCreated = ref<number>(0);
    const isMasterMode = ref<boolean>(false);

    const activeRoles = ref<string[]>([]);
    const currentRole = ref<string | undefined>(undefined);

    const setActiveRoles = () => {
      const roleNames = Object.keys(roles);
      const excludingRoles = ["lucky-guy", "civilian"];
      activeRoles.value = roleNames.filter(
        (role) => !excludingRoles.includes(role),
      );
    };

    const getNightActions = (nightIndex: number) => {
      return nightsLogs.value.find((night) => night.indexOfNight === nightIndex)?.actions || null;
    };

    const getCurrentNightActions = () => {
      return getNightActions(currentNight.value);
    };

    const getLastNightActions = () => {
      const latestNight = [...nightsLogs.value]
        .filter((night) => night.indexOfNight <= currentNight.value)
        .sort((a, b) => b.indexOfNight - a.indexOfNight)[0];

      return latestNight?.actions || null;
    };

    const fillMissingRoles = () => {
      activePlayers.value = activePlayers.value.map((player) => ({
        name: player.name,
        role: player.role || "civilian",
        lives: player.lives,
      }));
    };

    const startGame = () => {
      currentNight.value = 0;
      currentGameStep.value = "day";
      clearDeadPlayers();
      fillMissingRoles();
      nightsLogs.value = [];
      lastCirclePlayers.value = [];
      totalSectariansCreated.value = 0;
    };

    const handleNextRole = (roleList: string[]) => {
      const roleIndex = roleList.findIndex(
        (role) => role === currentRole.value,
      );
      if (roleIndex === roleList.length - 1) {
        currentRole.value = undefined;
      } else {
        const playerWithNextRole = activePlayers.value.filter(
          (player) => player.role === roleList[roleIndex + 1],
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
      const playerIndex = activePlayers.value.findIndex(
        (p) => p.name === player.name,
      );
      if (playerIndex !== -1) {
        activePlayers.value[playerIndex] = player;
      }
    };

    const isRoleInactive = (changingRole: Pick<IRole, "value">) => {
      return inactiveRoles.value[changingRole.value];
    };

    const resetActivePlayers = () => {
      activePlayers.value = clonePlayers(players.value);
    };

    const createNightAction = (action: INightAction, nightIndex: number) => {
      const existingNightLog = nightsLogs.value.find(
        (night) => night.indexOfNight === nightIndex,
      );

      if (existingNightLog) {
        existingNightLog.actions.push(action);
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

    const setPlayerRole = (
      playerName: string,
      role: string,
      lives?: number,
    ) => {
      const player = activePlayers.value.find((p) => p.name === playerName);
      if (player) {
        player.role = role;
        if (lives !== undefined) {
          player.lives = lives;
        }
      }
    };

    const removePlayer = (playerName: string) => {
      players.value = players.value.filter(
        (player) => player.name !== playerName,
      );
      useToast().success(`Игрок ${playerName} удален`);
    };

    const clearDeadPlayers = () => {
      activePlayers.value = activePlayers.value.filter(
        (player) => player.lives > 0,
      );
    };

    const saveLastCirclePlayers = (playersToSave: IPlayer[] = activePlayers.value) => {
      lastCirclePlayers.value = clonePlayers(playersToSave);
    };

    const restoreLastCirclePlayers = () => {
      if (lastCirclePlayers.value.length === 0) {
        return false;
      }

      const restoredPlayers = clonePlayers(lastCirclePlayers.value);
      const restoredByName = new Map(restoredPlayers.map((player) => [player.name, player]));

      activePlayers.value = restoredPlayers;
      players.value = players.value.map((player) => {
        const restoredPlayer = restoredByName.get(player.name);
        return restoredPlayer ? { ...restoredPlayer } : player;
      });
      totalSectariansCreated.value = activePlayers.value.filter(
        (player) => player.role === "sectarian",
      ).length;

      return true;
    };

    const resetStore = () => {
      activePlayers.value = [];
    };

    const getPlayerRole = (playerName: string): string | undefined => {
      return activePlayers.value.find((player) => player.name === playerName)
        ?.role;
    };

    const assignRolesRandomly = () => {
      const playerCount = activePlayers.value.length;
      const excluded = Object.keys(inactiveRoles.value).filter(r => inactiveRoles.value[r]);
      const rolePool: string[] = [];

      const mafiaCount = Math.max(parseInt(amountOfMafia.value.toString()) || 1, 1);
      const sectarianCount = Math.max(parseInt(maxSectarians.value.toString()) || 0, 0);

      for (let i = 0; i < mafiaCount; i++) rolePool.push('mafia');

      if (!excluded.includes('don')) rolePool.push('don');
      if (sectarianCount > 0 && !excluded.includes('sectarian')) rolePool.push('sectarian');
      if (!excluded.includes('maniac')) rolePool.push('maniac');
      if (!excluded.includes('detective')) rolePool.push('detective');
      if (!excluded.includes('patrol')) rolePool.push('patrol');
      if (!excluded.includes('doctor')) rolePool.push('doctor');
      if (!excluded.includes('journalist')) rolePool.push('journalist');
      if (!excluded.includes('lucky-guy')) rolePool.push('lucky-guy');

      const shuffledPlayers = [...activePlayers.value].sort(() => Math.random() - 0.5);
      shuffledPlayers.forEach((player, index) => {
        const role = rolePool[index] || 'civilian';
        const target = activePlayers.value.find(p => p.name === player.name);
        if (target) target.role = role;
      });

      totalSectariansCreated.value = activePlayers.value.filter(p => p.role === 'sectarian').length;
    };

    return {
      activePlayers,
      lastCirclePlayers,
      maxSectarians,
      amountOfMafia,
      circleOfFortuneRounds,
      nightsLogs,
      inactiveRoles,
      currentGameStep,
      players,
      currentRestrictedMembersCount,
      totalSectariansCreated,
      isMasterMode,
      activeRoles,
      currentNight,
      assignRolesRandomly,
      fillMissingRoles,
      handleNextRole,
      getNightActions,
      getCurrentNightActions,
      getLastNightActions,
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
      restoreLastCirclePlayers,
      resetStore,
      getPlayerRole,
    };
  },
  {
    persist: {
      storage: piniaPluginPersistedstate.localStorage(),
    },
  },
);
