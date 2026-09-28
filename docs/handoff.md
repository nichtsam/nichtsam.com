# 交接文件

給接手的人（或 Claude Code）。先讀這份，再讀 `docs/spec.md`（設計規格）和 `AGENTS.md`（專案規則）。

- 分支：`claude/compassionate-curie-th80sg`
- 狀態：第一階段（app 本身）完成，還沒合併到 `main`
- 溝通：Sam 用繁體中文溝通，回覆請用繁體中文；程式碼、註解、commit 訊息用英文

## 1. 這是什麼

nichtsam.com 的重建版。整個網站像一張鉛筆畫的網頁線框稿：內容捲進畫面時被「畫出來」，
離開時被「擦掉」，換頁時整個畫面被來回塗滿再擦開。使用 Remix 3（`remix@3.0.0-rc.3`），
全部伺服器渲染，動畫只是增強層。

設計是用幾輪原型和 Sam 一起定下來的，細節都在 `docs/spec.md`。幾個 Sam 明確做過的決定：

- 風格：參考手繪網頁線框稿（整張紙外框、手寫導覽、有角標的主視覺框、方格卡片、線條分隔的頁尾）。
  不要模仿 Syncraft 那種吊牌式 header。
- 線條要粗糙、像鉛筆，每邊兩筆錯開、轉角畫超出去。
- 換頁轉場：一條連續鋼筆線斜向鋸齒來回塗三趟，把畫面塗滿再由左往右擦開。不要整片塗黑的感覺。
- 節奏要快：「看得出來，但不要讓人等」。轉場約 0.7 秒，主視覺翻頁約 0.8 秒。
- 火柴人角色已拿掉，之後另外設計。
- 沒有 JavaScript、減少動態、鍵盤操作、SEO、響應式都是硬性要求。

## 2. 開始

```sh
pnpm install
pnpm dev          # http://localhost:3000，改 server 端程式會自動重啟
pnpm hmr          # 同上，加上瀏覽器端熱更新
pnpm test         # remix test：路由與鉛筆產生器
pnpm typecheck
pnpm format
npx remix doctor  # 改結構或設定後跑一次
```

需要 Node.js 24.3 以上、pnpm 10（見 `mise.toml`）。完成任何改動前：
`pnpm format && pnpm typecheck && pnpm test`。

## 3. 程式碼地圖

```txt
server.ts                         Node 入口
app/routes.ts                     網址合約（唯一來源，產生 href 也用它）
app/router.ts                     middleware 順序與 controller 對應
app/middleware/theme.ts           讀 theme cookie；getContext() 讓 Document 拿到主題
app/content/                      articles.ts（Markdown + Shiki）、projects.ts、site.ts
app/actions/
  controller.tsx                  首頁、/about、POST /theme、sitemap、robots、404
  headers.ts                      頁面快取標頭（含 Vary: Cookie）
  home-page.tsx / about-page.tsx / not-found-page.tsx
  projects/  articles/            各自的 controller 與頁面；articles/feed.ts 是 RSS
  public/entry.ts                 啟動 Remix 瀏覽器執行環境
app/ui/
  document.tsx                    <html> 外殼、SEO 標籤、#js 開關的 inline script
  layout.tsx                      整張紙：Sheet 外框、header、footer；掛上 Ink 和 PageTransition
  headings.tsx                    SectionHeading、PageHeader（標題 + 鉛筆底線）
  lists.tsx                       ProjectTiles、ArticleList
  public/                         伺服器和瀏覽器都會用到的程式碼
    pencil.ts                     鉛筆線產生器（seeded）與會跟著尺寸重畫的 shapes
    doodles.ts                    固定比例的插圖與圖示（書桌、書本、圖示…）
    sketch.tsx                    <Sketch>（跟著元素大小）與 <Doodle>（固定比例）
    ink.tsx                       畫出／擦掉、依實際尺寸重畫框線
    page-transition.tsx           換頁轉場
    hero.tsx                      主視覺翻頁（carousel）
    theme-toggle.tsx              日夜切換
    site.css                      設計 token、全站樣式、ink 狀態、文章排版
content/articles/                 文章 Markdown
docs/spec.md                      設計規格
```

## 4. 關鍵機制

### 4.1 鉛筆線（`pencil.ts`、`doodles.ts`、`sketch.tsx`）

- 自製產生器，不用 roughjs。演算法仿 roughjs：兩端抖動、中段彎曲的三次貝茲曲線。
- 固定種子（`seed`）→ 伺服器和瀏覽器畫出一模一樣的線。
- `<Sketch shape seed width height>`：框、底線、分隔線。伺服器依猜測的尺寸畫，
  `preserveAspectRatio="none"` 先讓它跟著元素伸縮；`ink.tsx` 量到實際大小後用同一個種子重畫。
- `<Doodle name>`：固定比例的插圖，整張等比縮放，不會重畫。`weight` 可調線寬。
- 長邊的彎曲有上限（`MAX_SAG`），不然整張紙的外框在長頁面上會擠到內容。

### 4.2 畫出與擦掉（`ink.tsx` + `site.css`）

