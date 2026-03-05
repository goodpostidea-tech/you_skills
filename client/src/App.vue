<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {
  FolderOpenIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  SwatchIcon,
  Squares2X2Icon,
  Bars3Icon,
} from "@heroicons/vue/24/outline";
import TheNav from "./components/TheNav.vue";
import PathInput from "./components/PathInput.vue";
import SkillCard from "./components/SkillCard.vue";
import SkillListRow from "./components/SkillListRow.vue";
import SkillDrawer from "./components/SkillDrawer.vue";
import { parseJsonResponse } from "./utils/fetchJson";
import { getSourceLabel } from "./utils/sourceLabel";
import { BUILTIN_THEMES, getThemeById, applyTheme, DEFAULT_THEME_ID } from "./constants/themes";
import { useI18n } from "./i18n";

const { t, locale, setLocale, categoryLabel, themeLabel } = useI18n();

/** 分类选项：来自 GET /api/config 的 current_scheme_categories，未加载时用兜底 */
const CATEGORY_OPTIONS_FALLBACK = ["文档输出类", "设计创作类", "工具构建类", "知识库类", "其他"];
const categoryOptionsFromConfig = ref<string[]>([]);
const categoryOptions = computed(() =>
  categoryOptionsFromConfig.value.length > 0 ? categoryOptionsFromConfig.value : CATEGORY_OPTIONS_FALLBACK
);

const STORAGE_KEY_CONSENT = "you-skills-authorized";
const STORAGE_KEY_VIEW_MODE = "you-skills-view-mode";
const STORAGE_KEY_CONFIG_DONE = "you-skills-config-done";

const skills = ref<SkillMeta[]>([]);
const rootsUsed = ref<string[]>([]);
const customRoot = ref("");
const loading = ref(false);
const error = ref("");
const filterSource = ref("");
const filterCategory = ref("");
const searchQuery = ref("");
const selectedSkill = ref<SkillMeta | null>(null);
const pathChipEdit = ref(false);
const pathInputValue = ref("");
const viewMode = ref<"card" | "list">("card");

/** 初始化配置步骤（授权后全页展示，非弹窗） */
const showConfigStep = ref(false);
/** 引导步骤：1 = 授权，2 = 初始化配置 */
const onboardingStep = ref<1 | 2>(1);
/** 是否已完成过初始化配置（任一路径，影响是否再次显示引导） */
const initialConfigDone = ref(false);
/** 配置弹层（仅用于工具栏「配置」入口，分类方案） */
const showConfigModal = ref(false);
/** 主题弹层（仅用于工具栏「主题」入口，配色方案） */
const showThemeModal = ref(false);
const configSchemes = ref<{ id: string; name: string; description: string }[]>([]);
const configCurrentId = ref("");
const configThemeId = ref(DEFAULT_THEME_ID);
const configSaving = ref(false);
const configError = ref("");
const themeSaving = ref(false);
const themeError = ref("");

/** 授权状态：null=未选择，granted=已允许扫描默认路径，denied=已拒绝、仅手动输入路径 */
const consentStatus = ref<"granted" | "denied" | null>(null);
/** 默认路径列表（来自后端，用于授权说明与引导） */
const defaultPaths = ref<string[]>([]);
/** 当前操作系统：由后端返回 win32 | darwin | linux，API 未返回时由前端根据 UA 推断 */
const platform = ref<string>("");
const consentLoading = ref(true);

/** 根据浏览器 UA 推断操作系统（仅在后端未返回 platform 时使用） */
function detectPlatformFromUA(): "win32" | "darwin" | "linux" | "" {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  if (/Win(dows|32|64|CE)/i.test(ua)) return "win32";
  if (/Mac|Darwin/i.test(ua)) return "darwin";
  if (/Linux/i.test(ua) && !/Android/i.test(ua)) return "linux";
  return "";
}

/** 当前识别到的操作系统（后端优先，否则前端推断），用于展示与路径选择 */
const effectivePlatform = computed(() => platform.value || detectPlatformFromUA());

/** 按平台显示的操作系统名称 */
const platformLabel = computed(() => {
  const p = effectivePlatform.value;
  if (p === "win32") return "Windows";
  if (p === "darwin") return "macOS";
  if (p === "linux") return "Linux";
  return "未知";
});

/** 各操作系统下的默认扫描路径示例（API 无数据时按识别到的 OS 展示） */
const FALLBACK_PATHS_WIN = [
  "C:\\Users\\您的用户名\\.codex\\skills",
  "C:\\Users\\您的用户名\\.cursor\\skills",
  "C:\\Users\\您的用户名\\.openclaw\\skills",
  "C:\\Users\\您的用户名\\.agents\\skills",
];
const FALLBACK_PATHS_UNIX = [
  "~/.codex/skills",
  "~/.cursor/skills",
  "~/.openclaw/skills",
  "~/.agents/skills",
];

