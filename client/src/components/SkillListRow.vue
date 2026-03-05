<script setup lang="ts">
import { ref } from "vue";
import { ArrowRightIcon } from "@heroicons/vue/24/outline";
import type { SkillMeta } from "../App.vue";
import { parseJsonResponse } from "../utils/fetchJson";
import { getSourceLabel } from "../utils/sourceLabel";
import { useI18n } from "../i18n";

const props = defineProps<{
  skill: SkillMeta;
  selected?: boolean;
  categoryOptions: string[];
}>();

const emit = defineEmits<{ click: []; categoryUpdated: [] }>();

const themeClass = `skill-theme-${props.skill.source}`;

const categorySaving = ref(false);
const categoryError = ref("");
const customCategoryInput = ref("");

const { t, categoryLabel } = useI18n();

const currentCategory = () => props.skill.category ?? "其他";

async function setCategory(category: string) {
  if (!props.skill.path || category === currentCategory()) return;
  categorySaving.value = true;
  categoryError.value = "";
  try {
    const res = await fetch("/api/skills/category", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: props.skill.path, category }),
    });
    const data = (await parseJsonResponse(res)) as { ok?: boolean; error?: string };
    if (!res.ok) throw new Error(data.error || "保存失败");
    emit("categoryUpdated");
  } catch (e) {
    categoryError.value = e instanceof Error ? e.message : String(e);
  } finally {
    categorySaving.value = false;
  }
}

function submitCustomCategory() {
  const v = customCategoryInput.value.trim();
  if (!v) return;
  setCategory(v);
  customCategoryInput.value = "";
}
</script>

<template>
  <button
    type="button"
    class="list-row group flex w-full items-center gap-4 rounded-[var(--radius-md)] px-4 py-3 text-left text-[0.85rem]"
    :class="[themeClass, { 'bg-[var(--accent-light)]/40': selected }]"
    @click="emit('click')"
  >
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <span class="truncate text-[0.9rem] font-semibold text-[var(--ink-primary)]">
          {{ skill.name }}
        </span>
        <span class="rounded-full bg-[var(--accent-light)]/70 px-2 py-0.5 text-[0.7rem] font-mono text-[var(--accent)]">
          {{ getSourceLabel(skill.source) }}
        </span>
      </div>
      <p class="mt-1 line-clamp-1 text-[0.8rem] text-[var(--ink-muted)]">
        {{ skill.shortDescription || skill.description || t("common.emptyDash") }}
      </p>
    </div>

    <div class="hidden flex-col items-start gap-1 sm:flex sm:w-40">
      <span class="text-[0.7rem] text-[var(--ink-muted)]">{{ t("list.columnCategory") }}</span>
      <div class="inline-flex items-center gap-1">
        <select
          :value="currentCategory()"
          :disabled="categorySaving"
          class="min-w-[7rem] rounded-full border border-[var(--border-light)] bg-[var(--surface)] px-3 py-1 text-[0.75rem] text-[var(--ink-primary)] outline-none focus:border-[var(--accent)] disabled:opacity-60"
          @change.stop="setCategory((($event.target) as HTMLSelectElement).value)"
        >
          <option v-for="opt in categoryOptions" :key="opt" :value="opt">
            {{ categoryLabel(opt) }}
          </option>
          <option
            v-if="currentCategory() && !categoryOptions.includes(currentCategory())"
            :value="currentCategory()"
          >
            {{ categoryLabel(currentCategory()) }}
          </option>
        </select>
      </div>
      <p v-if="categoryError" class="text-[0.7rem] text-red-500">{{ categoryError }}</p>
    </div>

    <div class="flex items-center justify-end pl-2">
      <span
        class="row-arrow flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-light)]/70 text-[#bfbfbf] transition-colors"
      >
        <ArrowRightIcon class="h-4 w-4" />
      </span>
    </div>
  </button>
</template>

<style scoped>
.list-row {
  transition:
    background var(--transition, 0.2s ease),
    transform var(--transition, 0.2s ease),
    box-shadow var(--transition, 0.2s ease);
}

.list-row:hover {
  background: color-mix(in_oklab, var(--accent-light) 80%, white 20%);
  transform: translateX(2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
}

.list-row:hover .row-arrow {
  background: var(--accent, #1a1a1a);
  color: #ffffff;
  transform: translateX(2px);
}
</style>