- 在元素加 `data-ink` 就會被畫出：文字用 clip-path 由左到右「寫」出來，SVG 用 dash offset 一筆一筆畫。
- 「先藏起來」的狀態只在 `:root:has(#js[data-on])` 而且 `prefers-reduced-motion: no-preference` 時才生效。
  `#js` 由 `document.tsx` 裡的 inline script 在第一次繪製前打開；3 秒內瀏覽器端程式沒啟動就自動關掉，
  內容絕不會一直藏著。
- 延遲用 `style="--d: 120ms"`，SVG 每一筆的間隔用 `--stagger`（預設 8ms，主視覺 4ms）。

### 4.3 換頁轉場（`page-transition.tsx`）

- 只包在 Remix 自己的 `navigate()` 外面。連結還是一般連結；沒有 Navigation API、減少動態、
  外部連結、新分頁、同頁錨點都不做轉場。
- 轉場圖層是瀏覽器端自己建立的 popover（`#page-transition`），放在瀏覽器最上層，
  而且不在 Remix 渲染的頁面裡。

### 4.4 日夜模式（`theme.ts`、`theme-toggle.tsx`）

- `theme` cookie（`light` / `dark`，沒有就跟系統）。伺服器讀 cookie 直接在 `<html data-theme>` 輸出，
  站內換頁時不會閃。
- 沒有 JavaScript：切換鈕是表單，`POST /theme` → 設 cookie → 303 導回（`returnTo` 只接受站內路徑）。
- 有 JavaScript：攔下 submit，直接改 `data-theme` 並寫同一個 cookie。首頁書桌上的檯燈也是這個表單的按鈕。

### 4.5 主視覺（`hero.tsx`）

- 沒有 JavaScript：三張排成可橫向捲動的一列（scroll-snap）。
- 有 JavaScript：一次一張，箭頭與圓點切換，輪播的 ARIA 與 live region 都有。不會自動輪播。
- 翻頁時先在舊的一張加 `data-erasing` 擦掉，再切換並發出 `pencil:refresh` 事件讓 ink 畫新的。

## 5. 踩過的坑（改之前先看）

1. **Remix 站內換頁會覆寫整個頁面 DOM。** 你在頁面裡動態加的東西（class、子元素）都可能被清掉。
   - 需要跨換頁保留的節點要加 `data-rmx-key` + `data-rmx-preserve-dom`（例如 `#js`）。
   - 轉場圖層曾因此在換頁瞬間被清空，新頁面的 header 直接露出來，所以改成放在頁面之外的 popover。
   - `ink.tsx` 用 MutationObserver 重新掃描；重畫框線時同時檢查 `data-fit`，因為換頁可能把路徑換回伺服器的版本。
2. **IntersectionObserver 會把 clip-path 算進去**，被 clip 掉的文字永遠不會「進入畫面」，所以 ink 改用 `getBoundingClientRect` 掃描。
3. **inline 元素的 clip-path 只作用在第一行**，所以 `span[data-ink]` 設成 `inline-block`。
4. **`css()` mixin 只會合併 `className`**，寫 `class` 會被蓋掉。
5. **`navigate()` 的 `resetScroll` 沒有把頁面捲回頂端**，轉場結束後手動 `scrollTo(0, 0)`（連結有 hash 除外）。
6. **action 上的 `formData()` middleware 型別推不出 `context.formData`**，`POST /theme` 直接用 `request.formData()`。
7. **JSX 動態標籤**要寫成 `'h2' as const`，不然型別錯。
8. **`compression()` 會在 `Vary` 加上 `accept-encoding`**，測試用 regex 比對。
9. **預留捲軸空間（`scrollbar-gutter: stable`）會讓 fixed 圖層蓋不到右邊那條**，已拿掉。
10. **強調色對比**：白天的 `#f06a1f` 在紙色上只有 3.7:1，改成 `#b8480a`（4.8:1）。改顏色要重算對比。

## 6. 驗證方式

- 路由和產生器：`pnpm test`（`app/actions/controller.test.ts`、`app/ui/public/pencil.test.ts`）。
- 畫面：用瀏覽器實際看，並檢查這幾種情況：
  - 桌機與手機寬度（375px）都沒有橫向捲動。
  - 關掉 JavaScript：內容全部看得到，日夜切換表單能用，主視覺可以橫向捲動。
  - 開啟減少動態：沒有任何動畫，換頁是一般換頁。
  - 鍵盤：Tab 第一個是「Skip to content」，焦點框看得見。
- 目前只在 Chromium 測過，Safari、Firefox 還沒看過。

## 7. 還沒做的

- 內容：About 的介紹、首頁「Currently / Likes / Based in」三行、專案頁說明，都是 placeholder，由 Sam 寫。
- 部署平台與架構（舊的 Fly.io 設定已刪除）、CI、文章管理方式、字型自架（目前用 Google Fonts）。
- 瀏覽器端與端對端測試（`remix test` 的 browser / e2e，需要 Playwright）。
- 角色設計。
- 合併到 `main` 前開 PR。
