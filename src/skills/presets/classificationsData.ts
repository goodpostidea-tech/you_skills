/**
 * 内置预设分类方案（来自 skillstore-classifications.json）
 * 供配置选择与推断使用。
 */
export const BUILTIN_CLASSIFICATIONS = {
  classification_schemes: [
    {
      id: "by_output",
      name: "按输出物分类",
      description: "用户问「我能得到什么文件或结果」",
      match_field: ["name", "description"],
      categories: [
        { id: "document", label: "文件生成", emoji: "📄", rules: ["\\.(docx|xlsx|pptx|pdf|csv|tsv|xls|xlsm)\\b", "\\b(word|excel|spreadsheet|powerpoint|slide|deck|presentation|pdf|document|report|memo|letter|template|contract)\\b"] },
        { id: "web", label: "网页与界面", emoji: "🌐", rules: ["\\b(html|css|react|vue|component|landing.?page|dashboard|web|artifact|frontend|ui|interface)\\b"] },
        { id: "tool", label: "工具与集成", emoji: "⚙️", rules: ["\\b(mcp|server|api|integration|automation|browser|cli|tool|builder|plugin|extension)\\b"] },
        { id: "content", label: "内容与写作", emoji: "✍️", rules: ["\\b(write|writing|draft|content|communication|newsletter|update|art|design|visual|gif|animation|theme|style|brand|color|font|poster|image|canvas|generative)\\b"] },
      ],
    },
    {
      id: "by_scenario",
      name: "按使用场景分类",
      description: "用户问「我在做什么类型的工作」",
      match_field: ["name", "description"],
      categories: [
        { id: "office", label: "文档办公", emoji: "📝", rules: ["\\b(docx|xlsx|pptx|pdf|word|excel|spreadsheet|powerpoint|slide|deck|report|memo|letter|proposal|spec|documentation|co.?author|internal|status|update|newsletter|incident)\\b"] },
        { id: "design", label: "设计视觉", emoji: "🎨", rules: ["\\b(design|visual|art|poster|canvas|gif|animation|brand|theme|color|font|typography|frontend|html|css|react|component|interface|ui|aesthetic|style)\\b"] },
        { id: "dev", label: "开发构建", emoji: "🔧", rules: ["\\b(mcp|server|api|sdk|tool|build|builder|skill|eval|benchmark|integration|automation|code|script|deploy|bundle|react|typescript|node)\\b"] },
        { id: "knowledge", label: "知识参考", emoji: "🧠", rules: ["\\b(knowledge|product|pricing|model|plan|feature|guideline|policy|reimbursement|expense|benefit|fact|reference)\\b"] },
      ],
    },
    {
      id: "by_role",
      name: "按职业角色分类",
      description: "用户首次启动时选择职业，结果缓存，后续直接按角色过滤",
      match_field: ["name", "description"],
      roles: [
        { id: "manager", label: "管理者 / 运营", emoji: "👔", rules: ["\\b(report|memo|update|newsletter|status|leadership|presentation|slide|deck|pptx|docx|internal|communication|proposal|meeting|summary)\\b"] },
        { id: "designer", label: "设计师", emoji: "🎨", rules: ["\\b(design|visual|art|poster|canvas|gif|animation|brand|theme|color|font|typography|aesthetic|style|image|png|generative|algorithmic)\\b"] },
        { id: "developer", label: "开发者 / 工程师", emoji: "💻", rules: ["\\b(mcp|server|api|sdk|tool|build|skill|eval|integration|automation|code|script|html|css|react|typescript|node|bundle|artifact|component)\\b"] },
        { id: "analyst", label: "数据分析师", emoji: "📊", rules: ["\\b(xlsx|csv|tsv|excel|spreadsheet|chart|formula|data|table|pivot|row|column|clean|extract|pdf)\\b"] },
        { id: "hr_legal", label: "HR / 法务 / 行政", emoji: "📋", rules: ["\\b(docx|word|pdf|contract|template|letter|memo|reimbursement|expense|benefit|compliance|policy|form|internal|communication)\\b"] },
        { id: "marketer", label: "市场 / 品牌", emoji: "📣", rules: ["\\b(brand|campaign|poster|visual|design|pptx|slide|deck|newsletter|communication|gif|animation|theme|color|style|landing.?page|content)\\b"] },
      ],
    },
  ],
  matching_config: {
    case_sensitive: false,
    match_mode: "any",
    fallback_category: "other",
    fallback_label: "其他",
    fallback_emoji: "📦",
    priority: "first_match",
  },
} as const;

export type ClassificationSchemeId = "by_output" | "by_scenario" | "by_role";
