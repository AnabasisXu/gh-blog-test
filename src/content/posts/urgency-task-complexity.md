---
title: "基于 urgency 分析 task 的复杂度管理"
author: 徐振旭
pubDatetime: 2026-11-03T12:00:00+08:00
featured: false
draft: false
tags:
  - "Taskwarrior"
  - "urgency"
  - "复杂度管理"
  - "任务管理"
description: "把 Taskwarrior 的使用复杂性统一到 urgency，逐个检查增删改操作对分数的影响，并给出配置版本化、排序审计和影响面测试的管理流程。"
---

Taskwarrior 的使用复杂性可以压缩成一个问题：每次增删改，如何改变 urgency。`next` 报告按这个分数排序，`_urgency` 直接打印它，`info` 给出分项。使用者关心的“现在先做哪个”被同一个数字回答。于是复杂度管理有了账本：操作是记账，排序是余额，管理就是让账目可解释、可回滚、可审计。

## 为什么选 urgency 当统一度量

任务管理工具通常有十几个字段。逐个字段分析使用成本，结论会散。Taskwarrior 把所有字段折算进一个标量，反而给了一个统一入口。

一条任务的全部状态，最终表现为一个浮点数。用户不需要同时理解十二个系数，只需要知道哪些动作会移动这个数。设计者也可以用它检查接口：如果一次操作让分数变化得无法解释，这次操作就在泄漏实现细节。

代价是压缩本身有损。两个任务可能分数相同，含义完全不同。管理流程要补上解释层，不能只看排名。

## 本质复杂性：三组输入

任何任务管理工具都要处理三组东西。Taskwarrior 把它们映射成 urgency 项。

时间对应 `due`、`scheduled`、`waiting`、`age`。真实的“什么时候必须做”藏在这里。

关系对应 `dep` 产生的 `blocking` 与 `blocked`。谁挡住谁，决定一条任务能不能开始，也决定另一条任务有多急。

承诺强度对应 `priority`、`+next`、`project`、`tags`、`annotations`、`active`。这些是用户对重要性的显式声明。

这三组输入是本质的。换成 Todoist 或纸张，它们依然存在。Taskwarrior 的选择是把它们压成一个加权和。

## 偶然复杂性：操作对 urgency 的影响

下面这组数字来自隔离库，使用默认系数，没有加载本机定制。命令是 `task add`，随后 `task _urgency` 和 `task N info`。

| 操作 | 实测 urgency | 分项 |
| --- | --- | --- |
| 无属性任务 | 0 | 无 |
| `due:today` | 9.045 | due 0.754 × 12 |
| `priority:H` | 6 | 6 |
| `+next` | 15.8 | next 15 + tags 0.8 |
| `due:yesterday` | 9.5 | due 0.792 × 12 |
| 被依赖的任务 | 17.5 | blocking 8 + due 9.5 |
| 依赖别人的任务 | -5 | blocked -5 |
| 五项叠加 | 31.845 | next 15 + due 9.045 + priority 6 + project 1 + tags 0.8 |

这张表暴露了六个性质问题。数值实测于 2026-11-03 12:51，使用默认系数。due 因子随当前时间变化，复现时小数点后两位会不同。

改动会跨任务。给 B 加上 `dep:A`，B 变成 -5，A 同时变成 17.5。一个操作改了两条任务的排序，用户只对着 B 敲命令。

时间会自己改分数。用户什么都不做，due 因子随当前时间连续变化。今天 9.045，明天同一任务变成 9.5。排序在用户不操作时漂移，用户很难区分“我改了什么”和“时间改了什么”。

阈值不透明。标签数量在 1 个、2 个、3 个以上时因子分别是 0.8、0.9、1.0。年龄 365 天封顶。这些边界写在实现里，`info` 不提示，用户加第三个标签时看不到预期变化。

总分能拆，日常报告不拆。`task info` 有分项，`next` 报告只有总分。用户想知道“为什么这条排第一”，得逐条 info，或者凭经验猜。

配置会把 urgency 变成私有语义。系数是全局的，可以改。改完之后，urgent 的含义只对这台机器成立。