/** 根据识别到的操作系统展示默认路径：有后端数据用后端，否则用该 OS 的示例路径 */
const pathsForDisplay = computed(() => {
  if (defaultPaths.value.length > 0) return defaultPaths.value;
  const p = effectivePlatform.value;
  if (p === "win32") return FALLBACK_PATHS_WIN;
  if (p === "darwin" || p === "linux") return FALLBACK_PATHS_UNIX;
  return FALLBACK_PATHS_UNIX;
});

export interface SkillMeta {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  whenToUse?: string;
  path: string;
  source: string;
  /** 本地推断的分类（文档输出类/设计创作类/工具构建类/知识库类/其他） */
  category?: string;
  raw?: string;
}

const hasSkills = computed(() => skills.value.length > 0);

/** 是否显示首次访问引导（步骤 1/2），已完成初始化后不再出现 */
const showConsentScreen = computed(
  () =>
    !initialConfigDone.value &&
    consentLoading.value === false &&
    (consentStatus.value === null || showConfigStep.value)
);

const sourceCounts = computed(() => {
  const map = new Map<string, number>();
  for (const s of skills.value) {
    map.set(s.source, (map.get(s.source) ?? 0) + 1);
  }
  return Array.from(map.entries()).map(([value, count]) => ({
    value,
    label: getSourceLabel(value),
    count,
  }));
});

/** 分类统计：预设顺序 + 自定义分类 */
const categoryCounts = computed(() => {
  const map = new Map<string, number>();
  for (const s of skills.value) {
    const key = s.category ?? "其他";
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  const presetOrder = ["文档输出类", "设计创作类", "工具构建类", "知识库类", "其他"];
  const preset = presetOrder
    .filter((value) => map.has(value))
    .map((value) => ({ value, label: categoryLabel(value), count: map.get(value)! }));
  const custom = [...map.entries()]
    .filter(([key]) => !presetOrder.includes(key))
    .map(([value, count]) => ({ value, label: categoryLabel(value), count }));
  return [...preset, ...custom];
});

function schemeName(s: { id: string; name: string }) {
  const key = `schemes.${s.id}.name`;
  const val = t(key);
  // 若未配置翻译，t 会返回路径本身，以此为依据回退到后端提供的 name
  return val.startsWith("schemes.") ? s.name : val;
}

function schemeDescription(s: { id: string; description: string }) {
  const key = `schemes.${s.id}.description`;
  const val = t(key);
  return val.startsWith("schemes.") ? s.description : val;
}

const filteredSkills = computed(() => {
  let list = skills.value;
  if (filterSource.value) {
    list = list.filter((s) => s.source === filterSource.value);
  }
  if (filterCategory.value) {
    list = list.filter((s) => (s.category ?? "其他") === filterCategory.value);
  }
  const q = searchQuery.value.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.shortDescription?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q)
    );
  }
  return list;
});

const displayPath = computed(() => {
  if (customRoot.value) return customRoot.value;
  if (rootsUsed.value.length > 0) return rootsUsed.value[0];
  return "";
});

async function fetchSkills(root?: string) {
  loading.value = true;
  error.value = "";
  try {
    const url = root
      ? `/api/skills?root=${encodeURIComponent(root)}`
      : "/api/skills";
    const res = await fetch(url);
    const data = (await parseJsonResponse(res)) as { skills?: SkillMeta[]; rootsUsed?: string[]; error?: string };
    if (!res.ok) throw new Error(data.error || "请求失败");
    skills.value = data.skills ?? [];
    rootsUsed.value = data.rootsUsed ?? [];
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
    skills.value = [];
    rootsUsed.value = [];
  } finally {
    loading.value = false;
  }
}

function onRefresh() {
  fetchSkills(customRoot.value || undefined);
}

function onPathSubmit(path: string) {
  customRoot.value = path;
  // 首次配置未完成时，优先进入初始化配置 Step 2，而不是直接进入列表
  if (!initialConfigDone.value) {
    onboardingStep.value = 2;
    showConfigStep.value = true;
    return;
  }
  fetchSkills(path);
}

function selectSkill(skill: SkillMeta) {
  selectedSkill.value = skill;
}

function closeDrawer() {
  selectedSkill.value = null;
}

/** 用户调整分类后刷新列表并保持当前 skill 选中 */
async function onCategoryUpdated() {
  await fetchSkills(customRoot.value || undefined);
  if (selectedSkill.value) {
    const found = skills.value.find((s) => s.path === selectedSkill.value!.path);
    if (found) selectedSkill.value = found;
  }
}

function startPathEdit() {
  pathInputValue.value = displayPath.value;
  pathChipEdit.value = true;
}

function submitPathEdit() {
  const p = pathInputValue.value.trim();
  if (p) onPathSubmit(p);
  pathChipEdit.value = false;
}

