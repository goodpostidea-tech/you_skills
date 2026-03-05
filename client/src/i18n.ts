import { ref } from "vue";

export type Locale = "zh" | "en";

const STORAGE_KEY_LOCALE = "you-skills-locale";

const browserLocale =
  typeof navigator !== "undefined"
    ? navigator.language?.toLowerCase() || navigator.languages?.[0]?.toLowerCase()
    : "";

function detectInitialLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_LOCALE) as Locale | null;
    if (stored === "zh" || stored === "en") return stored;
  } catch {
    // ignore
  }
  if (browserLocale.startsWith("zh")) return "zh";
  return "en";
}

const locale = ref<Locale>(detectInitialLocale());

const messages = {
  zh: {
    common: {
      appName: "YouSkills",
      slogan: "YouSkills：可视化本地技能管理",
      loading: "正在加载…",
      confirm: "确定",
      cancel: "取消",
      close: "关闭",
      fullScreen: "全屏查看",
      fullScreenExit: "退出全屏",
      searchPlaceholder: "搜索...",
      usePath: "使用该路径",
      emptyDash: "—",
    },
    hero: {
      title: "看清本地 Skills，从这里开始",
      subtitle: "YouSkills：可视化本地技能管理，让你和 Agent 一起管理已安装的所有本地技能。",
    },
    consent: {
      step1: "授权访问 Skills",
      step2: "预设分类配置",
      title: "访问本机 Skills",
      description: "是否允许从以下默认路径扫描并列出您电脑上已安装的 Skills？仅读取、不修改任何文件。",
      currentOs: "当前操作系统：",
      pathsTitlePrefix: "以下为 ",
      pathsTitleSuffix: " 下的默认扫描路径：",
      allow: "允许",
      deny: "拒绝，稍后手动输入路径",
    },
    configInit: {
      title: "初始化配置",
      description: "请选择本次使用的预设分类方案，之后可在右上角「配置」中随时修改。",
      schemeTitle: "分类方案",
      done: "完成，进入列表",
    },
    toolbar: {
      editPathPlaceholder: "输入 Skills 根路径",
      pathChipFallback: "选择路径",
      theme: "主题",
      config: "配置",
      refresh: "刷新",
      viewCard: "卡片视图",
      viewList: "列表视图",
    },
    themeDialog: {
      title: "配色主题",
      subtitle: "选择一套主题，界面会立即预览，并保存到本机配置。",
      saving: "正在保存主题…",
      hint: "点击任一主题即可保存并应用。",
    },
    empty: {
      grantedTitle: "在默认路径下未找到 Skills",
      deniedTitle: "请指定 Skills 根目录",
      grantedDesc:
        "请输入您的 Skills 根目录路径，或在本机文件管理器中打开该文件夹，在地址栏复制路径后粘贴到下方。",
      deniedDesc:
        "请输入本机 Skills 根目录路径，或打开文件管理器选择文件夹后，在地址栏复制路径粘贴到下方。",
      commonPathsTitle: "常见路径参考（当前操作系统：",
      commonPathsTitleSuffix: "）",
      winHint: "请将「您的用户名」替换为您的 Windows 用户名。",
      unixHint: "~ 表示您当前用户的主目录。",
      back: "返回",
    },
    schemes: {
      by_output: {
        name: "输出物维度",
        description: "从「我能得到什么文件或结果？」这个视角来找技能，例如文档、表格、PPT、PDF 等。",
      },
      by_scenario: {
        name: "使用场景维度",
        description: "从「我在做什么类型的工作？」这个视角来找技能，例如写报告、做方案、做复盘、做入职培训等。",
      },
      by_role: {
        name: "职业角色维度",
        description: "从「我是谁」的视角出发（如产品、设计、研发、运营），先选角色，再按角色快速筛选常用技能。",
      },
    },
    nav: {
      sources: "来源",
      all: "全部",
      types: "类型",
      allTypes: "全部类型",
    },
    card: {
      copy: "复制",
      copied: "已复制",
      copyFailed: "复制失败",
      categorySaving: "保存中…",
      categoryTooltip: "点击修改分类",
      customPlaceholder: "自定义分类",
      add: "添加",
    },
    list: {
      columnCategory: "分类",
      hintClick: "点击行查看详情",
    },
    drawer: {
      tabDoc: "使用说明",
      tabExample: "示例",
      tabInfo: "信息",
      sectionWhen: "何时使用",
      sectionDescription: "描述",
      sectionCategory: "分类",
      sectionPath: "路径",
      sectionSource: "来源",
      customCategoryPlaceholder: "或输入自定义分类",
      saving: "保存中…",
      fullScreen: "全屏查看",
      fullScreenExit: "退出全屏",
      close: "关闭",
    },
  },
  en: {
    common: {
      appName: "YouSkills",
      slogan: "YouSkills: visualize your local skills",
      loading: "Loading…",
      confirm: "OK",
      cancel: "Cancel",
      close: "Close",
      fullScreen: "Full screen",
      fullScreenExit: "Exit full screen",
      searchPlaceholder: "Search...",
      usePath: "Use this path",
      emptyDash: "—",
    },
    hero: {
      title: "Visual Management for Local Skills",
      subtitle: "YouSkills: visualize and manage all skills installed on your machine for you and your agents.",
    },
    consent: {
      step1: "Grant access to Skills",
      step2: "Preset classification",
      title: "Access local Skills",
      description:
        "Allow scanning the default paths below to list Skills installed on this machine. Read-only, never modifies files.",
      currentOs: "Current OS: ",
      pathsTitlePrefix: "Default scan paths on ",
      pathsTitleSuffix: ":",
      allow: "Allow",
      deny: "Deny, I will enter a path later",
    },
    configInit: {
      title: "Initial configuration",
      description: "Choose a preset classification scheme. You can always change it later in the Config panel.",
      schemeTitle: "Classification scheme",
      done: "Done, go to list",
    },
    toolbar: {
      editPathPlaceholder: "Enter Skills root path",
      pathChipFallback: "Select path",
      theme: "Theme",
      config: "Config",
      refresh: "Refresh",
      viewCard: "Card view",
      viewList: "List view",
    },
    themeDialog: {
      title: "Color themes",
      subtitle: "Pick a theme to instantly preview and save it to your local config.",
      saving: "Saving theme…",
      hint: "Click any theme to save and apply it.",
    },
    empty: {
      grantedTitle: "No Skills found in default paths",
      deniedTitle: "Please specify a Skills root directory",
      grantedDesc:
        "Enter your Skills root path, or open the folder in your file manager and paste the address bar path below.",
      deniedDesc:
        "Enter the local Skills root path, or open the folder in your file manager and paste the address bar path below.",
      commonPathsTitle: "Common locations (current OS: ",
      commonPathsTitleSuffix: ")",
      winHint: 'Replace "YourUserName" with your actual Windows user name.',
      unixHint: "~ stands for your home directory.",
      back: "Back",
    },
    schemes: {
      by_output: {
        name: "Output‑centric skills",
        description:
          "Focus on “what artifact or file do I get?” — documents, spreadsheets, slide decks, PDFs, and more.",
      },
      by_scenario: {
        name: "Workflow‑centric skills",
        description:
          "Group skills by “what kind of work am I doing?” — reporting, reviews, planning, onboarding, and other workflows.",
      },
      by_role: {
        name: "Role‑centric skills",
        description:
          "Start from the user’s role — PM, designer, engineer, ops — then filter and reuse skills by role.",
      },
    },
    nav: {
      sources: "Source",
      all: "All",
      types: "Type",
      allTypes: "All types",
    },
    card: {
      copy: "Copy",
      copied: "Copied",
      copyFailed: "Copy failed",
      categorySaving: "Saving…",
      categoryTooltip: "Click to change category",
      customPlaceholder: "Custom category",
      add: "Add",
    },
    list: {
      columnCategory: "Category",
      hintClick: "Click row to view details",
    },
    drawer: {
      tabDoc: "Docs",
      tabExample: "Examples",
      tabInfo: "Info",
      sectionWhen: "When to use",
      sectionDescription: "Description",
      sectionCategory: "Category",
      sectionPath: "Path",
      sectionSource: "Source",
      customCategoryPlaceholder: "Or enter a custom category",
      saving: "Saving…",
      fullScreen: "Full screen",
      fullScreenExit: "Exit full screen",
      close: "Close",
    },
  },
} as const;