特殊标签带自指。`+next` 既表示“我决定先做这个”，又直接加 15 分，而 `next` 报告本身按 urgency 排序。标记动作和排序动作绑在同一个标签上。

## 本机配置已经把 urgency 变成私有语义

在写作这台机器上，`task show urgency` 的输出与默认值有多处不同。

| 项 | 默认 | 本机 |
| --- | --- | --- |
| `+next` | 15 | 16 |
| `due` | 12 | 15 |
| `blocked` | -5 | 0 |
| `blocking` | 8 | 0 |
| `age` | 2 | 0 |
| `priority:L` | 1.8 | 0 |
| `project:job` | 无 | 5 |
| `project:fun` | 无 | -1 |
| `estimate:L` | 无 | -1.5 |
| `estimate:M` | 无 | 0 |
| `estimate:S` | 无 | 0 |

这张表说明两件事。用户为了让排序符合自己的判断，已经投入了配置成本。配置完成之后，urgent 不再是文档里的 urgent，而是这套 `.taskrc` 的私有函数。换机器、升级版本、向别人解释排序，都要重新对齐。

复杂度管理的核心风险在这里。配置漂移没有版本记录，改系数没有回滚点，几个月后没人记得 `project:job` 为什么是 5。

## 管理方法

### 配置当代码

把 `.taskrc` 纳入一个版本库。只跟踪与 urgency 有关的行，不要把整份配置混进无关内容。

```bash
task show urgency > urgency-config.txt
git add urgency-config.txt
git commit -m "urgency: raise next to 16, zero age"
```

每次改系数都留一条提交信息，写清动机和预期影响。改之前跑一组固定任务，记录排序；改之后再跑一次，比较差异。系数是全局状态，改它等于改所有历史判断。

### 固定报告

日常只看一个报告，例如 `task next`，或者自定义一个只显示 ID、描述、urgency 的报告。不要在命令行临时拼 filter。临时的过滤条件会让不同终端看到不同排序，用户失去共同参照。

```bash
task rc.report.next.columns=id,description,urgency \
     rc.report.next.labels=ID,Task,Urg \
     next
```

### 动词用别名封装

把常用组合固定成短命令，用户敲动词，不直接拼字段。

```fish
function tn --description 'add task and mark next'
    task add $argv +next
end

function td --description 'complete task and show unblocked'
    task $argv done
    task +READY next
end
```

别名的价值在于把“加任务”和“打 next 标签”这两个动作固定成一次调用。用户不必每次记得 `+next` 会影响排序。

### 排序审计

定期把分数和分项对一遍，找出无法解释的高分任务。

```bash
task _urgency | sort -k4 -n -r | head -20
task 12 info
```

`info` 的分项表是唯一可靠的解释入口。如果一条任务的分数主要来自用户自己加的 UDA 系数，而这条任务并不紧急，说明系数需要校准。

审计频率按改动频率定。调整过系数的那一周每天看一次，稳定后每周一次。

### 影响面测试

在隔离库里跑一组固定任务，覆盖时间、依赖、承诺强度三类输入。每次改配置或升级版本，重跑一次，比较 urgency 表。

```bash
rm -rf /root/cleantest/work/tw-urgency/data
export TASKRC=/root/cleantest/work/tw-urgency/taskrc
task add "base" >/dev/null
task add "due" due:today >/dev/null
task add "high" priority:H >/dev/null
task add "next" +next >/dev/null
task add "combo" due:today priority:H +next project:job >/dev/null
task _urgency
```

隔离库不碰真实任务，可以随时重建。测试任务只用五个，足以覆盖主要系数。

### 系数变更纪律

一次只改一个系数，幅度控制在 1 以内。官方文档明确警告，任何一项都不该主导整个表达式。本机把 `blocked` 和 `blocking` 都设成 0，等于关掉了依赖对排序的影响。这个选择可以是合理的，但要写进提交信息，否则以后没人知道依赖还在、分数不反映它。

项目级系数只留给少量固定项目。项目一多，urgency 就变成局部规则集合，跨项目比较失效。

### 产品化封装