/** 授权：进入引导步骤 2（初始化配置），不写入 localStorage、不请求 /api/skills */
async function grantConsent() {
  consentStatus.value = "granted";
  onboardingStep.value = 2;
  await fetchConfig();
  showConfigStep.value = true;
}

function denyConsent() {
  try {
    localStorage.setItem(STORAGE_KEY_CONSENT, "no");
  } catch {
    /* ignore */
  }
  consentStatus.value = "denied";
}

function resetConsent() {
  try {
    localStorage.removeItem(STORAGE_KEY_CONSENT);
  } catch {
    /* ignore */
  }
  consentStatus.value = null;
  skills.value = [];
  rootsUsed.value = [];
  customRoot.value = "";
  consentLoading.value = true;
  loadConsentAndDefaults();
}

async function loadConsentAndDefaults() {
  let stored: string | null = null;
  let storedConfig: string | null = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY_CONSENT);
    storedConfig = localStorage.getItem(STORAGE_KEY_CONFIG_DONE);
  } catch {
    /* ignore */
  }
  try {
    const res = await fetch("/api/skills/default-paths");
    const data = (await parseJsonResponse(res)) as { paths?: string[]; platform?: string };
    defaultPaths.value = data.paths ?? [];
    platform.value = data.platform ?? "";
  } catch {
    defaultPaths.value = [];
    platform.value = "";
  }
  try {
    if (stored === "yes") {
      consentStatus.value = "granted";
      await fetchSkills();
    } else if (stored === "no") {
      consentStatus.value = "denied";
    } else {
      consentStatus.value = null;
      onboardingStep.value = 1;
    }
    initialConfigDone.value = storedConfig === "yes";
    await fetchConfig();
  } finally {
    consentLoading.value = false;
  }
}

async function fetchConfig() {
  try {
    const res = await fetch("/api/config");
    const data = (await parseJsonResponse(res)) as {
      classification_scheme_id?: string;
      schemes?: { id: string; name: string; description: string }[];
      current_scheme_categories?: string[];
      theme_id?: string;
    };
    configSchemes.value = data.schemes ?? [];
    configCurrentId.value = data.classification_scheme_id ?? "by_output";
    configThemeId.value = data.theme_id ?? DEFAULT_THEME_ID;
    if (Array.isArray(data.current_scheme_categories) && data.current_scheme_categories.length > 0) {
      categoryOptionsFromConfig.value = data.current_scheme_categories;
    }
    const theme = getThemeById(configThemeId.value);
    if (theme) applyTheme(theme);
  } catch {
    configSchemes.value = [];
    configCurrentId.value = "by_output";
    configThemeId.value = DEFAULT_THEME_ID;
    const theme = getThemeById(DEFAULT_THEME_ID);
    if (theme) applyTheme(theme);
  }
}

function openConfig() {
  configError.value = "";
  showConfigModal.value = true;
  fetchConfig();
}

/** 预览主题：仅前端应用，不持久化 */
function previewTheme(themeId: string) {
  configThemeId.value = themeId || DEFAULT_THEME_ID;
  const theme = getThemeById(configThemeId.value);
  if (theme) applyTheme(theme);
}

function openTheme() {
  themeError.value = "";
  showThemeModal.value = true;
}

/** 主题保存：点击主题卡片即可保存并应用 */
async function saveTheme(themeId: string) {
  previewTheme(themeId);
  themeSaving.value = true;
  themeError.value = "";
  try {
    const res = await fetch("/api/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme_id: themeId }),
    });
    const data = (await parseJsonResponse(res)) as { ok?: boolean; error?: string; theme_id?: string };
    if (!res.ok) throw new Error(data.error || "保存失败");
    if (data.theme_id) {
      configThemeId.value = data.theme_id;
      const theme = getThemeById(configThemeId.value);
      if (theme) applyTheme(theme);
    }
  } catch (e) {
    themeError.value = e instanceof Error ? e.message : String(e);
  } finally {
    themeSaving.value = false;
    if (!themeError.value) showThemeModal.value = false;
  }
}