type Messages = typeof messages;

const CATEGORY_LABELS: Record<
  string,
  {
    zh: string;
    en: string;
  }
> = {
  文档输出类: { zh: "文档输出类", en: "Document skills" },
  设计创作类: { zh: "设计创作类", en: "Creative & design skills" },
  工具构建类: { zh: "工具构建类", en: "Development & tooling skills" },
  知识库类: { zh: "知识库类", en: "Knowledge & reference skills" },
  文件生成: { zh: "文件生成", en: "File generation" },
  网页与界面: { zh: "网页与界面", en: "Web & interface" },
  工具与集成: { zh: "工具与集成", en: "Tools & integrations" },
  内容与写作: { zh: "内容与写作", en: "Content & writing" },
  文档办公: { zh: "文档办公", en: "Office documents" },
  设计视觉: { zh: "设计视觉", en: "Design & visuals" },
  开发构建: { zh: "开发构建", en: "Development & build" },
  知识参考: { zh: "知识参考", en: "Knowledge & reference" },
  "管理者 / 运营": { zh: "管理者 / 运营", en: "Managers & ops" },
  设计师: { zh: "设计师", en: "Designers" },
  "开发者 / 工程师": { zh: "开发者 / 工程师", en: "Developers & engineers" },
  数据分析师: { zh: "数据分析师", en: "Data analysts" },
  "HR / 法务 / 行政": { zh: "HR / 法务 / 行政", en: "HR / Legal / Admin" },
  "市场 / 品牌": { zh: "市场 / 品牌", en: "Marketing & brand" },
  其他: { zh: "其他", en: "Other" },
};

