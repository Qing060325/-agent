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

const APP_VERSION = "v0.1 Beta";
let googleAccount = null;

const tasks = [
  { title: "收集需求并拆分里程碑", status: "done" },
  { title: "生成每周项目进度摘要", status: "running" },
  { title: "输出可执行的风险清单", status: "todo" },
];

const providers = [
  { name: "OpenAI", models: "GPT-4.1 / GPT-4o / o3", status: "available" },
  { name: "Anthropic", models: "Claude 3.7 Sonnet", status: "available" },
  { name: "Google DeepMind", models: "Gemini 2.5 Pro", status: "available" },
  { name: "Meta", models: "Llama 4", status: "available" },
  { name: "Mistral", models: "Mistral Large", status: "available" },
  { name: "xAI", models: "Grok", status: "available" },
  { name: "阿里云", models: "通义千问", status: "available" },
  { name: "百度", models: "文心", status: "available" },
];

const skills = [
  "网页检索与信息汇总",
  "文档解析与结构化提取",
  "多步骤任务编排",
  "日报/周报自动生成",
  "SQL 数据分析",
  "代码审阅与修复建议",
];

const platforms = [
  { name: "Slack", connected: false },
  { name: "Discord", connected: false },
  { name: "Microsoft Teams", connected: false },
  { name: "Telegram", connected: false },
  { name: "WhatsApp", connected: false },
  { name: "飞书 / Lark", connected: false },
  { name: "钉钉", connected: false },
];

const workflowLogs = [
  "解析用户目标：聚焦项目管理自动化",
  "按任务上下文自动选择模型厂商",
  "加载 skills：检索、总结、结构化输出",
  "同步结果到已连接的通讯平台",
  "输出结论并更新任务面板",
];

function renderTasks() {
  taskList.innerHTML = "";
  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item";
    li.innerHTML = `
      <div>${task.title}</div>
      <span class="status ${task.status}">${task.status.toUpperCase()}</span>
    `;
    taskList.appendChild(li);
  });
}

function renderProviders() {
  providerList.innerHTML = "";
  providers.forEach((provider) => {
    const item = document.createElement("div");
    item.className = "stack-item";
    item.innerHTML = `
      <div>
        <div>${provider.name}</div>
        <div class="provider-meta">${provider.models}</div>
      </div>
      <span class="status ${provider.status}">${provider.status.toUpperCase()}</span>
    `;
    providerList.appendChild(item);
  });
}

function renderSkills() {
  skillList.innerHTML = "";
  skills.forEach((skill) => {
    const item = document.createElement("li");
    item.className = "pill";
    item.textContent = skill;
    skillList.appendChild(item);
  });
}

function renderPlatforms() {
  platformList.innerHTML = "";
  platforms.forEach((platform, index) => {
    const item = document.createElement("div");
    item.className = "stack-item";
    item.innerHTML = `
      <div>${platform.name}</div>
      <button data-index="${index}" class="tiny">${platform.connected ? "已连接" : "连接"}</button>
    `;
    platformList.appendChild(item);
  });
}

function pushLog(text) {
  const item = document.createElement("li");
  item.textContent = `${new Date().toLocaleTimeString()} - ${text}`;
  logList.prepend(item);
}

function appendMessage(role, content) {
  const msg = msgTpl.content.firstElementChild.cloneNode(true);
  msg.querySelector(".meta").textContent = `${role} · ${new Date().toLocaleTimeString()}`;
  msg.querySelector(".content").textContent = content;
  messages.appendChild(msg);
  messages.scrollTop = messages.scrollHeight;
}

function assistantReply(userText) {
  const replies = [
    `已收到：${userText}。我会先拆解目标，再列出可执行步骤。`,
    "我建议先确认截止时间和优先级，再由 Agent 自动生成日报。",
    "我可以调用不同厂商模型并把结果同步到 Slack/飞书。",
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
  pushLog(`Google OAuth 完成：${googleAccount}`);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  appendMessage("user", text);
  pushLog(`接收用户输入：${text}`);
  input.value = "";

  setTimeout(() => assistantReply(text), 360);
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

simulateBtn.addEventListener("click", async () => {
  for (const line of workflowLogs) {
    pushLog(line);
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  tasks[1].status = "done";
  tasks[2].status = "running";
  renderTasks();
  appendMessage("assistant", "自动化执行已完成一轮，任务状态与平台同步已刷新。");
});

appendMessage("assistant", "你好，我是 Manus 风格的执行代理。请告诉我你的目标。");
pushLog(`系统发布版本：${APP_VERSION}`);
renderTasks();
renderProviders();
renderSkills();
renderPlatforms();
workflowLogs.slice(0, 2).forEach(pushLog);