async function saveConfig(closeModal = true, fromInitialConfig = false) {
  configSaving.value = true;
  configError.value = "";
  try {
    const res = await fetch("/api/config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        classification_scheme_id: configCurrentId.value || undefined,
        theme_id: configThemeId.value || undefined,
      }),
    });
    const data = (await parseJsonResponse(res)) as { ok?: boolean; error?: string; theme_id?: string };
    if (!res.ok) throw new Error(data.error || "保存失败");
    if (data.theme_id != null) configThemeId.value = data.theme_id;
    const theme = getThemeById(configThemeId.value);
    if (theme) applyTheme(theme);
    await fetchConfig();
    if (fromInitialConfig) {
      filterCategory.value = "";
      filterSource.value = "";
    }
    await fetchSkills(customRoot.value || undefined);
    if (selectedSkill.value) {
      const found = skills.value.find((s) => s.path === selectedSkill.value!.path);
      if (found) selectedSkill.value = found;
    }
    if (closeModal) showConfigModal.value = false;
    showConfigStep.value = false;
    if (fromInitialConfig) {
      // 首次初始化配置完成：标记已配置；同意扫描默认路径时记为 yes，拒绝时保持 no
      initialConfigDone.value = true;
      try {
        localStorage.setItem(STORAGE_KEY_CONFIG_DONE, "yes");
        if (consentStatus.value === "granted") {
          localStorage.setItem(STORAGE_KEY_CONSENT, "yes");
        } else if (consentStatus.value === "denied") {
          localStorage.setItem(STORAGE_KEY_CONSENT, "no");
        }
      } catch {
        /* ignore */
      }
    }
  } catch (e) {
    configError.value = e instanceof Error ? e.message : String(e);
  } finally {
    configSaving.value = false;
  }
}

function finishConfigStep() {
  saveConfig(false, true);
}

function setViewMode(mode: "card" | "list") {
  viewMode.value = mode;
  try {
    localStorage.setItem(STORAGE_KEY_VIEW_MODE, mode);
  } catch {
    /* ignore */
  }
}

onMounted(() => {
  try {
    const storedView = localStorage.getItem(STORAGE_KEY_VIEW_MODE) as "card" | "list" | null;
    if (storedView === "card" || storedView === "list") {
      viewMode.value = storedView;
    }
  } catch {
    /* ignore */
  }
  loadConsentAndDefaults();
});
</script>