const THEME_LABELS: Record<
  string,
  {
    zh: string;
    en: string;
  }
> = {
  default: { zh: "默认（浅灰）", en: "Default (light gray)" },
  matcha: { zh: "抹茶绿 × 深墨", en: "Matcha green × deep ink" },
  apricot: { zh: "杏粉 × 深棕", en: "Apricot × dark brown" },
  lavender: { zh: "薰衣草 × 深紫黑", en: "Lavender × deep violet" },
  tomato: { zh: "深夜番茄（暗色）", en: "Midnight tomato (dark)" },
  seasalt: { zh: "海盐蓝绿", en: "Sea‑salt teal" },
  lotus: { zh: "枯荷粉 × 铁灰", en: "Lotus pink × iron gray" },
  glacier: { zh: "冰川白 × 极光橙（暗色）", en: "Glacier white × aurora orange (dark)" },
  terracotta: { zh: "砖红陶土", en: "Terracotta brick" },
  lava: { zh: "熔岩黑金（暗色）", en: "Lava black & gold (dark)" },
  chalk: { zh: "粉笔蓝 × 番红花", en: "Chalk blue × saffron" },
};

function getMessage(localeKey: Locale, path: string): string | undefined {
  const segments = path.split(".");
  let obj: any = (messages as Messages)[localeKey];
  for (const seg of segments) {
    if (!obj || typeof obj !== "object") return undefined;
    obj = obj[seg];
  }
  return typeof obj === "string" ? obj : undefined;
}

export function useI18n() {
  function t(path: string): string {
    const primary = getMessage(locale.value, path);
    if (primary != null) return primary;
    const fallback = getMessage("zh", path);
    return fallback ?? path;
  }

  function categoryLabel(raw: string): string {
    const map = CATEGORY_LABELS[raw];
    if (!map) return raw;
    return locale.value === "en" ? map.en : map.zh;
  }

  function themeLabel(id: string, fallback: string): string {
    const map = THEME_LABELS[id];
    if (!map) return fallback;
    return locale.value === "en" ? map.en : map.zh;
  }

  function setLocale(next: Locale) {
    if (next === locale.value) return;
    locale.value = next;
    try {
      localStorage.setItem(STORAGE_KEY_LOCALE, next);
    } catch {
      // ignore
    }
  }

  return {
    locale,
    t,
    setLocale,
    categoryLabel,
    themeLabel,
  };
}

