import "./style.css";

const STORAGE_KEY = "task4-study-board";

const STATUSES = [
  { value: "todo", label: "To Do", accent: "border-t-slate-400" },
  { value: "doing", label: "In Progress", accent: "border-t-blue-500" },
  { value: "done", label: "Done", accent: "border-t-green-500" },
];

const PRIORITIES = ["low", "medium", "high"];

const PRIORITY_LABELS = { low: "Low", medium: "Medium", high: "High" };

const PRIORITY_STYLES = {
  low: "bg-emerald-100 text-emerald-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-red-100 text-red-800",
};

const CONTROL =
  "w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm";
const BTN_SECONDARY =
  "rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-slate-50";
const BTN_DANGER =
  "rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50";

const STARTER_TASKS = [
  { id: "t1", title: "Practice DOM selectors", subject: "JavaScript", priority: "high", status: "todo" },
  { id: "t2", title: "Review array methods", subject: "JavaScript", priority: "medium", status: "todo" },
  { id: "t3", title: "Learn 20 new words", subject: "English", priority: "low", status: "todo" },
  { id: "t4", title: "Write a short essay", subject: "English", priority: "medium", status: "doing" },
  { id: "t5", title: "Solve algebra exercises", subject: "Math", priority: "high", status: "doing" },
  { id: "t6", title: "Review fractions", subject: "Math", priority: "low", status: "done" },
  { id: "t7", title: "Finish Django homework", subject: "Django", priority: "high", status: "done" },
];

const $ = (id) => document.getElementById(id);

const form = $("task-form");
const formHeading = $("form-heading");
const titleInput = $("title-input");
const subjectInput = $("subject-input");
const priorityInput = $("priority-input");
const titleError = $("title-error");
const subjectError = $("subject-error");
const submitBtn = $("submit-btn");
const cancelBtn = $("cancel-btn");
const searchInput = $("search-input");
const priorityFilter = $("priority-filter");
const clearFiltersBtn = $("clear-filters");
const filterStatus = $("filter-status");
const resetBtn = $("reset-btn");
const board = $("board");
const progress = $("progress");
const progressBar = $("progress-bar");

let tasks = loadTasks();
let editingId = null;
const filters = { query: "", priority: "all" };

function isValidTask(task) {
  return (
    task !== null &&
    typeof task === "object" &&
    typeof task.id === "string" &&
    typeof task.title === "string" &&
    typeof task.subject === "string" &&
    PRIORITIES.includes(task.priority) &&
    STATUSES.some((s) => s.value === task.status)
  );
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return structuredClone(STARTER_TASKS);
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Saved data is not an array");
    return parsed.filter(isValidTask);
  } catch {
    return structuredClone(STARTER_TASKS);
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // Storage can be unavailable (private mode or full); the board still works.
  }
}