<template>
  <div
    class="app mx-auto grid h-screen max-w-[1440px] bg-[var(--bg-page)]"
    :class="
      showConfigStep
        ? 'grid-cols-1'
        : selectedSkill
          ? 'grid-cols-[240px_1fr_340px]'
          : hasSkills || loading
            ? 'grid-cols-[240px_1fr]'
            : 'grid-cols-1'
    "
  >
    <!-- 左侧导航：非授权、非初始化配置且已有列表或正在加载时显示 -->
    <TheNav
      v-if="!showConsentScreen && !consentLoading && !showConfigStep && (hasSkills || loading)"
      :filter-source="filterSource"
      :filter-category="filterCategory"
      :source-counts="sourceCounts"
      :category-counts="categoryCounts"
      :total-count="skills.length"
      @update:filter-source="filterSource = $event"
      @update:filter-category="filterCategory = $event"
    />

    <!-- 主区域 -->
    <main class="flex min-w-0 flex-col overflow-hidden">
      <!-- 首次访问：引导步骤（Step 1 授权 → Step 2 初始化配置） -->
      <template v-if="showConsentScreen">
        <div class="relative flex flex-1 flex-col items-center justify-center px-6 pb-16 text-center">
          <!-- 顶部 Hero 文案，固定在页面上缘，不随卡片一起移动 -->
          <div class="pointer-events-none absolute left-1/2 top-16 w-full max-w-2xl -translate-x-1/2 px-4">
            <h1 class="text-2xl font-semibold tracking-tight text-[var(--ink-primary)] sm:text-3xl">
              {{ t("hero.title") }}
            </h1>
            <p class="mt-3 text-[0.9rem] text-[var(--ink-muted)]">
              {{ t("hero.subtitle") }}
            </p>
          </div>

          <!-- 语言切换：授权 / 配置引导页中也可切换 -->
          <div class="absolute right-6 top-6 z-20 flex items-center gap-1 rounded-full border border-[var(--border-light)] bg-white px-1 py-0.5 text-[0.75rem] text-[#5f5f5f]">
            <button
              type="button"
              class="px-2 py-0.5 rounded-full transition-colors"
              :class="locale === 'zh' ? 'bg-[var(--accent)] text-white' : 'hover:bg-[#f5f5f5]'"
              @click="setLocale('zh')"
            >
              中
            </button>
            <button
              type="button"
              class="px-2 py-0.5 rounded-full transition-colors"
              :class="locale === 'en' ? 'bg-[var(--accent)] text-white' : 'hover:bg-[#f5f5f5]'"
              @click="setLocale('en')"
            >
              EN
            </button>
          </div>

          <div class="z-10 max-w-xl rounded-2xl border border-[var(--border-light)] bg-[var(--surface)] p-8 shadow-lg text-left">
            <!-- 步骤指示 -->
            <div class="mb-6 flex items-center gap-3 text-[0.8rem]">
              <div
                class="flex items-center gap-2 rounded-full px-3 py-1"
                :class="onboardingStep === 1 ? 'bg-[var(--accent)] text-white' : 'bg-[var(--accent-light)] text-[var(--ink-muted)]'"
              >
                <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/10 text-[0.75rem]">1</span>
                <span>{{ t("consent.step1") }}</span>
              </div>
              <div class="h-px flex-1 bg-[var(--border-light)]" />
              <div
                class="flex items-center gap-2 rounded-full px-3 py-1"
                :class="onboardingStep === 2 ? 'bg-[var(--accent)] text-white' : 'bg-[var(--accent-light)] text-[var(--ink-muted)]'"
              >
                <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/10 text-[0.75rem]">2</span>
                <span>{{ t("consent.step2") }}</span>
              </div>
            </div>

            <!-- Step 1：授权 -->
            <template v-if="onboardingStep === 1">
              <h2 class="mb-2 text-xl font-semibold text-[var(--ink-primary)]">{{ t("consent.title") }}</h2>
              <p class="mb-2 text-sm text-[var(--ink-muted)]">
                {{ t("consent.description") }}
              </p>
              <p class="mb-3 text-sm font-medium text-[var(--ink-primary)]">
                {{ t("consent.currentOs") }}{{ platformLabel }}
              </p>
              <p class="mb-2 text-[0.8rem] text-[#7f7f7f]">
                {{ t("consent.pathsTitlePrefix") }}{{ platformLabel }}{{ t("consent.pathsTitleSuffix") }}
              </p>
              <ul class="mb-6 list-inside list-disc space-y-1 rounded-lg bg-[#f9f9f9] px-4 py-3 font-mono text-[0.8rem] text-[#5f5f5f] break-all">
                <li v-for="(p, i) in pathsForDisplay" :key="i">{{ p }}</li>
              </ul>
              <div class="flex flex-wrap gap-3">
                <button
                  type="button"
                  class="rounded-full bg-[var(--accent)] px-6 py-2.5 text-[0.9rem] font-medium text-white transition-opacity hover:opacity-90"
                  @click="grantConsent"
                >
                  {{ t("consent.allow") }}
                </button>
                <button
                  type="button"
                  class="rounded-full border border-[var(--border-mid)] bg-white px-6 py-2.5 text-[0.9rem] font-medium text-[#5f5f5f] transition-colors hover:bg-[#f5f5f5]"
                  @click="denyConsent"
                >
                  {{ t("consent.deny") }}
                </button>
              </div>
            </template>

            <!-- Step 2：初始化配置（仅分类方案） -->
            <template v-else>
              <h2 class="mb-2 text-xl font-semibold text-[var(--ink-primary)]">{{ t("configInit.title") }}</h2>
              <p class="mb-4 text-sm text-[var(--ink-muted)]">
                {{ t("configInit.description") }}
              </p>
              <h3 class="mb-2 text-sm font-medium text-[var(--ink-primary)]">{{ t("configInit.schemeTitle") }}</h3>
              <div class="mb-6 space-y-3">
                <label
                  v-for="s in configSchemes"
                  :key="s.id"
                  class="flex cursor-pointer gap-3 rounded-lg border px-4 py-3 transition-colors"
                  :class="configCurrentId === s.id ? 'border-[var(--accent)] bg-[var(--accent-light)]' : 'border-[var(--border-light)] hover:bg-[var(--accent-light)]/30'"
                >
                  <input
                    v-model="configCurrentId"
                    type="radio"
                    :value="s.id"
                    class="mt-1 shrink-0"
                  />
                  <div>
                    <span class="font-medium text-[var(--ink-primary)]">{{ schemeName(s) }}</span>
                    <p class="mt-0.5 text-[0.8rem] text-[var(--ink-muted)]">{{ schemeDescription(s) }}</p>
                  </div>
                </label>
              </div>
              <p v-if="configError" class="mt-3 text-[0.85rem] text-red-500">{{ configError }}</p>
              <div class="mt-6 flex justify-end">
                <button
                  type="button"
                  class="rounded-full bg-[var(--accent)] px-6 py-2.5 text-[0.9rem] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  :disabled="configSaving"
                  @click="finishConfigStep"
                >
                  {{ configSaving ? t("drawer.saving") : t("configInit.done") }}
                </button>
              </div>
            </template>
          </div>
        </div>
      </template>
      <template v-else-if="consentLoading && !consentStatus">
        <div class="flex flex-1 items-center justify-center text-[var(--ink-muted)]">
          <span class="animate-pulse">{{ t("common.loading") }}</span>
        </div>
      </template>
      <template v-else-if="loading">
        <div class="scan-loading flex flex-1 flex-col items-center justify-center gap-6 text-[var(--ink-muted)]">
          <div class="scan-spinner" aria-hidden="true" />
          <p class="text-[0.95rem] font-medium text-[var(--ink-primary)]">正在扫描本机 Skills…</p>
          <p class="text-[0.8rem] opacity-80">读取目录与 SKILL.md，请稍候</p>
        </div>
      </template>
      <template v-else-if="error">
        <div class="flex flex-1 items-center justify-center px-6">
          <div class="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-center text-red-600">{{ error }}</div>
        </div>
      </template>
      <template v-else-if="!hasSkills && !initialConfigDone">
        <div class="flex flex-1 flex-col items-center justify-center px-8">
          <p class="mb-2 text-center text-sm font-medium text-[var(--ink-primary)]">
            {{ consentStatus === 'granted' ? t("empty.grantedTitle") : t("empty.deniedTitle") }}
          </p>
          <p class="mb-4 text-center text-sm text-[var(--ink-muted)]">
            {{ consentStatus === 'granted' ? t("empty.grantedDesc") : t("empty.deniedDesc") }}
          </p>
          <PathInput :current-root="customRoot" @submit="onPathSubmit" />
          <details class="mt-6 w-full max-w-xl" open>
            <summary class="cursor-pointer text-[0.85rem] font-medium text-[var(--ink-primary)] hover:underline">
              {{ t("empty.commonPathsTitle") }}{{ platformLabel }}{{ t("empty.commonPathsTitleSuffix") }}
            </summary>
            <ul class="mt-3 list-inside space-y-1.5 rounded-lg bg-[#f9f9f9] px-4 py-3 text-left font-mono text-[0.8rem] text-[#5f5f5f] break-all">
              <li v-for="(p, i) in pathsForDisplay" :key="i">{{ p }}</li>
            </ul>
            <p v-if="effectivePlatform === 'win32'" class="mt-2 text-[0.75rem] text-[#7f7f7f]">
              {{ t("empty.winHint") }}
            </p>
            <p v-else-if="effectivePlatform === 'darwin' || effectivePlatform === 'linux'" class="mt-2 text-[0.75rem] text-[#7f7f7f]">
              {{ t("empty.unixHint") }}
            </p>
          </details>
          <div class="mt-6 flex items-center justify-center">
            <button
              type="button"
              class="rounded-full border border-[var(--border-mid)] bg-white px-4 py-2 text-[0.8rem] font-medium text-[var(--ink-muted)] hover:bg-[var(--accent-light)]/50"
              @click="resetConsent"
            >
              {{ t("empty.back") }}
            </button>
          </div>
        </div>
      </template>
      <template v-else>
        <!-- 工具栏 -->
        <div class="flex items-center justify-between border-b border-[var(--border-light)] px-6 py-6 pb-4">
          <div v-if="!pathChipEdit" class="path-chip flex cursor-default items-center gap-2 rounded-full border border-[var(--border-light)] bg-[#f7f7f7] px-3.5 py-1.5 text-[0.85rem] text-[#5f5f5f]" @click="startPathEdit">
            <FolderOpenIcon class="h-4 w-4 shrink-0 text-[#9f9f9f]" />
            <span class="font-mono">{{ displayPath || "选择路径" }}</span>
            <PencilSquareIcon class="ml-1 h-4 w-4 shrink-0 text-[#9f9f9f]" />
          </div>
          <div v-else class="flex items-center gap-2">
            <input
              v-model="pathInputValue"
              type="text"
              class="path-edit-input w-80 rounded-full border border-[var(--border-light)] bg-white px-4 py-1.5 font-mono text-[0.85rem] outline-none focus:border-[#c0c0c0]"
              placeholder="输入 Skills 根路径"
              @keydown.enter="submitPathEdit"
              @keydown.escape="pathChipEdit = false"
            />
            <button type="button" class="rounded-full bg-[var(--accent)] px-3 py-1.5 text-[0.85rem] font-medium text-white" @click="submitPathEdit">确定</button>
            <button type="button" class="rounded-full px-3 py-1.5 text-[0.85rem] text-[var(--ink-muted)]" @click="pathChipEdit = false">取消</button>
          </div>
          <div class="right-actions flex items-center gap-4">
            <div class="search-wrapper relative">
              <MagnifyingGlassIcon class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9f9f9f]" />
              <input
                v-model="searchQuery"
                type="search"
                class="search-input h-9 w-60 rounded-full border border-[var(--border-light)] bg-white py-2 pl-10 pr-4 text-[0.85rem] shadow-sm outline-none transition-all placeholder:text-[#9f9f9f] focus:border-[#c0c0c0] focus:shadow-md"
                :placeholder="t('common.searchPlaceholder')"
              />
            </div>
            <div class="view-toggle hidden items-center rounded-full bg-[#f5f5f5] p-0.5 text-[0.8rem] text-[#5f5f5f] sm:flex">
              <button
                type="button"
                class="flex h-7 w-8 items-center justify-center rounded-full transition-colors"
                :class="viewMode === 'card' ? 'bg-[var(--accent)] text-white' : 'text-[#5f5f5f] hover:bg-white'"
                :title="t('toolbar.viewCard')"
                @click.stop="setViewMode('card')"
              >
                <Squares2X2Icon class="h-4 w-4" />
              </button>
              <button
                type="button"
                class="flex h-7 w-8 items-center justify-center rounded-full transition-colors"
                :class="viewMode === 'list' ? 'bg-[var(--accent)] text-white' : 'text-[#5f5f5f] hover:bg-white'"
                :title="t('toolbar.viewList')"
                @click.stop="setViewMode('list')"
              >
                <Bars3Icon class="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              class="icon-btn flex h-9 w-9 items-center justify-center rounded-full text-[#5f5f5f] transition-colors hover:bg-[#f0f0f0]"
              :title="t('toolbar.theme')"
              @click="openTheme"
            >
              <SwatchIcon class="h-5 w-5" />
            </button>
            <button
              type="button"
              class="icon-btn flex h-9 w-9 items-center justify-center rounded-full text-[#5f5f5f] transition-colors hover:bg-[#f0f0f0]"
              :title="t('toolbar.config')"
              @click="openConfig"
            >
              <Cog6ToothIcon class="h-5 w-5" />
            </button>
            <button
              type="button"
              class="icon-btn flex h-9 w-9 items-center justify-center rounded-full text-[#5f5f5f] transition-colors hover:bg-[#f0f0f0]"
              :title="t('toolbar.refresh')"
              @click="onRefresh"
            >
              <ArrowPathIcon class="h-5 w-5" />
            </button>
            <!-- 语言切换：简体中文 / English -->
            <div class="hidden items-center gap-1 rounded-full border border-[var(--border-light)] bg-white px-1 py-0.5 text-[0.75rem] text-[#5f5f5f] sm:flex">
              <button
                type="button"
                class="px-2 py-0.5 rounded-full transition-colors"
                :class="locale === 'zh' ? 'bg-[var(--accent)] text-white' : 'hover:bg-[#f5f5f5]'"
                @click="setLocale('zh')"
              >
                中
              </button>
              <button
                type="button"
                class="px-2 py-0.5 rounded-full transition-colors"
                :class="locale === 'en' ? 'bg-[var(--accent)] text-white' : 'hover:bg-[#f5f5f5]'"
                @click="setLocale('en')"
              >
                EN
              </button>
            </div>
          </div>
        </div>

        <!-- 筛选胶囊 -->
        <div class="flex flex-wrap gap-2 border-b border-[var(--border-light)] px-6 py-4 pb-2">
          <button
            type="button"
            class="pill rounded-full border px-3.5 py-1.5 text-[0.8rem] font-medium transition-colors"
            :class="!filterSource && !filterCategory ? 'active' : 'border-[var(--border-mid)] text-[#5f5f5f] hover:bg-[#f5f5f5]'"
            @click="filterSource = ''; filterCategory = ''"
          >
            {{ t("nav.all") }}
          </button>
          <button
            v-for="item in sourceCounts"
            :key="'src-' + item.value"
            type="button"
            class="pill rounded-full border px-3.5 py-1.5 text-[0.8rem] font-medium transition-colors"
            :class="filterSource === item.value ? 'active' : 'border-[var(--border-mid)] text-[#5f5f5f] hover:bg-[#f5f5f5]'"
            @click="filterSource = item.value; filterCategory = ''"
          >
            {{ item.label }}
          </button>
          <template v-if="categoryCounts.length > 0">
            <span class="mx-1 self-center text-[#d0d0d0]">|</span>
            <button
              v-for="item in categoryCounts"
              :key="'cat-' + item.value"
              type="button"
              class="pill rounded-full border px-3.5 py-1.5 text-[0.8rem] font-medium transition-colors"
              :class="filterCategory === item.value ? 'active' : 'border-[var(--border-mid)] text-[#5f5f5f] hover:bg-[#f5f5f5]'"
              @click="filterCategory = item.value"
            >
              {{ item.label }}
            </button>
          </template>
        </div>

        <!-- 列表 / 卡片视图 -->
        <div class="card-grid flex-1 overflow-y-auto px-6 py-4 pb-6">
          <template v-if="viewMode === 'card'">
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <SkillCard
                v-for="skill in filteredSkills"
                :key="skill.id"
                :skill="skill"
                :selected="selectedSkill?.id === skill.id"
                :category-options="categoryOptions"
                @click="selectSkill(skill)"
                @category-updated="onCategoryUpdated"
              />
            </div>
          </template>
          <template v-else>
            <div class="list-view divide-y divide-[var(--border-light)] rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface)]">
              <SkillListRow
                v-for="skill in filteredSkills"
                :key="skill.id"
                :skill="skill"
                :selected="selectedSkill?.id === skill.id"
                :category-options="categoryOptions"
                @click="selectSkill(skill)"
                @category-updated="onCategoryUpdated"
              />
            </div>
          </template>
        </div>
      </template>
    </main>

    <!-- 右侧抽屉 -->
    <SkillDrawer
        v-if="selectedSkill"
        :skill="selectedSkill"
        :category-options="categoryOptions"
        @close="closeDrawer"
        @category-updated="onCategoryUpdated"
      />

    <!-- 配置弹层 -->
    <Teleport to="body">
      <div
        v-if="showConfigModal"
        class="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4"
        @click.self="showConfigModal = false"
      >
        <div class="config-modal max-h-[85vh] w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border-light)] bg-[var(--surface)] shadow-xl" @click.stop>
          <div class="border-b border-[var(--border-light)] px-6 py-4">
            <h2 class="text-lg font-semibold text-[var(--ink-primary)]">{{ t("toolbar.config") }}</h2>
          </div>
          <div class="overflow-y-auto px-6 py-5">
            <h3 class="mb-3 text-sm font-medium text-[var(--ink-primary)]">{{ t("configInit.schemeTitle") }}</h3>
            <p class="mb-4 text-[0.85rem] text-[var(--ink-muted)]">
              {{ t("configInit.description") }}
            </p>
            <div class="mb-2 space-y-3">
              <label
                v-for="s in configSchemes"
                :key="s.id"
                class="flex cursor-pointer gap-3 rounded-lg border px-4 py-3 transition-colors"
                :class="configCurrentId === s.id ? 'border-[var(--accent)] bg-[var(--accent-light)]' : 'border-[var(--border-light)] hover:bg-[var(--accent-light)]/30'"
              >
                <input
                  v-model="configCurrentId"
                  type="radio"
                  :value="s.id"
                  class="mt-1 shrink-0"
                />
                <div>
                  <span class="font-medium text-[var(--ink-primary)]">{{ schemeName(s) }}</span>
                  <p class="mt-0.5 text-[0.8rem] text-[var(--ink-muted)]">{{ schemeDescription(s) }}</p>
                </div>
              </label>
            </div>
            <p v-if="configError" class="mt-3 text-[0.85rem] text-red-500">{{ configError }}</p>
          </div>
          <div class="flex justify-end gap-2 border-t border-[var(--border-light)] px-6 py-4">
            <button
              type="button"
              class="rounded-full border border-[var(--border-mid)] px-4 py-2 text-[0.85rem] font-medium text-[var(--ink-muted)] hover:bg-[var(--accent-light)]/50"
              @click="showConfigModal = false"
            >
              {{ t("common.cancel") }}
            </button>
            <button
              type="button"
              class="rounded-full bg-[var(--accent)] px-4 py-2 text-[0.85rem] font-medium text-white hover:opacity-90 disabled:opacity-60"
              :disabled="configSaving"
              @click="saveConfig"
            >
              {{ configSaving ? t("drawer.saving") : t("common.confirm") }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 主题弹层 -->
    <Teleport to="body">
      <div
        v-if="showThemeModal"
        class="fixed inset-0 z-[210] flex items-center justify-center bg-black/40 p-4"
        @click.self="showThemeModal = false"
      >
        <div class="theme-modal max-h-[85vh] w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border-light)] bg-[var(--surface)] shadow-xl" @click.stop>
          <div class="border-b border-[var(--border-light)] px-6 py-4">
            <h2 class="text-lg font-semibold text-[var(--ink-primary)]">{{ t("themeDialog.title") }}</h2>
            <p class="mt-1 text-[0.85rem] text-[var(--ink-muted)]">{{ t("themeDialog.subtitle") }}</p>
          </div>
          <div class="overflow-y-auto px-6 py-5">
            <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <button
                v-for="t in BUILTIN_THEMES"
                :key="t.id"
                type="button"
                class="theme-swatch flex flex-col items-stretch gap-1.5 rounded-lg border-2 px-3 py-2.5 text-left transition-colors"
                :class="configThemeId === t.id ? 'border-[var(--accent)] bg-[var(--accent-light)]' : 'border-[var(--border-light)] hover:border-[var(--border-mid)]'"
                :title="t.description"
                @click="saveTheme(t.id)"
              >
                <div class="flex gap-1">
                  <span class="h-4 w-4 shrink-0 rounded border border-black/10" :style="{ background: t.variables['--bg-page'] }" />
                  <span class="h-4 w-4 shrink-0 rounded border border-black/10" :style="{ background: t.variables['--accent'] }" />
                  <span class="h-4 w-4 shrink-0 rounded border border-black/10" :style="{ background: t.variables['--surface'] }" />
                </div>
                <span class="text-[0.75rem] font-medium text-[var(--ink-primary)] truncate">
                  {{ themeLabel(t.id, t.name) }}
                </span>
              </button>
            </div>
            <p v-if="themeError" class="mt-3 text-[0.85rem] text-red-500">{{ themeError }}</p>
          </div>
          <div class="flex justify-end gap-2 border-t border-[var(--border-light)] px-6 py-3 text-[0.8rem] text-[var(--ink-muted)]">
            <span v-if="themeSaving">{{ t("themeDialog.saving") }}</span>
            <span v-else>{{ t("themeDialog.hint") }}</span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.pill.active {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}
</style>
