defineNuxtRouteMiddleware((to, from) => {
  const players = usePlayersInfo();
  if (
    players.activePlayers.filter((player) => player.role === "").length === 0
  ) {
    alert("Назначьте роли игрокам");
    return navigateTo("/");
  }
});
