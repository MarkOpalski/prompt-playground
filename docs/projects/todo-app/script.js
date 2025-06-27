// Todo App - Complete JavaScript Implementation
class TodoApp {
  constructor() {
    this.tasks = this.loadTasks();
    this.currentEditingId = null;
    this.draggedElement = null;
    this.draggedIndex = null;

    this.languages = {
      en: {
        addTask: "Add Task",
        editTask: "Edit Task",
        deleteTask: "Delete Task",
        taskTitle: "Task Title",
        category: "Category",
        priority: "Priority",
        dueDate: "Due Date",
        today: "Today",
        tomorrow: "Tomorrow",
        completed: "Completed",
        pending: "Pending",
        overdue: "Overdue",
        all: "All",
        personal: "Personal",
        work: "Work",
        other: "Other",
        high: "High",
        medium: "Medium",
        low: "Low",
        save: "Save",
        cancel: "Cancel",
        close: "Close",
        search: "Search",
        clearFilters: "Clear Filters",
        sortBy: "Sort By",
        dateCreated: "Date Created",
        taskAdded: "Task added successfully!",
        taskUpdated: "Task updated successfully!",
        taskDeleted: "Task deleted successfully!",
        taskCompleted: "Task completed!",
        taskUncompleted: "Task uncompleted!",
        pleaseEnterTitle: "Please enter a task title",
        taskDueToday: 'Task "{title}" is due today!',
        taskDueTomorrow: 'Task "{title}" is due tomorrow!',
        tasksExported: "Tasks exported successfully!",
        tasksImported: "Tasks imported successfully!",
        errorImporting: "Error importing tasks. Please check the file format.",
        notification: "Notification",
        language: "Language",
      },
      es: {
        addTask: "Agregar Tarea",
        editTask: "Editar Tarea",
        deleteTask: "Eliminar Tarea",
        taskTitle: "Título de la Tarea",
        category: "Categoría",
        priority: "Prioridad",
        dueDate: "Fecha Límite",
        today: "Hoy",
        tomorrow: "Mañana",
        completed: "Completado",
        pending: "Pendiente",
        overdue: "Atrasado",
        all: "Todas",
        personal: "Personal",
        work: "Trabajo",
        other: "Otro",
        high: "Alta",
        medium: "Media",
        low: "Baja",
        save: "Guardar",
        cancel: "Cancelar",
        close: "Cerrar",
        search: "Buscar",
        clearFilters: "Limpiar Filtros",
        sortBy: "Ordenar Por",
        dateCreated: "Fecha de Creación",
        taskAdded: "¡Tarea agregada exitosamente!",
        taskUpdated: "¡Tarea actualizada exitosamente!",
        taskDeleted: "¡Tarea eliminada exitosamente!",
        taskCompleted: "¡Tarea completada!",
        taskUncompleted: "¡Tarea marcada como pendiente!",
        pleaseEnterTitle: "Por favor ingrese un título de tarea",
        taskDueToday: '¡La tarea "{title}" vence hoy!',
        taskDueTomorrow: '¡La tarea "{title}" vence mañana!',
        tasksExported: "¡Tareas exportadas exitosamente!",
        tasksImported: "¡Tareas importadas exitosamente!",
        errorImporting:
          "Error al importar tareas. Por favor revise el formato del archivo.",
        notification: "Notificación",
        language: "Idioma",
      },
    };
    this.currentLanguage = localStorage.getItem("todoAppLang") || "en";

    this.initializeApp();
    this.bindEvents();
    this.checkDueDateReminders();
    this.initializeTheme();
  }

  // Initialize the application
  initializeApp() {
    this.renderTasks();
    this.updateStats();
    this.updateEmptyState();
    this.setMinDate();
  }

  // Set minimum date for date inputs to today
  setMinDate() {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("taskDueDate").setAttribute("min", today);
    document.getElementById("editTaskDueDate").setAttribute("min", today);
  }