function createId() {
  return `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function el(tag, className = "", text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function filtersActive() {
  return filters.query.trim() !== "" || filters.priority !== "all";
}

function matchesFilters(task) {
  const query = filters.query.trim().toLowerCase();
  const matchesText =
    query === "" ||
    task.title.toLowerCase().includes(query) ||
    task.subject.toLowerCase().includes(query);
  const matchesPriority =
    filters.priority === "all" || task.priority === filters.priority;
  return matchesText && matchesPriority;
}

function showError(input, errorEl, message) {
  errorEl.textContent = message;
  errorEl.classList.toggle("hidden", message === "");
  input.setAttribute("aria-invalid", message === "" ? "false" : "true");
}

function clearErrors() {
  showError(titleInput, titleError, "");
  showError(subjectInput, subjectError, "");
}

function setFormMode(editing) {
  formHeading.textContent = editing ? "Edit task" : "Add task";
  submitBtn.textContent = editing ? "Save changes" : "Add task";
  cancelBtn.classList.toggle("hidden", !editing);
}

function cancelEdit() {
  editingId = null;
  form.reset();
  priorityInput.value = "medium";
  clearErrors();
  setFormMode(false);
}

function startEdit(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  editingId = id;
  titleInput.value = task.title;
  subjectInput.value = task.subject;
  priorityInput.value = task.priority;
  clearErrors();
  setFormMode(true);
  form.scrollIntoView({ behavior: "smooth", block: "center" });
  titleInput.focus();
}

function moveTask(id, status) {
  const task = tasks.find((t) => t.id === id);
  if (!task || !STATUSES.some((s) => s.value === status)) return;
  task.status = status;
  saveTasks();
  render();
  board.querySelector(`select[data-id="${CSS.escape(id)}"]`)?.focus();
}

function deleteTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  if (!window.confirm(`Delete "${task.title}"?`)) return;
  tasks = tasks.filter((t) => t.id !== id);
  if (editingId === id) cancelEdit();
  saveTasks();
  render();
}

function createCard(task) {
  const card = el("article", "rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200");
  card.dataset.id = task.id;

  const title = el("h3", "break-words font-semibold", task.title);

  const meta = el("div", "mt-2 flex flex-wrap items-center gap-2 text-xs");
  meta.append(
    el("span", "rounded-full bg-slate-100 px-2 py-0.5 text-slate-700", task.subject),
    el(
      "span",
      `rounded-full px-2 py-0.5 font-medium ${PRIORITY_STYLES[task.priority]}`,
      `${PRIORITY_LABELS[task.priority]} priority`,
    ),
  );

  const selectId = `move-${task.id}`;
  const moveLabel = el("label", "mt-3 block text-xs text-slate-600", "Move to");
  moveLabel.htmlFor = selectId;
  const select = el("select", `${CONTROL} mt-1`);
  select.id = selectId;
  select.dataset.action = "move";
  select.dataset.id = task.id;
  for (const status of STATUSES) {
    const option = el("option", "", status.label);
    option.value = status.value;
    option.selected = status.value === task.status;
    select.append(option);
  }

  const actions = el("div", "mt-3 flex gap-2");
  const editBtn = el("button", BTN_SECONDARY, "Edit");
  editBtn.type = "button";
  editBtn.dataset.action = "edit";
  editBtn.dataset.id = task.id;
  editBtn.setAttribute("aria-label", `Edit ${task.title}`);
  const deleteBtn = el("button", BTN_DANGER, "Delete");
  deleteBtn.type = "button";
  deleteBtn.dataset.action = "delete";
  deleteBtn.dataset.id = task.id;
  deleteBtn.setAttribute("aria-label", `Delete ${task.title}`);
  actions.append(editBtn, deleteBtn);

  card.append(title, meta, moveLabel, select, actions);
  return card;
}

function createColumn(status) {
  const all = tasks.filter((t) => t.status === status.value);
  const shown = all.filter(matchesFilters);

  const section = el(
    "section",
    `rounded-lg border-t-4 bg-slate-50 p-3 ring-1 ring-slate-200 ${status.accent}`,
  );
  const headingId = `col-${status.value}-title`;
  section.setAttribute("aria-labelledby", headingId);

  const header = el("div", "mb-3 flex items-center justify-between");
  const heading = el("h2", "font-semibold", status.label);
  heading.id = headingId;
  const count = el(
    "span",
    "rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200",
    filtersActive() ? `${shown.length} of ${all.length}` : String(all.length),
  );
  header.append(heading, count);

  const list = el("div", "space-y-3");
  if (shown.length === 0) {
    list.append(
      el(
        "p",
        "rounded-md border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500",
        all.length === 0
          ? "No tasks in this column yet."
          : "No tasks match the current filters.",
      ),
    );
  } else {
    for (const task of shown) list.append(createCard(task));
  }

  section.append(header, list);
  return section;
}

function renderBoard() {
  board.replaceChildren(...STATUSES.map(createColumn));
}

function renderDashboard() {
  const counts = { todo: 0, doing: 0, done: 0 };
  for (const task of tasks) counts[task.status] += 1;
  const total = tasks.length;
  const percent = total === 0 ? 0 : Math.round((counts.done / total) * 100);

  $("stat-total").textContent = String(total);
  $("stat-todo").textContent = String(counts.todo);
  $("stat-doing").textContent = String(counts.doing);
  $("stat-done").textContent = String(counts.done);
  $("stat-percent").textContent = `${percent}%`;
  progressBar.style.width = `${percent}%`;
  progress.setAttribute("aria-valuenow", String(percent));
}

function renderFilterStatus() {
  const visible = tasks.filter(matchesFilters).length;
  clearFiltersBtn.disabled = !filtersActive();
  filterStatus.textContent = filtersActive()
    ? `Showing ${visible} of ${tasks.length} tasks.`
    : "";
}

function render() {
  renderDashboard();
  renderBoard();
  renderFilterStatus();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = titleInput.value.trim();
  const subject = subjectInput.value.trim();
  const priority = priorityInput.value;

  const titleMessage = title.length < 3 ? "Enter a title with at least 3 characters." : "";
  const subjectMessage = subject.length < 2 ? "Enter a subject with at least 2 characters." : "";
  showError(titleInput, titleError, titleMessage);
  showError(subjectInput, subjectError, subjectMessage);

  if (titleMessage || subjectMessage) {
    (titleMessage ? titleInput : subjectInput).focus();
    return;
  }
  if (!PRIORITIES.includes(priority)) return;

  if (editingId) {
    const task = tasks.find((t) => t.id === editingId);
    if (task) {
      task.title = title;
      task.subject = subject;
      task.priority = priority;
    }
  } else {
    tasks.push({ id: createId(), title, subject, priority, status: "todo" });
  }

  saveTasks();
  cancelEdit();
  render();
  titleInput.focus();
});

cancelBtn.addEventListener("click", () => {
  cancelEdit();
  titleInput.focus();
});

board.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  if (button.dataset.action === "edit") startEdit(button.dataset.id);
  if (button.dataset.action === "delete") deleteTask(button.dataset.id);
});

board.addEventListener("change", (event) => {
  const select = event.target.closest("select[data-action='move']");
  if (select) moveTask(select.dataset.id, select.value);
});

searchInput.addEventListener("input", () => {
  filters.query = searchInput.value;
  render();
});

priorityFilter.addEventListener("change", () => {
  filters.priority = priorityFilter.value;
  render();
});

clearFiltersBtn.addEventListener("click", () => {
  filters.query = "";
  filters.priority = "all";
  searchInput.value = "";
  priorityFilter.value = "all";
  render();
  searchInput.focus();
});

resetBtn.addEventListener("click", () => {
  if (!window.confirm("Reset the board to the starter tasks? Your current tasks will be lost.")) return;
  tasks = structuredClone(STARTER_TASKS);
  cancelEdit();
  saveTasks();
  render();
});

setFormMode(false);
render();