如果要把这套东西做成工具，暴露三个动作就够：记下、完成、推迟。排序由系统算，但每次给一句理由，把标量还原成可读依据。系数藏在“校准”模式里，改之前先预览排序变化。

用户不需要看见 `blocking` 和 `blocked` 的对称计分。系统应该把“这条任务挡住了别人”翻译成一句提示，而不是让用户记住 +8 和 -5。

## 三个可测指标

把“使用复杂性”落到数字，先定义三个指标。

影响面：一次操作影响几个任务的 urgency。`dep` 的影响面是 2，`due` 的影响面是 1。影响面越大，用户越难预测后果。

解释成本：从总分还原到分项要几步。`next` 报告是 0 步，只给总分；`info` 是 1 步；逐项改系数试错是 N 步。解释成本越高，排序越像黑箱。

时间漂移：不操作时分数在一天内变化多少。对同一条任务记录 `_urgency` 两次，间隔 24 小时，差值就是漂移量。漂移大的任务不适合做长期排序依据。

这三个指标都能用现成命令测，不需要改 Taskwarrior。

## 现成研究

没有一门叫“使用的复杂性”的统一理论。相邻的研究线有四条。

Cognitive Dimensions of Notations 最贴合。Green 和 Petre 1996 年提出一组评估记号与界面的维度，其中 viscosity 指做一次局部改动要花多少努力，hidden dependencies 指依赖关系不可见。Taskwarrior 的 `dep` 是标准的 hidden dependency，改一个任务影响另一个任务的分数。系数调整则是高 viscosity，改一个全局值要重新理解所有排序。

Feature fatigue。Thompson、Hamilton 和 Rust 2005 年在 Journal of Marketing Research 发表，结论是功能越多，购买前吸引力越高，使用后满意度越低。对应 Taskwarrior 的系数可调、UDA 可扩展，功能面越大，用户越要花时间维护自己的公式。

任务管理的实证研究。Bellotti 等人 2004 年在 CHI 发表 “What a to-do”，发现人们把待办分散在邮件、日历、纸上，任务列表只装少数。Blandford 和 Green 2001 年的 “Group and Individual Time Management Tools: What You Get is Not What You Need” 直接讨论工具提供的功能与用户实际需要不匹配。Haraty 等人 2016 年研究个人任务管理的个体差异，结论是统一工作流假设不成立。

认知负荷测量。NASA-TLX 和主观负荷问卷能测使用负担，但没有专门针对任务管理工具的复杂度指标。中文语境里也没有“使用复杂性”的固定术语，通常说可用性、认知负荷、交互成本。

现成研究分散在 HCI 的认知维度、消费者行为的功能疲劳、CSCW 的任务管理实证三条线。没有一篇把“增删改对排序分数的影响”当作复杂度度量。urgency 框架可以补一个小口子，前提是先定义影响面、解释成本、时间漂移这三个可测指标。

## 最小复现

隔离库在：

/root/cleantest/work/tw-urgency

复现命令：

```bash
rm -rf /root/cleantest/work/tw-urgency/data
export TASKRC=/root/cleantest/work/tw-urgency/taskrc
task add "combo" due:today priority:H +next project:job
task project:job info
```

实际输出：

```text
Urgency       31.84
    project             1 *    1 =      1
    tags              0.8 *    1 =    0.8
    due             0.754 *   12 =   9.04
    UDA priority.H      1 *    6 =      6
    TAG next            1 *   15 =     15
```

一条任务五个属性，用户要预测它的排名，需要同时知道五个系数和 due 因子。这是使用复杂性的最小样本，也是复杂度管理的最小测试用例。

## 参考

- https://taskwarrior.org/docs/urgency/
- https://en.wikipedia.org/wiki/Cognitive_dimensions_of_notations
- https://www.cl.cam.ac.uk/~afb21/CognitiveDimensions/CDtutorial.pdf
- https://www.rhsmith.umd.edu/news/feature-fatigue-research-proves-simpler-products-are-better-manufacturers-advised-lose-extra
- http://www.victoriabellotti.com/publications.html
- https://discovery.ucl.ac.uk/id/eprint/16608
- https://www.cs.ubc.ca/labs/edapt/papers/haraty2016_2.pdf
