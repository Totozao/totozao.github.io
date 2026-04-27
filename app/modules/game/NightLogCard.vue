<script setup lang="ts">
import type { INightAction } from "~/models/playerInfo";

const { action } = defineProps<{
  action: INightAction;
}>();

const actionTypeDict = {
  kill: (playerName: string, causedBy: string) => {
    return `Попытка убийства: ${playerName}. Исполнитель: ${causedBy}`;
  },
  check: (playerName: string, causedBy: string) => {
    return `Проверка: ${playerName}. Проверял: ${causedBy}`;
  },
  compare: (playerName: string, causedBy: string) => {
    return `Сравнение игроков: ${playerName}. Журналист: ${causedBy}`;
  },
  heal: (playerName: string, causedBy: string) => {
    return `Лечение: ${playerName}. Доктор: ${causedBy}`;
  },
  recruit: (playerName: string, causedBy: string) => {
    return `Вербовка: ${playerName}. Сектант: ${causedBy}`;
  },
  skip: (_playerName: string, causedBy: string) => {
    return `Действие пропущено. Роль: ${causedBy}`;
  },
};

const actionMetaDict = {
  kill: { label: 'Атака', accent: 'from-rose-500/20 to-red-500/5 text-rose-200 border-rose-400/20' },
  check: { label: 'Проверка', accent: 'from-blue-500/20 to-cyan-500/5 text-blue-200 border-blue-400/20' },
  compare: { label: 'Сравнение', accent: 'from-purple-500/20 to-fuchsia-500/5 text-purple-200 border-purple-400/20' },
  heal: { label: 'Лечение', accent: 'from-emerald-500/20 to-green-500/5 text-emerald-200 border-emerald-400/20' },
  recruit: { label: 'Вербовка', accent: 'from-amber-500/20 to-orange-500/5 text-amber-200 border-amber-400/20' },
  skip: { label: 'Пропуск', accent: 'from-neutral-500/20 to-neutral-500/5 text-neutral-200 border-neutral-500/30' },
};

const meta = computed(() => actionMetaDict[action.action as keyof typeof actionMetaDict] || actionMetaDict.check);
const actionText = computed(() => {
  const formatter = actionTypeDict[action.action as keyof typeof actionTypeDict] || actionTypeDict.check;
  return formatter(action.affectedPlayer, action.actionPlayer);
});
</script>

<template>
  <div
    class="relative overflow-hidden rounded-2xl border bg-neutral-950/80 p-4 shadow-lg"
    :class="meta.accent"
  >
    <div class="absolute inset-0 bg-gradient-to-br pointer-events-none" :class="meta.accent" />
    <div class="relative z-10 flex flex-col gap-2">
      <span class="w-fit rounded-full border border-current/20 bg-black/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]">
        {{ meta.label }}
      </span>
      <p class="text-sm leading-6 text-neutral-100">{{ actionText }}</p>
    </div>
  </div>
</template>
