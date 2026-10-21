const STORAGE_KEY = "daymark-tasks";
const form = document.querySelector("#add-form");
const input = document.querySelector("#task-input");
const list = document.querySelector("#task-list");
const emptyState = document.querySelector("#empty-state");
const count = document.querySelector("#task-count");
const today = document.querySelector("#today");
let activeFilter = "all";
let tasks = loadTasks();

today.textContent = new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" }).format(new Date());

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved.filter(task => task && typeof task.id === "string" && typeof task.text === "string" && typeof task.completed === "boolean") : [];
  } catch (error) {
    console.error("Could not load saved tasks:", error);
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Could not save tasks:", error);
    emptyState.textContent = "Your browser could not save this change. Check your storage settings.";
  }
}

function render() {
  const visibleTasks = tasks.filter(task => activeFilter === "all" || (activeFilter === "active" ? !task.completed : task.completed));
  list.replaceChildren();
  visibleTasks.forEach(task => {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " completed" : ""}`;
    const toggle = document.createElement("button");
    toggle.className = "task-check";
    toggle.type = "button";
    toggle.setAttribute("aria-label", `${task.completed ? "Mark as active" : "Complete"}: ${task.text}`);
    toggle.setAttribute("aria-pressed", String(task.completed));
    toggle.addEventListener("click", () => {
      tasks = tasks.map(entry => entry.id === task.id ? { ...entry, completed: !entry.completed } : entry);
      saveTasks();
      render();
    });
    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;
    const remove = document.createElement("button");
    remove.className = "delete-task";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Delete: ${task.text}`);
    remove.addEventListener("click", () => {
      tasks = tasks.filter(entry => entry.id !== task.id);
      saveTasks();
      render();
    });
    item.append(toggle, text, remove);
    list.append(item);
  });
  const remaining = tasks.filter(task => !task.completed).length;
  count.textContent = `${remaining} ${remaining === 1 ? "task" : "tasks"} left`;
  emptyState.hidden = visibleTasks.length > 0;
  if (visibleTasks.length === 0) {
    emptyState.textContent = tasks.length === 0 ? "Your list is clear. Add one small thing to get started." : "Nothing to show here just yet.";
  }
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  tasks.unshift({ id: crypto.randomUUID(), text, completed: false });
  saveTasks();
  input.value = "";
  render();
  input.focus();
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll(".filter").forEach(filter => {
      const selected = filter === button;
      filter.classList.toggle("active", selected);
      filter.setAttribute("aria-pressed", String(selected));
    });
    render();
  });
});

document.querySelector("#clear-completed").addEventListener("click", () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  render();
});

render();
