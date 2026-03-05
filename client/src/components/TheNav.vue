<script setup lang="ts">
import { Squares2X2Icon, FolderIcon, TagIcon } from "@heroicons/vue/24/outline";
import { useI18n } from "../i18n";

const props = defineProps<{
  filterSource: string;
  filterCategory: string;
  sourceCounts: { value: string; label: string; count: number }[];
  categoryCounts: { value: string; label: string; count: number }[];
  totalCount: number;
}>();

const emit = defineEmits<{ "update:filterSource": [value: string]; "update:filterCategory": [value: string] }>();

const { t } = useI18n();

function setSource(value: string) {
  emit("update:filterSource", value);
  emit("update:filterCategory", "");
}
function setCategory(value: string) {
  emit("update:filterCategory", value);
}
</script>

<template>
  <nav class="flex flex-col border-r border-[var(--border-light)] bg-transparent px-4 py-8 pl-6">
    <div class="mb-8 pl-1">
      <div class="flex items-center gap-2.5">
        <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent)] text-base font-semibold text-white">Y</div>
        <span class="text-lg font-semibold tracking-tight text-[var(--ink-primary)]">YouSkills</span>
      </div>
    </div>
    <div class="mb-7">
      <div class="mb-3 pl-2 text-[0.65rem] font-medium uppercase tracking-wider text-[var(--ink-muted)]">
        {{ t("nav.sources") }}
      </div>
      <button
        type="button"
        class="nav-item flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[0.9rem] font-medium transition-colors"
        :class="{ active: !filterSource && !filterCategory }"
        @click="setSource('')"
      >
        <span class="flex min-w-0 items-center gap-2.5">
          <Squares2X2Icon class="h-4 w-4 shrink-0" />
          <span class="truncate whitespace-nowrap">{{ t("nav.all") }}</span>
        </span>
        <span class="count rounded-full bg-[#f5f5f5] px-2 py-0.5 text-[0.65rem] font-medium text-[#6f6f6f]">{{ totalCount }}</span>
      </button>
      <button
        v-for="item in sourceCounts"
        :key="'src-' + item.value"
        type="button"
        class="nav-item flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[0.9rem] font-medium transition-colors"
        :class="{ active: filterSource === item.value }"
        @click="setSource(item.value)"
      >
        <span class="flex min-w-0 items-center gap-2.5">
          <FolderIcon class="h-4 w-4 shrink-0" />
          <span class="truncate whitespace-nowrap">{{ item.label }}</span>
        </span>
        <span class="count rounded-full bg-[#f5f5f5] px-2 py-0.5 text-[0.65rem] font-medium text-[#6f6f6f]">{{ item.count }}</span>
      </button>
    </div>
    <div v-if="categoryCounts.length > 0" class="mb-7">
      <div class="mb-3 pl-2 text-[0.65rem] font-medium uppercase tracking-wider text-[var(--ink-muted)]">
        {{ t("nav.types") }}
      </div>
      <button
        type="button"
        class="nav-item flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[0.9rem] font-medium transition-colors"
        :class="{ active: !filterCategory }"
        @click="setCategory('')"
      >
        <span class="flex items-center gap-2.5">
          <TagIcon class="h-4 w-4 shrink-0" />
          <span>{{ t("nav.allTypes") }}</span>
        </span>
      </button>
      <button
        v-for="item in categoryCounts"
        :key="'cat-' + item.value"
        type="button"
        class="nav-item flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[0.9rem] font-medium transition-colors"
        :class="{ active: filterCategory === item.value }"
        @click="setCategory(item.value)"
      >
        <span class="flex items-center gap-2.5">
          <TagIcon class="h-4 w-4 shrink-0" />
          <span>{{ item.label }}</span>
        </span>
        <span class="count rounded-full bg-[#f5f5f5] px-2 py-0.5 text-[0.65rem] font-medium text-[#6f6f6f]">
          {{ item.count }}
        </span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.nav-item:hover {
  background: color-mix(in_oklab, var(--accent-light) 85%, white 15%);
}
.nav-item.active {
  background: var(--accent);
  color: white;
}
.nav-item.active .count {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}
</style>
