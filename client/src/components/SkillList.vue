<script setup lang="ts">
import { ref, computed } from "vue";
import type { SkillMeta } from "../App.vue";
import SkillDetail from "./SkillDetail.vue";

const props = defineProps<{
  skills: SkillMeta[];
  rootsUsed: string[];
}>();

const emit = defineEmits<{ refresh: [] }>();
const selected = ref<SkillMeta | null>(null);
const searchQuery = ref("");
const filterSource = ref("");

const filteredSkills = computed(() => {
  let list = props.skills;
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.shortDescription && s.shortDescription.toLowerCase().includes(q))
    );
  }
  if (filterSource.value) {
    list = list.filter((s) => s.source === filterSource.value);
  }
  return list;
});

const sourceOptions = computed(() => {
  const set = new Set(props.skills.map((s) => s.source));
  return Array.from(set);
});

function openDetail(skill: SkillMeta) {
  selected.value = skill;
}

function closeDetail() {
  selected.value = null;
}
</script>

<template>
  <section class="mb-8">
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <input
        v-model="searchQuery"
        type="search"
        class="min-w-[10rem] flex-1 rounded-input border border-border bg-surface-elevated px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
        placeholder="搜索名称或描述…"
      />
      <select
        v-model="filterSource"
        class="rounded-input border border-border bg-surface-elevated px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      >
        <option value="">全部来源</option>
        <option v-for="s in sourceOptions" :key="s" :value="s">{{ s }}</option>
      </select>
      <button
        type="button"
        class="shrink-0 rounded-button bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        @click="emit('refresh')"
      >
        刷新
      </button>
    </div>

    <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li
        v-for="skill in filteredSkills"
        :key="skill.id"
        class="cursor-pointer rounded-card border border-border bg-surface-elevated p-4 text-left shadow-card transition-all hover:border-primary/30 hover:shadow-card-hover"
        @click="openDetail(skill)"
      >
        <div class="mb-1 font-semibold text-slate-900">{{ skill.name }}</div>
        <div class="line-clamp-2 mb-2 text-sm text-muted">
          {{ skill.shortDescription || skill.description || "—" }}
        </div>
        <div class="text-xs text-muted-strong">
          <span class="rounded bg-surface-muted px-1.5 py-0.5 font-medium">
            {{ skill.source }}
          </span>
        </div>
      </li>
    </ul>

    <SkillDetail
      v-if="selected"
      :skill="selected"
      @close="closeDetail"
    />
  </section>
</template>
