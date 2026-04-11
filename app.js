const taskFilters = document.getElementById("taskFilters");
const taskList = document.getElementById("taskList");
const providerList = document.getElementById("providerList");
const skillList = document.getElementById("skillList");
const platformList = document.getElementById("platformList");
const googleStatus = document.getElementById("googleStatus");
const googleAuthBtn = document.getElementById("googleAuthBtn");
const logList = document.getElementById("logList");
const form = document.getElementById("chatForm");
const input = document.getElementById("chatInput");
const messages = document.getElementById("messages");
const msgTpl = document.getElementById("msgTpl");
const simulateBtn = document.getElementById("simulateBtn");

const APP_VERSION = "v0.2 Beta";
const MAX_LOG_ITEMS = 120;
const MAX_MESSAGE_ITEMS = 80;
let activeTaskFilter = "todo";
let googleAccount = null;
const timeFormatter = new Intl.DateTimeFormat("zh-CN", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const taskFilterLabels = {
  todo: "待办",
  running: "进行中",
  done: "已完成",
};

const tasks = [
  {
    title: "搭建 AI 编排工作台首页",
    status: "todo",
    priority: "P0",
    model: "GPT-4.1",
  },
  {
    title: "生成跨平台日报并同步 Slack",
    status: "running",
    priority: "P0",
    model: "Claude 3.7 Sonnet",
  },
  {
    title: "验证 Google OAuth 模拟流程",
    status: "done",
    priority: "P1",
    model: "Gemini 2.5 Pro",
  },
  {
    title: "输出 Skills 编排建议",
    status: "todo",
    priority: "P1",
    model: "Qwen",
  },
];

const providers = [
  { name: "OpenAI", model: "GPT-4.1", reason: 92, tool: 95, speed: 84 },
  { name: "Anthropic", model: "Claude 3.7 Sonnet", reason: 91, tool: 89, speed: 82 },
  { name: "Google", model: "Gemini 2.5 Pro", reason: 90, tool: 86, speed: 87 },
  { name: "Meta", model: "Llama 4", reason: 84, tool: 76, speed: 88 },
  { name: "Mistral", model: "Mistral Large", reason: 83, tool: 79, speed: 90 },
  { name: "阿里云", model: "Qwen", reason: 87, tool: 82, speed: 86 },
  { name: "百度", model: "文心", reason: 81, tool: 78, speed: 84 },
  { name: "xAI", model: "Grok", reason: 82, tool: 75, speed: 91 },
];

const skills = [
  "网页检索",
  "文档抽取",
  "多步骤编排",
  "日报周报",
  "表格分析",
  "代码审阅",
  "多语言翻译",
  "知识库问答",
  "Webhook 分发",
  "任务重试策略",
];

const platforms = [
  { name: "Slack", connected: true },
  { name: "Discord", connected: false },
  { name: "Microsoft Teams", connected: false },
  { name: "Telegram", connected: false },
  { name: "WhatsApp", connected: false },
  { name: "飞书 / Lark", connected: true },
  { name: "钉钉", connected: false },
];

const executionSteps = [
  "读取任务上下文并分析目标",
  "按任务类型匹配模型与 Skills",
  "生成执行计划（3 步）",
  "调用已连接通讯平台同步摘要",
  "回写任务状态与执行结果",
];

function getTimeStamp() {
  return timeFormatter.format(new Date());
}

function pushLog(text, level = "INFO") {
  const item = document.createElement("li");
  item.innerHTML = `<span class="log-level ${level.toLowerCase()}">${level}</span> ${getTimeStamp()} - ${text}`;
  logList.prepend(item);
  while (logList.children.length > MAX_LOG_ITEMS) {
    logList.removeChild(logList.lastElementChild);
  }
}

function appendMessage(role, content) {
  const msg = msgTpl.content.firstElementChild.cloneNode(true);
  msg.querySelector(".meta").textContent = `${role} · ${getTimeStamp()}`;
  msg.querySelector(".content").textContent = content;
  messages.appendChild(msg);
  while (messages.children.length > MAX_MESSAGE_ITEMS) {
    messages.removeChild(messages.firstElementChild);
  }
  messages.scrollTop = messages.scrollHeight;
}

function renderTaskFilters() {
  taskFilters.innerHTML = "";
  const fragment = document.createDocumentFragment();

  Object.entries(taskFilterLabels).forEach(([status, label]) => {
    const btn = document.createElement("button");
    btn.className = `tab ${activeTaskFilter === status ? "active" : ""}`;
    btn.type = "button";
    btn.dataset.status = status;
    const count = tasks.filter((task) => task.status === status).length;
    btn.textContent = `${label} (${count})`;
    fragment.appendChild(btn);
  });

  taskFilters.appendChild(fragment);
}

function renderTasks() {
  taskList.innerHTML = "";
  const fragment = document.createDocumentFragment();
  tasks
    .filter((task) => task.status === activeTaskFilter)
    .forEach((task) => {
      const li = document.createElement("li");
      li.className = "task-item";
      li.innerHTML = `
        <div class="task-title">${task.title}</div>
        <div class="task-meta">优先级：${task.priority} · 模型：${task.model}</div>
        <span class="status ${task.status}">${taskFilterLabels[task.status]}</span>
      `;
      fragment.appendChild(li);
    });

  if (!fragment.children.length) {
    const li = document.createElement("li");
    li.className = "task-item empty";
    li.textContent = "当前分组暂无任务";
    fragment.appendChild(li);
  }

  taskList.appendChild(fragment);
}

function capabilityBar(value) {
  return `<div class="metric"><span style="width:${value}%"></span></div>`;
}

function renderProviders() {
  providerList.innerHTML = "";
  const fragment = document.createDocumentFragment();
  providers.forEach((provider) => {
    const item = document.createElement("div");
    item.className = "stack-item provider-item";
    item.innerHTML = `
      <div class="provider-head">
        <div>${provider.name}</div>
        <div class="provider-meta">${provider.model}</div>
      </div>
      <div class="provider-metrics">
        <label>推理${capabilityBar(provider.reason)}</label>
        <label>工具${capabilityBar(provider.tool)}</label>
        <label>速度${capabilityBar(provider.speed)}</label>
      </div>
    `;
    fragment.appendChild(item);
  });
  providerList.appendChild(fragment);
}

function renderSkills() {
  skillList.innerHTML = "";
  const fragment = document.createDocumentFragment();
  skills.forEach((skill) => {
    const item = document.createElement("li");
    item.className = "pill";
    item.textContent = skill;
    fragment.appendChild(item);
  });
  skillList.appendChild(fragment);
}

function renderPlatforms() {
  platformList.innerHTML = "";
  const fragment = document.createDocumentFragment();
  platforms.forEach((platform, index) => {
    const item = document.createElement("div");
    item.className = "stack-item";
    item.innerHTML = `
      <div>
        <div>${platform.name}</div>
        <div class="provider-meta">${platform.connected ? "可接收执行结果" : "未授权"}</div>
      </div>
      <button data-index="${index}" class="tiny ${platform.connected ? "online" : ""}">${platform.connected ? "已连接" : "连接"}</button>
    `;
    fragment.appendChild(item);
  });
  platformList.appendChild(fragment);
}

function assistantReply(userText) {
  const replies = [
    `已接收任务：${userText}。我将先拆分步骤并绑定合适模型。`,
    "建议先确认目标平台，再自动生成日报并分发到已连接渠道。",
    "我已将任务加入待办列表，可点击“执行当前任务”查看自动化轨迹。",
  ];
  const reply = replies[Math.floor(Math.random() * replies.length)];
  appendMessage("assistant", reply);
  pushLog(`assistant 响应：${reply}`);
}

function connectGoogle() {
  googleAccount = "demo.user@gmail.com";
  googleStatus.textContent = googleAccount;
  googleAuthBtn.textContent = "Google 已连接";
  googleAuthBtn.disabled = true;
  appendMessage("assistant", `Google 账号已接入：${googleAccount}`);
  pushLog(`Google OAuth 模拟完成：${googleAccount}`);
}

async function simulateExecution() {
  const runningTask = tasks.find((task) => task.status === "running");
  if (!runningTask) {
    pushLog("没有进行中的任务，已自动切换第一个待办任务", "WARN");
    const fallback = tasks.find((task) => task.status === "todo");
    if (fallback) {
      fallback.status = "running";
    }
  }

  for (const step of executionSteps) {
    pushLog(step);
    await new Promise((resolve) => setTimeout(resolve, 260));
  }

  const current = tasks.find((task) => task.status === "running");
  if (current) {
    current.status = "done";
  }
  const next = tasks.find((task) => task.status === "todo");
  if (next) {
    next.status = "running";
  }

  renderTaskFilters();
  renderTasks();
  appendMessage("assistant", "自动化执行完成：任务状态和日志已更新。可继续下发新任务。");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  appendMessage("user", text);
  pushLog(`接收用户输入：${text}`);
  input.value = "";

  setTimeout(() => assistantReply(text), 260);
});

taskFilters.addEventListener("click", (e) => {
  const button = e.target.closest("button[data-status]");
  if (!button) return;
  activeTaskFilter = button.dataset.status;
  renderTaskFilters();
  renderTasks();
});

platformList.addEventListener("click", (e) => {
  const button = e.target.closest("button[data-index]");
  if (!button) return;
  const index = Number(button.dataset.index);
  const platform = platforms[index];
  platform.connected = !platform.connected;
  renderPlatforms();
  pushLog(`${platform.name} ${platform.connected ? "连接成功" : "已断开"}`);
});

googleAuthBtn.addEventListener("click", connectGoogle);
simulateBtn.addEventListener("click", simulateExecution);

appendMessage("assistant", "你好，我是 Manus 风格执行代理。你可以创建任务并查看执行轨迹。");
pushLog(`系统发布版本：${APP_VERSION}`);
renderTaskFilters();
renderTasks();
renderProviders();
renderSkills();
renderPlatforms();
