<script setup lang="ts">
import { ref, computed } from "vue";
import {
  FolderIcon,
  XMarkIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from "@heroicons/vue/24/outline";
import type { SkillMeta } from "../App.vue";
import { renderMarkdown } from "../utils/markdown";
import { parseJsonResponse } from "../utils/fetchJson";
import { getSourceLabel } from "../utils/sourceLabel";
import { useI18n } from "../i18n";

const props = defineProps<{
  skill: SkillMeta;
  categoryOptions: string[];
}>();
const emit = defineEmits<{ close: []; categoryUpdated: [] }>();

const { t, categoryLabel } = useI18n();

const tab = ref<"doc" | "example" | "schema">("doc");
const categorySaving = ref(false);
const categoryError = ref("");
const customCategoryInput = ref("");
const fullscreen = ref(false);

/** 下拉选项：预设 + 当前自定义分类（若不在预设中） */
const categorySelectOptions = computed(() => {
  const current = props.skill.category ?? "其他";
  const opts = [...props.categoryOptions];
  if (current && !opts.includes(current)) opts.push(current);
  return opts;
});

async function updateCategory(category: string) {
  if (!props.skill.path || category === (props.skill.category ?? "其他")) return;
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
  updateCategory(v);
  customCategoryInput.value = "";
}

const themeClass = `skill-theme-${props.skill.source}`;
const rawHtml = computed(() => (props.skill.raw ? renderMarkdown(props.skill.raw) : ""));
const shortPath = computed(() =>
  props.skill.path.split(/[/\\]/).filter(Boolean).slice(-3).join("/") || props.skill.path
);

function toggleFullscreen() {
  fullscreen.value = !fullscreen.value;
}
</script>

<template>
  <aside
    class="drawer flex shrink-0 flex-col overflow-hidden border-l border-[var(--border-light)] bg-[var(--surface)] shadow-[var(--shadow-drawer)]"
    :class="[
      themeClass,
      fullscreen
        ? 'fixed inset-8 z-[300] rounded-2xl border bg-[var(--surface)]'
        : 'w-[340px]'
    ]"
  >
    <div class="h-0.5 w-full shrink-0" style="background: var(--accent, #d45b1e);"></div>
    <div class="shrink-0 border-b border-[var(--border-light)] px-6 py-4">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="mb-1 truncate text-[1.6rem] font-semibold leading-tight text-[var(--ink-primary)]">
            {{ skill.name }}
          </div>
          <div
            class="inline-flex items-center gap-1.5 rounded-full bg-[#f9f9f9] px-3.5 py-1 font-mono text-[0.7rem] text-[#9f9f9f]"
          >
            <FolderIcon class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span class="truncate max-w-[210px] md:max-w-[260px]">{{ shortPath }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-light)] text-[#7a7a7a] hover:bg-[var(--accent-light)]"
            aria-label="关闭详情"
            @click.stop="emit('close')"
          >
            <XMarkIcon class="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
    <div class="flex shrink-0 gap-4 border-b border-[var(--border-light)] px-5">
      <button
        type="button"
        class="tab -mb-px border-b-2 border-transparent py-3 pb-2.5 text-[0.85rem] font-medium text-[#9f9f9f] transition-colors"
        :class="{ active: tab === 'doc' }"
        @click="tab = 'doc'"
      >
        {{ t("drawer.tabDoc") }}
      </button>
      <button
        type="button"
        class="tab -mb-px border-b-2 border-transparent py-3 pb-2.5 text-[0.85rem] font-medium text-[#9f9f9f] transition-colors"
        :class="{ active: tab === 'example' }"
        @click="tab = 'example'"
      >
        {{ t("drawer.tabExample") }}
      </button>
      <button
        type="button"
        class="tab -mb-px border-b-2 border-transparent py-3 pb-2.5 text-[0.85rem] font-medium text-[#9f9f9f] transition-colors"
        :class="{ active: tab === 'schema' }"
        @click="tab = 'schema'"
      >
        {{ t("drawer.tabInfo") }}
      </button>
    </div>
    <div class="min-h-0 flex-1 overflow-y-auto px-6 py-6">
      <div
        v-show="tab === 'doc'"
        class="skill-md prose prose-sm max-w-none prose-headings:text-[var(--ink-primary)] prose-p:text-[var(--ink-primary)]"
        v-html="rawHtml"
      ></div>
      <div v-show="tab === 'example'" class="space-y-4">
        <h4 class="text-[0.65rem] font-medium uppercase tracking-wider text-[#bfbfbf]">
          {{ t("drawer.sectionWhen") }}
        </h4>
        <p class="text-[0.85rem] text-[#3a3a3a]">{{ skill.whenToUse || t("common.emptyDash") }}</p>
        <h4 class="text-[0.65rem] font-medium uppercase tracking-wider text-[#bfbfbf]">
          {{ t("drawer.sectionDescription") }}
        </h4>
        <p class="text-[0.85rem] text-[#3a3a3a]">{{ skill.description || t("common.emptyDash") }}</p>
      </div>
      <div v-show="tab === 'schema'" class="space-y-4">
        <h4 class="text-[0.65rem] font-medium uppercase tracking-wider text-[#bfbfbf]">
          {{ t("drawer.sectionCategory") }}
        </h4>
        <div class="space-y-2">
          <div class="flex flex-wrap items-center gap-2">
            <select
              :value="skill.category ?? '其他'"
              :disabled="categorySaving"
              class="rounded-lg border border-[var(--border-light)] bg-white px-3 py-2 text-[0.85rem] text-[#3a3a3a] outline-none focus:border-[#c0c0c0] disabled:opacity-60"
              @change="updateCategory((($event.target) as HTMLSelectElement).value)"
            >
              <option v-for="opt in categorySelectOptions" :key="opt" :value="opt">
                {{ categoryLabel(opt) }}
              </option>
            </select>
            <span v-if="categorySaving" class="text-[0.75rem] text-[#9f9f9f]">{{ t("drawer.saving") }}</span>
            <span v-if="categoryError" class="text-[0.75rem] text-red-500">{{ categoryError }}</span>
          </div>
          <div class="flex gap-2 items-center">
            <input
              v-model="customCategoryInput"
              type="text"
              class="flex-1 min-w-0 rounded-lg border border-[var(--border-light)] bg-white px-3 py-2 text-[0.85rem] outline-none focus:border-[#c0c0c0]"
              :placeholder="t('drawer.customCategoryPlaceholder')"
              @keydown.enter="submitCustomCategory"
            />
            <button
              type="button"
              class="shrink-0 rounded-lg bg-[var(--accent)] px-3 py-2 text-[0.8rem] font-medium text-white hover:brightness-95 disabled:opacity-60"
              :disabled="categorySaving || !customCategoryInput.trim()"
              @click="submitCustomCategory"
            >
              {{ t("card.add") }}
            </button>
          </div>
        </div>
        <h4 class="text-[0.65rem] font-medium uppercase tracking-wider text-[#bfbfbf]">
          {{ t("drawer.sectionPath") }}
        </h4>
        <pre class="rounded-[20px] bg-[#1a1a1a] p-5 font-mono text-[0.7rem] leading-relaxed text-[#e0e0e0] whitespace-pre-wrap break-all">{{ skill.path }}</pre>
        <h4 class="text-[0.65rem] font-medium uppercase tracking-wider text-[#bfbfbf]">
          {{ t("drawer.sectionSource") }}
        </h4>
        <p class="text-[0.85rem] text-[#3a3a3a]">{{ getSourceLabel(skill.source) }}</p>
      </div>
    </div>
    <div class="flex shrink-0 justify-end gap-3 border-t border-[var(--border-light)] px-6 py-4 pb-6">
      <button
        type="button"
        class="footer-btn flex items-center justify-center gap-1.5 rounded-full bg-[var(--accent)] px-6 py-3 text-[0.85rem] font-medium text-white transition-colors hover:opacity-90"
        :aria-label="fullscreen ? t('drawer.fullScreenExit') : t('drawer.fullScreen')"
        @click="toggleFullscreen"
      >
        <ArrowsPointingInIcon v-if="fullscreen" class="h-4 w-4 shrink-0" aria-hidden="true" />
        <ArrowsPointingOutIcon v-else class="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{{ fullscreen ? t("drawer.fullScreenExit") : t("drawer.fullScreen") }}</span>
      </button>
      <button
        type="button"
        class="footer-btn flex items-center justify-center gap-1.5 rounded-full border border-[var(--border-light)] bg-white px-6 py-3 text-[0.85rem] font-medium text-[#3a3a3a] transition-colors hover:bg-[#f5f5f5]"
        @click="emit('close')"
      >
        <XMarkIcon class="h-4 w-4 shrink-0" aria-hidden="true" /> {{ t("drawer.close") }}
      </button>
    </div>
  </aside>
</template>

<style scoped>
.tab.active {
  color: var(--accent, #d45b1e);
  border-bottom-color: var(--accent, #d45b1e);
}
</style>
