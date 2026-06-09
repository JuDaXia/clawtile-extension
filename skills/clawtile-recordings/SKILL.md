---
name: clawtile-recordings
description: 当用户问到 ClawTile 录音、录音转写、会议总结、待办抽取,或要"处理/总结/查看我的录音"、想把录音自动存到本地目录、或设置定时自动处理录音时使用。通过 ClawTile Agent 接口查询并处理用户的录音,并可把转写文档自动落盘到用户指定目录。
---

# ClawTile 录音助手

ClawTile 是一款随身录音设备:用户按一下就录音,录完自动上传云端、转写成带说话人和时间戳的文字。你的职责是帮用户查询、总结、归档这些录音,并能按用户设定的节奏自动把转写文档保存到他的工作区目录。

## 连接

本技能依赖 ClawTile Agent 工具:`list_recordings` / `get_transcript` / `write_summary` / `mark_summary_state` / `get_recording` / `get_my_user`。它们由 ClawTile 的 Agent 接口提供(MCP streamable-http:`https://voinko.com/api/agent/mcp`)。

连接通常在安装 gochat 插件时已建立,无需重复做。若工具不可用,按用户所在环境提示其完成绑定(配对码 / 令牌在 ClawTile 小程序「绑定智能体」处获取,一户一枚、换绑旧的失效):

- OpenClaw:`openclaw gochat bind-agent --code <配对码> --server https://voinko.com`
- Hermes:`hermes gochat mcp-configure --code <配对码> --server https://voinko.com`
- 其它 MCP 客户端:把 `https://voinko.com/api/agent/mcp` 加为 streamable-http MCP,header `Authorization: Bearer <ct_a_ 令牌>`

先调 `get_my_user` 做连通性自检。

## 可用工具(ClawTile Agent)

- `list_recordings` — 列录音。参数:`status`(默认 completed)、`summary_state`(none|dispatched|completed|failed)、`since`(ISO8601)、`limit`、`cursor`。
- `get_transcript(id)` — 取某条录音全文 + 分句(含 speaker/时间戳)+ `speaker_mapping`(把 S1/S2 映射成真实姓名)。
- `write_summary(recording_id, summary, action_items[], ...)` — 把总结+待办写回 ClawTile App 给用户看(summary ≤ 8KB,action_items ≤ 50 条)。
- `mark_summary_state(recording_id, state)` — 标记处理状态(`dispatched`=已处理 / `failed`)。
- `get_recording(id)` / `get_my_user` — 元数据 / 连通性自检。

## ★ 落盘到工作区(本技能的核心能力)

当用户要求"把录音 / 转写存到目录""自动保存录音"或设置自动处理时:

### 第一步:确认存放目录(第一次必须问用户)

- 先读取工作区的配置文件 `.clawtile/config.json`,若其中已有 `save_dir`,直接用它,**不要再问**。
- 若没有配置,**主动询问用户**:
  > 「转写文档要保存到哪个目录?(直接回车用默认 `./clawtile-recordings/`)」
- 拿到答复后,把选择写入 `.clawtile/config.json`,例如:
  ```json
  { "save_dir": "./clawtile-recordings/", "format": "md" }
  ```
  以后所有保存与定时任务都复用这个路径,不再重复询问(除非用户说要改目录)。
- 创建该目录(若不存在)。

### 第二步:把每条录音写成一个文件

文件名:`<created_at 的日期>-<标题>.md`(标题中的 `/ \ : 等非法字符替换为 `-`;无标题用 recording_id)。
文件内容:

```markdown
---
title: <标题>
date: <created_at>
duration_seconds: <duration_seconds>
speakers: <speaker_mapping 的值,逗号分隔>
recording_id: <id>
source: ClawTile
---

<应用 speaker_mapping 后的转写正文。可选:在正文后附「## 待办」列出抽取到的 action items>
```

- 同名文件已存在则跳过(或按用户要求覆盖),避免重复落盘。
- 写完后调用 `mark_summary_state(recording_id, "dispatched")` 标记已处理。

## 处理一条录音的标准流程

1. `get_transcript(id)` 拿全文,应用 `speaker_mapping` 把 S1/S2 换成真实姓名。
2. 按用户需要:生成总结 / 抽取待办 / 或仅整理原文。
3. 落盘到 `save_dir`(见上),需要时再 `write_summary` 写回 App。
4. **务必**调用 `write_summary` 或 `mark_summary_state` 之一收尾。
   ★ 关键:处理完没有回标状态,这条录音会一直算"未处理",定时任务会反复处理它、目录里出现重复文件。

## 常见请求 → 你该做什么

- "看看我的录音" / "最近录了啥"        → `list_recordings(limit=10)`,列标题+时间
- "还有哪些没处理的"                    → `list_recordings(summary_state="none")`
- "把这条 / 最新那条总结一下"           → `get_transcript` → 总结 →(按需)`write_summary`
- "把我的录音都存到本地"               → 确认目录 → 逐条落盘(见「落盘到工作区」)
- "这周录音里有哪些待办"               → `list_recordings(since=本周一)` → 逐条 `get_transcript` → 汇总
- "以后新录音自动帮我存好 / 总结好"     → 见「设置自动处理」

## 设置自动处理 / 定时落盘

ClawTile 不替你定时;用你所在平台的定时 / 例行任务能力来跑。配方(确保幂等):

```
每次触发时:
  1. 读取 .clawtile/config.json 的 save_dir(没有就先问用户一次)
  2. list_recordings(summary_state="none")   ← 只取没处理的,天然幂等,不会重复
  3. 对每条:get_transcript → 落盘到 save_dir →(按需 write_summary)→ mark_summary_state("dispatched")
```

例:用户说"每天早上 9 点把我新录的会都存到我的笔记目录" → 先问 / 确认目录 → 建一个每天 9 点的例行任务执行上面配方。
因为用 `summary_state="none"` 过滤、处理后回标状态,任务跑多少遍都不会重复处理同一条;某次离线漏跑了,下次自动补上。

## 注意

- 录音可能还在转写中,`get_transcript` 返回 "not transcribed yet"(409)时跳过,下次再试。
- 离线期间的录音会在下次连接 / 下次任务时自动补上(以 `summary_state="none"` 为准);但单次补推上限约最近 20 条,别让待处理长期积压。
- 总结必须基于转写正文,不要臆造;拿不准的信息明确标注。
- 一个用户对应一个绑定智能体;换绑后旧令牌失效。