  // Bind all event listeners
  bindEvents() {
    // Add task functionality
    document
      .getElementById("addTaskBtn")
      .addEventListener("click", () => this.addTask());
    document.getElementById("taskTitle").addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.addTask();
    });

    // Search and filter functionality
    document
      .getElementById("searchInput")
      .addEventListener("input", () => this.filterTasks());
    document
      .getElementById("statusFilter")
      .addEventListener("change", () => this.filterTasks());
    document
      .getElementById("categoryFilter")
      .addEventListener("change", () => this.filterTasks());
    document
      .getElementById("priorityFilter")
      .addEventListener("change", () => this.filterTasks());
    document
      .getElementById("clearFilters")
      .addEventListener("click", () => this.clearFilters());

    // Sort functionality
    document
      .getElementById("sortSelect")
      .addEventListener("change", () => this.sortTasks());

    // Modal functionality
    document
      .getElementById("closeEditModal")
      .addEventListener("click", () => this.closeEditModal());
    document
      .getElementById("cancelEdit")
      .addEventListener("click", () => this.closeEditModal());
    document
      .getElementById("saveEdit")
      .addEventListener("click", () => this.saveEdit());

    // Theme toggle
    document
      .getElementById("themeToggle")
      .addEventListener("click", () => this.toggleTheme());

    // Click outside modal to close
    document.getElementById("editModal").addEventListener("click", (e) => {
      if (e.target.id === "editModal") this.closeEditModal();
    });

    // Escape key to close modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.closeEditModal();
    });
  }

  // Theme Management
  initializeTheme() {
    const savedTheme = localStorage.getItem("todoAppTheme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const theme = savedTheme || (systemPrefersDark ? "dark" : "light");
    this.setTheme(theme);

    // Listen for system theme changes
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (!localStorage.getItem("todoAppTheme")) {
          this.setTheme(e.matches ? "dark" : "light");
        }
      });
  }

  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const themeIcon = document.querySelector("#themeToggle i");
    themeIcon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
    localStorage.setItem("todoAppTheme", theme);
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    this.setTheme(newTheme);
  }

  // Task Management
  addTask() {
    const titleInput = document.getElementById("taskTitle");
    const categorySelect = document.getElementById("taskCategory");
    const prioritySelect = document.getElementById("taskPriority");
    const dueDateInput = document.getElementById("taskDueDate");

    const title = titleInput.value.trim();

    if (!title) {
      this.showNotification("Please enter a task title", "error");
      titleInput.focus();
      return;
    }

    const task = {
      id: this.generateId(),
      title,
      category: categorySelect.value,
      priority: prioritySelect.value,
      dueDate: dueDateInput.value || null,
      completed: false,
      dateCreated: new Date().toISOString(),
      order: this.tasks.length,
    };

    this.tasks.push(task);
    this.saveTasks();
    this.renderTasks();
    this.updateStats();
    this.updateEmptyState();

    // Reset form
    titleInput.value = "";
    dueDateInput.value = "";
    categorySelect.value = "personal";
    prioritySelect.value = "medium";

    this.showNotification("Task added successfully!", "success");
    titleInput.focus();
  }

  editTask(id) {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) return;

    this.currentEditingId = id;

    document.getElementById("editTaskTitle").value = task.title;
    document.getElementById("editTaskCategory").value = task.category;
    document.getElementById("editTaskPriority").value = task.priority;
    document.getElementById("editTaskDueDate").value = task.dueDate || "";

    this.showEditModal();
  }

  saveEdit() {
    if (!this.currentEditingId) return;

    const title = document.getElementById("editTaskTitle").value.trim();

    if (!title) {
      this.showNotification("Please enter a task title", "error");
      return;
    }

    const taskIndex = this.tasks.findIndex(
      (t) => t.id === this.currentEditingId
    );
    if (taskIndex === -1) return;

    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      title,
      category: document.getElementById("editTaskCategory").value,
      priority: document.getElementById("editTaskPriority").value,
      dueDate: document.getElementById("editTaskDueDate").value || null,
    };

    this.saveTasks();
    this.renderTasks();
    this.updateStats();
    this.closeEditModal();
    this.showNotification("Task updated successfully!", "success");
  }

  deleteTask(id) {
    if (confirm("Are you sure you want to delete this task?")) {
      this.tasks = this.tasks.filter((t) => t.id !== id);
      this.saveTasks();
      this.renderTasks();
      this.updateStats();
      this.updateEmptyState();
      this.showNotification("Task deleted successfully!", "success");
    }
  }

  toggleTask(id) {
    const taskIndex = this.tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) return;

    this.tasks[taskIndex].completed = !this.tasks[taskIndex].completed;
    this.saveTasks();
    this.renderTasks();
    this.updateStats();

    const action = this.tasks[taskIndex].completed
      ? "completed"
      : "uncompleted";
    this.showNotification(`Task ${action}!`, "success");
  }

  // Drag and Drop Implementation
  initializeDragAndDrop() {
    const taskItems = document.querySelectorAll(".task-item");

    taskItems.forEach((item, index) => {
      item.draggable = true;
      item.dataset.index = index;

      item.addEventListener("dragstart", (e) => this.handleDragStart(e));
      item.addEventListener("dragend", (e) => this.handleDragEnd(e));
      item.addEventListener("dragover", (e) => this.handleDragOver(e));
      item.addEventListener("dragenter", (e) => this.handleDragEnter(e));
      item.addEventListener("dragleave", (e) => this.handleDragLeave(e));
      item.addEventListener("drop", (e) => this.handleDrop(e));
    });
  }

  handleDragStart(e) {
    this.draggedElement = e.target;
    this.draggedIndex = parseInt(e.target.dataset.index);
    e.target.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.outerHTML);
  }

  handleDragEnd(e) {
    e.target.classList.remove("dragging");
    document.querySelectorAll(".task-item").forEach((item) => {
      item.classList.remove("drag-over");
    });
  }

  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  handleDragEnter(e) {
    e.target.closest(".task-item")?.classList.add("drag-over");
  }

  handleDragLeave(e) {
    if (!e.relatedTarget || !e.target.contains(e.relatedTarget)) {
      e.target.classList.remove("drag-over");
    }
  }

  handleDrop(e) {
    e.preventDefault();
    const dropTarget = e.target.closest(".task-item");
    if (!dropTarget || dropTarget === this.draggedElement) return;

    const dropIndex = parseInt(dropTarget.dataset.index);

    // Reorder tasks array
    const draggedTask = this.tasks[this.draggedIndex];
    this.tasks.splice(this.draggedIndex, 1);
    this.tasks.splice(dropIndex, 0, draggedTask);

    // Update order property
    this.tasks.forEach((task, index) => {
      task.order = index;
    });

    this.saveTasks();
    this.renderTasks();
    this.showNotification("Task order updated!", "success");
  }

  // Filtering and Searching
  filterTasks() {
    const searchTerm = document
      .getElementById("searchInput")
      .value.toLowerCase();
    const statusFilter = document.getElementById("statusFilter").value;
    const categoryFilter = document.getElementById("categoryFilter").value;
    const priorityFilter = document.getElementById("priorityFilter").value;

    let filteredTasks = this.tasks;

    // Apply search filter
    if (searchTerm) {
      filteredTasks = filteredTasks.filter((task) =>
        task.title.toLowerCase().includes(searchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filteredTasks = filteredTasks.filter((task) => {
        switch (statusFilter) {
          case "completed":
            return task.completed;
          case "pending":
            return !task.completed && !this.isOverdue(task);
          case "overdue":
            return !task.completed && this.isOverdue(task);
          default:
            return true;
        }
      });
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filteredTasks = filteredTasks.filter(
        (task) => task.category === categoryFilter
      );
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      filteredTasks = filteredTasks.filter(
        (task) => task.priority === priorityFilter
      );
    }

    this.renderFilteredTasks(filteredTasks);
  }

  clearFilters() {
    document.getElementById("searchInput").value = "";
    document.getElementById("statusFilter").value = "all";
    document.getElementById("categoryFilter").value = "all";
    document.getElementById("priorityFilter").value = "all";
    this.renderTasks();
  }

  // Sorting
  sortTasks() {
    const sortBy = document.getElementById("sortSelect").value;

    this.tasks.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "dueDate":
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case "dateCreated":
        default:
          return new Date(b.dateCreated) - new Date(a.dateCreated);
      }
    });

    this.saveTasks();
    this.renderTasks();
  }

  // Rendering
  renderTasks() {
    this.renderFilteredTasks(this.tasks);
  }

  renderFilteredTasks(tasks) {
    const container = document.getElementById("tasksContainer");

    if (tasks.length === 0) {
      container.innerHTML = "";
      this.updateEmptyState();
      return;
    }

    container.innerHTML = tasks
      .map((task) => this.createTaskHTML(task))
      .join("");
    this.initializeDragAndDrop();
    this.updateEmptyState();
  }

  createTaskHTML(task) {
    const isOverdue = this.isOverdue(task);
    const dueDateFormatted = task.dueDate
      ? this.formatDate(task.dueDate)
      : null;

    return `
            <div class="task-item ${task.completed ? "completed" : ""} ${
      isOverdue ? "overdue" : ""
    }" 
                 data-category="${task.category}" data-id="${task.id}">
                <div class="task-checkbox ${task.completed ? "checked" : ""}" 
                     onclick="app.toggleTask('${task.id}')"></div>
                
                <div class="task-content">
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    <div class="task-meta">
                        <span class="task-category ${task.category}">${
      task.category
    }</span>
                        <span class="task-priority ${task.priority}">
                            <i class="fas fa-flag"></i>
                            ${task.priority}
                        </span>
                        ${
                          dueDateFormatted
                            ? `
                            <span class="task-due-date ${
                              isOverdue ? "overdue" : ""
                            }">
                                <i class="fas fa-calendar"></i>
                                ${dueDateFormatted}
                            </span>
                        `
                            : ""
                        }
                    </div>
                </div>
                
                <div class="task-actions">
                    <button class="task-action-btn edit" onclick="app.editTask('${
                      task.id
                    }')" title="Edit task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-action-btn delete" onclick="app.deleteTask('${
                      task.id
                    }')" title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
  }

  // Utility Functions
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  isOverdue(task) {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date().setHours(0, 0, 0, 0);
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (this.isSameDay(date, today)) {
      return "Today";
    } else if (this.isSameDay(date, tomorrow)) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  }

  isSameDay(date1, date2) {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  }

  // Statistics
  updateStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter((t) => t.completed).length;
    const pending = this.tasks.filter(
      (t) => !t.completed && !this.isOverdue(t)
    ).length;
    const overdue = this.tasks.filter(
      (t) => !t.completed && this.isOverdue(t)
    ).length;

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("pendingTasks").textContent = pending;
    document.getElementById("overdueTasks").textContent = overdue;
  }

  updateEmptyState() {
    const tasksContainer = document.getElementById("tasksContainer");
    const emptyState = document.getElementById("emptyState");
    const hasVisibleTasks = tasksContainer.children.length > 0;

    emptyState.style.display = hasVisibleTasks ? "none" : "block";
  }

  // Modal Management
  showEditModal() {
    const modal = document.getElementById("editModal");
    modal.classList.add("active");
    document.getElementById("editTaskTitle").focus();
    document.body.style.overflow = "hidden";
  }

  closeEditModal() {
    const modal = document.getElementById("editModal");
    modal.classList.remove("active");
    this.currentEditingId = null;
    document.body.style.overflow = "";
  }

  // Notification System
  showNotification(message, type = "info", vars = {}) {
    const container = document.getElementById("notificationContainer");
    const id = this.generateId();
    let msg = typeof message === "string" ? message : this.t(message, vars);
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-message">${msg}</div>
            </div>
            <button class="notification-close" onclick="app.closeNotification('${id}')">
                <i class="fas fa-times"></i>
            </button>
        `;
    notification.id = id;
    container.appendChild(notification);
    setTimeout(() => notification.classList.add("show"), 100);
    setTimeout(() => this.closeNotification(id), 5000);
  }

  getNotificationIcon(type) {
    switch (type) {
      case "success":
        return "check-circle";
      case "error":
        return "exclamation-circle";
      case "warning":
        return "exclamation-triangle";
      default:
        return "info-circle";
    }
  }

  closeNotification(id) {
    const notification = document.getElementById(id);
    if (notification) {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }
  }

  // Due Date Reminders
  checkDueDateReminders() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.tasks.forEach((task) => {
      if (task.completed || !task.dueDate) return;

      const dueDate = new Date(task.dueDate);

      if (this.isSameDay(dueDate, today)) {
        this.showNotification(`Task "${task.title}" is due today!`, "warning");
      } else if (this.isSameDay(dueDate, tomorrow)) {
        this.showNotification(`Task "${task.title}" is due tomorrow!`, "info");
      }
    });

    // Check again every hour
    setTimeout(() => this.checkDueDateReminders(), 3600000);
  }

  // Local Storage Management
  saveTasks() {
    localStorage.setItem("todoAppTasks", JSON.stringify(this.tasks));
  }

  loadTasks() {
    const stored = localStorage.getItem("todoAppTasks");
    return stored ? JSON.parse(stored) : [];
  }

  // Export/Import functionality (bonus feature)
  exportTasks() {
    const dataStr = JSON.stringify(this.tasks, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `todos_${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    this.showNotification("Tasks exported successfully!", "success");
  }

  importTasks(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTasks = JSON.parse(e.target.result);
        if (Array.isArray(importedTasks)) {
          this.tasks = importedTasks;
          this.saveTasks();
          this.renderTasks();
          this.updateStats();
          this.updateEmptyState();
          this.showNotification("Tasks imported successfully!", "success");
        } else {
          throw new Error("Invalid file format");
        }
      } catch (error) {
        this.showNotification(
          "Error importing tasks. Please check the file format.",
          "error"
        );
      }
    };
    reader.readAsText(file);
  }

  // Language selector
  setLanguage(lang) {
    this.currentLanguage = lang;
    localStorage.setItem("todoAppLang", lang);
    this.updateUIText();
    this.renderTasks();
    this.updateStats();
    this.updateEmptyState();
  }

  t(key, vars = {}) {
    let str = this.languages[this.currentLanguage][key] || key;
    Object.keys(vars).forEach((k) => {
      str = str.replace(`{${k}}`, vars[k]);
    });
    return str;
  }

  updateUIText() {
    // Update static UI text (add more as needed)
    const lang = this.currentLanguage;
    document.getElementById("addTaskBtn").textContent = this.t("addTask");
    document.getElementById("taskTitle").placeholder = this.t("taskTitle");
    document.getElementById("searchInput").placeholder = this.t("search");
    document.getElementById("clearFilters").textContent =
      this.t("clearFilters");
    document.getElementById("sortLabel").textContent = this.t("sortBy");
    document.getElementById("statusFilterLabel").textContent =
      this.t("statusFilter") || this.t("status");
    document.getElementById("categoryFilterLabel").textContent =
      this.t("category");
    document.getElementById("priorityFilterLabel").textContent =
      this.t("priority");
    document.getElementById("languageLabel").textContent = this.t("language");
    // Update modal
    document.getElementById("editTaskTitle").placeholder = this.t("taskTitle");
    document.getElementById("editTaskCategoryLabel").textContent =
      this.t("category");
    document.getElementById("editTaskPriorityLabel").textContent =
      this.t("priority");
    document.getElementById("editTaskDueDateLabel").textContent =
      this.t("dueDate");
    document.getElementById("saveEdit").textContent = this.t("save");
    document.getElementById("cancelEdit").textContent = this.t("cancel");
    document.getElementById("closeEditModal").title = this.t("close");
    // ...add more as needed
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.app = new TodoApp();
  // Add language selector event
  const langSelect = document.getElementById("languageSelect");
  if (langSelect) {
    langSelect.value = window.app.currentLanguage;
    langSelect.addEventListener("change", (e) => {
      window.app.setLanguage(e.target.value);
    });
  }
  window.app.updateUIText();
});

// Service Worker registration for PWA capabilities (optional)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((registration) => console.log("SW registered"))
      .catch((registrationError) => console.log("SW registration failed"));
  });
}
