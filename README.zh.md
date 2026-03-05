# YouSkills

本地 Skills 可视化器：在浏览器中查看本机已安装的 AI Skills（Codex、Cursor、OpenClaw 等），**纯本地、只读、不修改用户数据**。  
同时针对 Agent 友好，提供简单 API 方便二次集成。

---

## 特性一览

- **本地可视化**：扫描多种默认 Skills 安装目录，也支持自定义路径；结果以卡片视图和列表视图展示。
- **严格只读**：只做文件系统读取，不写入、不重命名、不删除用户的任何 Skills 文件。
- **动态分类 + 缓存**：支持多种分类方案（按输出物 / 按使用场景 / 按职业角色），并在本地缓存用户调整结果。
- **可调分类**：在卡片、列表行和详情抽屉中都可以直接修改分类，小分类使用中英双语展示。
- **主题与样式**：内置 11 套配色主题，可在界面中即时预览并保存。
- **国际化（i18n）**：目前支持 **中文 / 英文**，首屏和导航提供语言切换入口。
- **Agent 友好 API**：提供 `/api/skills`、`/api/manifest` 等接口，方便其他 Agent 或工具读取本地 Skills 清单。

---

## 快速开始

需要 Node.js **18+**。

```bash
# 安装依赖
npm install

# 构建（先前端后服务端）
npm run build

# 启动：本地服务 + 自动打开浏览器
npm start
# 或
node dist/cli.js
```

发布到 npm 之后，可以直接通过 npx 运行（无需 clone 仓库）：

```bash
npx you-skills
```

默认会在浏览器中打开：`http://localhost:12434`。

---

## 端口与环境变量

- **服务端口**：固定为 `12434`
- **访问地址**：`http://localhost:12434`

可选环境变量（用于默认扫描路径）：

- `CODEX_HOME`：Codex 根目录，默认 `~/.codex`
- `CURSOR_HOME`：Cursor 根目录，默认 `~/.cursor`

> 若默认路径下未找到 Skills，首屏会引导用户手动输入或选择 Skills 根目录。

---

## API（面向 Agent / 集成）

- **`GET /api/skills?root=`**
  - 获取 Skills 列表。`root` 为空时使用默认扫描路径，否则使用指定路径。
  - 返回字段包含 `path`、`name`、`description`、`category` 等。

- **`GET /api/skills/manifest`** / **`GET /api/manifest`**
  - 以结构化形式返回 Skills 清单，方便 Agent 一次性读取所有可用技能。

- **`PATCH /api/skills/category`**
  - 用户调整分类；Body 形如：  
    `{ "path": "<skill 绝对路径>", "category": "<新的类别名>" }`  
  - 写入本地缓存，不改动 Skills 本身。

- **`GET /api/browse?path=`**
  - 列出指定路径下的子目录，用于前端“选择 Skills 根目录”时的目录浏览。

- **`GET /api/config`**
  - 读取当前配置：`classification_scheme_id`、`theme_id` 以及可选的分类方案信息。

- **`PATCH /api/config`**
  - 更新配置，Body 示例：  
    ```jsonc
    {
      "classification_scheme_id": "by_output" | "by_scenario" | "by_role",
      "theme_id": "default" | "matcha" | "apricot" | ...
    }
    ```

---

## 配置与主题

- **配置文件路径**：`~/.you-skills/config.json`
  - 字段：
    - `classification_scheme_id`: `"by_output" | "by_scenario" | "by_role"`
    - `theme_id`: 主题 id（如 `"default"`, `"matcha"`, `"apricot"` …）

- **内置主题**：
  - 提供 11 套主题，包括浅灰默认、抹茶绿、杏粉、薰衣草、深夜番茄、海盐蓝绿、枯荷粉、冰川极光橙、砖红陶土、熔岩黑金、粉笔蓝 × 番红花等。
  - 可在界面右上角的「Theme / 主题」入口中即时预览并保存。

---

## 分类与本地缓存

- **分类方案（大类）**：
  - `by_output`：输出物维度（Output‑centric skills）
  - `by_scenario`：使用场景维度（Workflow‑centric skills）
  - `by_role`：职业角色维度（Role‑centric skills）

- **小类示例**：
  - 输出物维度：`文件生成 / File generation`、`网页与界面 / Web & interface`、`工具与集成 / Tools & integrations`、`内容与写作 / Content & writing` 等。
  - 使用场景维度：`文档办公 / Office documents`、`设计视觉 / Design & visuals`、`开发构建 / Development & build`、`知识参考 / Knowledge & reference` 等。
  - 职业角色维度：`管理者 / 运营`、`设计师`、`开发者 / 工程师`、`数据分析师`、`HR / 法务 / 行政`、`市场 / 品牌` 等。

- **分类缓存文件**：`~/.you-skills/category-cache.json`
  - 键：Skill 绝对路径  
  - 值：用户最终确认的分类（包括推断结果 + 手动修改）

- **工作方式**：
  1. 扫描时优先读取缓存中的类别。
  2. 若无缓存，则基于「名称 + 描述」与预设规则进行本地正则推断，并写回缓存。
  3. 用户在界面中手动修改分类时，会通过 `PATCH /api/skills/category` 写入缓存。

---

## 开发说明

```bash
# 仅构建服务端（调试 API）
npm run build:server

# 仅构建前端
npm run build:client

# 开发时：先构建服务端，再单独跑 Vite（前端 dev 环境会通过代理访问 12434 端口）
npm run build:server && npm run dev:client

# 另开一个终端跑 Node 服务
node dist/server/index.js
```

---

## 安全与隐私

- 仅读取本机磁盘中的 Skills 目录，无登录、无远程上传、无遥测。
- **不会**对用户 Skills 目录或文件进行任何写入、删除、重命名或内容修改。
- 默认扫描路径：`$CODEX_HOME/skills`、`$CURSOR_HOME/skills`、`~/.openclaw/skills`、`~/.agents/skills`；若未找到，可在首屏或工具栏中输入 / 选择自定义路径。

---

## 趣味说明

- **为什么端口是 `12434`？**  
  这是 2025 年上海平均薪资的一个“影子记忆”，希望这个端口号既容易记，又带一点“打工人小彩蛋”的味道。

- **为什么叫 `YouSkills` 而不是 `YourSkills`？**  
  在 AI 视角下，人本身也会逐渐变成一组 Skills 的组合。  
  `YouSkills` 更像是一个对话：既是在管理 “your skills”，也是在提示 **“you = skills”**——你和你的技能，都是这个系统里的一等公民。

