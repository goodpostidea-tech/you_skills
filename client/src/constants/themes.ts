/**
 * 主题配色方案（来自 docs/skillstore-colors-v3.html、skillstore-colors-v5.html）
 * 与 :root 中 CSS 变量一一对应，应用时写入 document.documentElement.style
 */
export interface ThemeVariables {
  "--bg-page": string;
  "--surface": string;
  "--border-light": string;
  "--border-mid": string;
  "--ink-primary": string;
  "--ink-muted": string;
  "--accent": string;
  "--accent-light": string;
}

export interface Theme {
  id: string;
  name: string;
  description?: string;
  variables: ThemeVariables;
}

/** 默认（当前产品浅灰） */
const DEFAULT_THEME: Theme = {
  id: "default",
  name: "默认（浅灰）",
  description: "浅灰底、深灰字，简洁中性",
  variables: {
    "--bg-page": "#fcfcfc",
    "--surface": "#ffffff",
    "--border-light": "#f0f0f0",
    "--border-mid": "#eaeaea",
    "--ink-primary": "#1a1a1a",
    "--ink-muted": "#7a7a7a",
    "--accent": "#1a1a1a",
    "--accent-light": "#f0f0f0",
  },
};

/** 全部内置主题（v3: D,E,F,G,H；v5: N,O,P,Q,R） */
export const BUILTIN_THEMES: Theme[] = [
  DEFAULT_THEME,
  {
    id: "matcha",
    name: "抹茶绿 × 深墨",
    description: "日式设计年鉴感，黄绿调底色，极深墨色文字",
    variables: {
      "--bg-page": "#F4F8EE",
      "--surface": "#FFFFFF",
      "--border-light": "#D4DDCA",
      "--border-mid": "#c5cfc0",
      "--ink-primary": "#1A1F14",
      "--ink-muted": "#4A5A38",
      "--accent": "#5A7A3A",
      "--accent-light": "#EEF5E8",
    },
  },
  {
    id: "apricot",
    name: "杏粉 × 深棕",
    description: "精品咖啡店菜单感，杏色底调，深棕文字",
    variables: {
      "--bg-page": "#FDF5EF",
      "--surface": "#FFFFFF",
      "--border-light": "#E8D5C4",
      "--border-mid": "#ddc9b8",
      "--ink-primary": "#2C1A10",
      "--ink-muted": "#7A5040",
      "--accent": "#D4785A",
      "--accent-light": "#FFEEE6",
    },
  },
  {
    id: "lavender",
    name: "薰衣草 × 深紫黑",
    description: "独立唱片厂牌官网感，淡紫烟雾底，深紫黑文字",
    variables: {
      "--bg-page": "#F5F0FE",
      "--surface": "#FFFFFF",
      "--border-light": "#DDD5F8",
      "--border-mid": "#cec5f0",
      "--ink-primary": "#1A1228",
      "--ink-muted": "#5A4878",
      "--accent": "#8B5CF6",
      "--accent-light": "#F0EBFF",
    },
  },
  {
    id: "tomato",
    name: "深夜番茄（暗色）",
    description: "深棕黑底，番茄红 accent，暗色里最活泼",
    variables: {
      "--bg-page": "#1C1410",
      "--surface": "#2E2018",
      "--border-light": "#3E2E22",
      "--border-mid": "#4a3828",
      "--ink-primary": "#F5EDE5",
      "--ink-muted": "#A07860",
      "--accent": "#FF4D2E",
      "--accent-light": "#2A1810",
    },
  },
  {
    id: "seasalt",
    name: "海盐蓝绿",
    description: "北欧文具店感，极淡蓝绿雾气底，深青墨文字",
    variables: {
      "--bg-page": "#F0FAFA",
      "--surface": "#FFFFFF",
      "--border-light": "#C8E8E8",
      "--border-mid": "#b5d8d8",
      "--ink-primary": "#0F2A2A",
      "--ink-muted": "#2D6868",
      "--accent": "#0D9488",
      "--accent-light": "#CCFBF1",
    },
  },
  {
    id: "lotus",
    name: "枯荷粉 × 铁灰",
    description: "日系文创感，藕粉底配铁灰文字",
    variables: {
      "--bg-page": "#FAF0F2",
      "--surface": "#FFFFFF",
      "--border-light": "#E0C8D0",
      "--border-mid": "#d0b8c0",
      "--ink-primary": "#1E1820",
      "--ink-muted": "#6A5860",
      "--accent": "#C4607A",
      "--accent-light": "#FFE8EE",
    },
  },
  {
    id: "glacier",
    name: "冰川白 × 极光橙（暗色）",
    description: "北极科考站显示屏感，近黑蓝灰底，极光橙 accent",
    variables: {
      "--bg-page": "#0E1218",
      "--surface": "#1C2630",
      "--border-light": "#283444",
      "--border-mid": "#344458",
      "--ink-primary": "#E8F2F8",
      "--ink-muted": "#6888A0",
      "--accent": "#FF8C42",
      "--accent-light": "#1E1008",
    },
  },
  {
    id: "terracotta",
    name: "砖红陶土",
    description: "墨西哥工作室感，浅陶土底，砖红 accent",
    variables: {
      "--bg-page": "#FBF3EC",
      "--surface": "#FFF8F2",
      "--border-light": "#E0C8A8",
      "--border-mid": "#d0b898",
      "--ink-primary": "#1C1008",
      "--ink-muted": "#6A4420",
      "--accent": "#B84A2A",
      "--accent-light": "#FDEEE8",
    },
  },
  {
    id: "lava",
    name: "熔岩黑金（暗色）",
    description: "高端工具暗色界面，近黑暖底，金黄 accent",
    variables: {
      "--bg-page": "#141008",
      "--surface": "#241E14",
      "--border-light": "#382E1C",
      "--border-mid": "#463a24",
      "--ink-primary": "#F8EDD8",
      "--ink-muted": "#A08050",
      "--accent": "#F5A800",
      "--accent-light": "#201600",
    },
  },
  {
    id: "chalk",
    name: "粉笔蓝 × 番红花",
    description: "法国小学教室感，淡天蓝底，番红花橙 accent",
    variables: {
      "--bg-page": "#F0F6FF",
      "--surface": "#FFFFFF",
      "--border-light": "#C0D4F0",
      "--border-mid": "#a8c0e8",
      "--ink-primary": "#0C1830",
      "--ink-muted": "#385080",
      "--accent": "#E86820",
      "--accent-light": "#FFF0E4",
    },
  },
];

export const DEFAULT_THEME_ID = "default";

export type ThemeId = (typeof BUILTIN_THEMES)[number]["id"];

export function getThemeById(id: string): Theme | undefined {
  return BUILTIN_THEMES.find((t) => t.id === id);
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  const v = theme.variables;
  (Object.keys(v) as (keyof ThemeVariables)[]).forEach((key) => {
    root.style.setProperty(key, v[key]);
  });
}
