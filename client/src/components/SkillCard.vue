<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import {
  ClipboardDocumentIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  CheckIcon,
} from "@heroicons/vue/24/outline";
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

const { t, categoryLabel } = useI18n();

const themeClass = `skill-theme-${props.skill.source}`;
const shortPath = props.skill.path.split(/[/\\]/).filter(Boolean).slice(-2).join("/") || props.skill.path;

const showCategoryMenu = ref(false);
const categorySaving = ref(false);
const categoryError = ref("");
const customCategoryInput = ref("");
const copyLabel = ref(t("card.copy"));
let copyTimer: number | null = null;

const currentCategory = () => props.skill.category ?? "其他";

function closeMenu() {
  showCategoryMenu.value = false;
  categoryError.value = "";
  customCategoryInput.value = "";
}

function handleClickOutside(e: MouseEvent) {
  const el = (e.target as Node);
  if (!cardRef.value?.contains(el)) closeMenu();
}

const cardRef = ref<HTMLElement | null>(null);
onMounted(() => document.addEventListener("click", handleClickOutside));
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  if (copyTimer != null) window.clearTimeout(copyTimer);
});

async function setCategory(category: string) {
  if (category === currentCategory()) {
    closeMenu();
    return;
  }
  if (!props.skill.path) return;
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
    closeMenu();
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
}

async function copyPath() {
  const text = props.skill.path;
  if (!text) return;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    copyLabel.value = t("card.copied");
    if (copyTimer != null) window.clearTimeout(copyTimer);
    copyTimer = window.setTimeout(() => {
      copyLabel.value = t("card.copy");
    }, 1500);
  } catch {
    copyLabel.value = t("card.copyFailed");
    if (copyTimer != null) window.clearTimeout(copyTimer);
    copyTimer = window.setTimeout(() => {
      copyLabel.value = t("card.copy");
    }, 2000);
  }
}
</script>

<template>
  <div
    ref="cardRef"
    class="skill-card relative flex cursor-pointer flex-col gap-2.5 rounded-[var(--radius-lg)] border border-transparent bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] transition-all duration-200"
    :class="[themeClass, { selected: selected, 'dropdown-open': showCategoryMenu }]"
    @click="emit('click')"
  >
    <div class="card-title text-[1.1rem] font-semibold tracking-tight text-[var(--ink-primary)]">
      {{ skill.name }}
    </div>
    <div class="font-mono text-[0.65rem] text-[var(--ink-muted)]">
      <span class="inline-block rounded-[30px] bg-[var(--accent-light)]/40 px-2.5 py-1">{{ shortPath }}</span>
    </div>
    <div class="card-desc line-clamp-2 text-[0.8rem] leading-snug text-[var(--ink-muted)]">
      {{ skill.shortDescription || skill.description || t("common.emptyDash") }}
    </div>
    <div class="card-tags mt-1 flex flex-wrap items-center gap-1.5">
      <span class="rounded-[30px] bg-[#f7f7f7] px-2.5 py-1 text-[0.65rem] font-medium text-[var(--ink-muted)]">
        {{ getSourceLabel(skill.source) }}
      </span>
      <!-- 分类：点击展开下拉，选择后保存 -->
      <div class="category-pill-wrapper relative inline-flex" @click.stop>
        <button
          type="button"
          class="category-pill flex items-center gap-1 rounded-[30px] bg-[var(--accent-light)] px-2.5 py-1 text-[0.65rem] font-medium text-[var(--accent)] transition-colors hover:bg-[color-mix(in_oklab,var(--accent-light)_80%,white_20%)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 disabled:opacity-60"
          :disabled="categorySaving"
          :title="categorySaving ? t('drawer.saving') : t('card.categoryTooltip')"
          @click="showCategoryMenu = !showCategoryMenu"
        >
          <span>{{ categoryLabel(currentCategory()) }}</span>
          <ChevronDownIcon
            class="h-3 w-3 shrink-0 transition-transform"
            :class="{ 'rotate-180': showCategoryMenu }"
          />
        </button>
        <Transition name="dropdown">
          <div
            v-show="showCategoryMenu"
            class="category-dropdown absolute left-0 top-full z-[100] mt-1 min-w-[10rem] rounded-lg border border-[var(--border-light)] bg-[var(--surface)] py-1 shadow-xl"
          >
            <button
              v-for="opt in categoryOptions"
              :key="opt"
              type="button"
              class="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[0.8rem] text-[var(--ink-primary)] transition-colors hover:bg-[var(--accent-light)]/70"
              :class="{ 'bg-[var(--accent-light)] text-[var(--accent)]': opt === currentCategory() }"
              @click="setCategory(opt)"
            >
              <span>{{ categoryLabel(opt) }}</span>
              <CheckIcon v-if="opt === currentCategory()" class="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
            </button>
            <template v-if="currentCategory() && !categoryOptions.includes(currentCategory())">
              <button
                type="button"
                class="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[0.8rem] transition-colors hover:bg-[var(--accent-light)]/70 bg-[var(--accent-light)] text-[var(--accent)]"
                @click="setCategory(currentCategory())"
              >
                <span>{{ categoryLabel(currentCategory()) }}</span>
                <CheckIcon class="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
              </button>
            </template>
            <div class="border-t border-[var(--border-light)] px-2 py-2 mt-1">
              <div class="flex gap-1.5">
                <input
                  v-model="customCategoryInput"
                  type="text"
                  class="flex-1 min-w-0 rounded border border-[var(--border-light)] px-2.5 py-1.5 text-[0.8rem] outline-none focus:border-[var(--accent)]"
                  :placeholder="t('card.customPlaceholder')"
                  @keydown.enter="submitCustomCategory"
                />
                <button
                  type="button"
                  class="shrink-0 rounded bg-[var(--accent)] px-2.5 py-1.5 text-[0.75rem] font-medium text-white hover:brightness-95"
                  :disabled="categorySaving || !customCategoryInput.trim()"
                  @click="submitCustomCategory"
                >
                  {{ t("card.add") }}
                </button>
              </div>
            </div>
            <p v-if="categoryError" class="px-3 py-2 text-[0.7rem] text-red-500">{{ categoryError }}</p>
            <p v-if="categorySaving" class="px-3 py-2 text-[0.7rem] text-[#9f9f9f]">保存中…</p>
          </div>
        </Transition>
      </div>
    </div>
    <div class="card-footer mt-2 flex items-center justify-between border-t border-[var(--border-light)] pt-3.5">
      <button
        type="button"
        class="copy-btn flex items-center gap-1.5 rounded-[30px] px-2.5 py-1 text-[0.8rem] font-medium text-[var(--accent)] transition-colors hover:bg-[var(--accent-light)]"
        @click.stop="copyPath"
      >
        <ClipboardDocumentIcon class="h-3.5 w-3.5 shrink-0" /> {{ copyLabel }}
      </button>
      <span class="arrow text-[#bfbfbf] transition-colors" style="--skill-hover: var(--accent, #1a1a1a);">
        <ArrowRightIcon class="h-4 w-4" />
      </span>
    </div>
  </div>
</template>

<style scoped>
.skill-card:hover {
  box-shadow: var(--shadow-hover);
  transform: translateY(-2px);
  border-color: var(--border-light);
}
.skill-card:hover .arrow {
  color: var(--accent, #1a1a1a);
}
.skill-card.selected {
  border-color: var(--accent-light, #d4d4d4);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
}
.skill-card.dropdown-open {
  z-index: 50;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
