# 白話藥品卡

**線上網址：** <https://sean-fang178.github.io/yaozhitong-cards/>

[藥智通](https://github.com/Sean-Fang178/yaozhitong) 的精簡版：把食藥署官方仿單改寫成長輩看得懂的白話，一款藥一張卡，每一句都能展開「對照仿單原文」。

- 純 HTML / CSS / JavaScript，沒有建置步驟，直接用 GitHub Pages 發布
- 內容全部在 `data/`，新增一款藥只要加一個 JSON 檔、在清單裡加一行
- AI 協作規則寫在 [CLAUDE.md](CLAUDE.md)（[AGENTS.md](AGENTS.md) 指向同一份）

目前收錄：利控糖（糖尿病）、可得寧（高血壓）、鎮定錠（退燒止痛）。

本機預覽：

```
python -m http.server
# 開 http://localhost:8000
```

> ⚠️ 課堂示範作品，非醫療器材、非醫療服務，內容僅供衛教參考，不能取代醫師或藥師的專業判斷。
