const form = document.querySelector("form.details");
const addTaskButton = document.querySelector(".add-task");
const taskListContainer = document.getElementById("tasksContainer");
let allTasks = JSON.parse(localStorage.getItem("tasks")) || [];
function filterTask() {
  const filterValue = document.querySelector(".filter").value;
  let filteredTasks;

  switch (filterValue) {
    case "today":
      filteredTasks = allTasks.filter(
        (task) =>
          new Date(task.dueDate).toDateString() === new Date().toDateString()
      );
      break;
    case "later":
      filteredTasks = allTasks.filter((task) => {
        let end = new Date().setHours(
          task.endTime.split(":")[0],
          task.endTime.split(":")[1]
        );
        let start = new Date().setHours(
          task.time.split(":")[0],
          task.time.split(":")[1]
        );
        if (!isNaN(end) || !isNaN(start))
          return end >= new Date() || start >= new Date();

        return (
          new Date(task.dueDate).toDateString() > new Date().toDateString()
        );
      });
      break;
    case "completed":
      filteredTasks = allTasks.filter((task) => task.checked);
      break;
    case "missed":
      filteredTasks = allTasks.filter((task) => {
        let end = new Date().setHours(
          task.endTime.split(":")[0],
          task.endTime.split(":")[1]
        );
        let start = new Date().setHours(
          task.time.split(":")[0],
          task.time.split(":")[1]
        );
        if (!isNaN(end) || !isNaN(start))
          return (end <= new Date() || start <= new Date()) && !task.checked;
        return (
          new Date(task.dueDate).toDateString() > new Date().toDateString()
        );
      });
      break;
    default:
      filteredTasks = allTasks;
  }

  sortTasks(filteredTasks);
  createTask(filteredTasks);
}

class Task {
  constructor(
    title,
    description,
    dueDate,
    priority,
    time = "",
    endTime = "",
    repeat = "none",
    checked = false
  ) {
    this.id = Date.now();
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.priority = priority;
    this.time = time;
    this.endTime = endTime;
    this.repeat = repeat;
    this.checked = checked;
  }

  fullDetails() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      priority: this.priority,
      withinDays: this.calculateWithinDays(),
      time: this.time,
      endTime: this.endTime,
      repeat: this.repeat,
      checked: this.checked,
    };
  }

  calculateWithinDays() {
    return Math.floor(
      (new Date(new Date(this.dueDate).setHours(0, 0, 0, 0)) -
        new Date(new Date().setHours(0, 0, 0, 0))) /
        (1000 * 60 * 60 * 24)
    );
  }

  addTask() {
    allTasks.push(this.fullDetails());
    localStorage.setItem("tasks", JSON.stringify(allTasks));
    filterTask();
  }
}

function sortTasks(tasks) {
  return tasks.sort((a, b) => {
    const dateDiff = new Date(a.dueDate) - new Date(b.dueDate);
    if (dateDiff !== 0) return dateDiff;

    const today = new Date().toISOString().split("T")[0];
    const aTime = a.time
      ? new Date(`${today}T${a.time}`)
      : new Date(`${today}T00:00`);
    const bTime = b.time
      ? new Date(`${today}T${b.time}`)
      : new Date(`${today}T00:00`);
    const timeDiff = aTime - bTime;
    if (timeDiff !== 0) return timeDiff;

    return b.priority - a.priority;
  });
}

function createTask(tasks) {
  taskListContainer.innerHTML = "";
  tasks.forEach((task) => {
    const taskElement = document.createElement("div");
    taskElement.classList.add("task");
    taskElement.dataset.taskId = task.id;

    taskElement.innerHTML = `
      <div>
        <div class="task-title" style="text-decoration: ${
          task.checked ? "line-through" : "none"
        }">${task.title}</div>
        <div class="task-date">${task.dueDate} (${
      task.withinDays > 0
        ? `days remaining is ${task.withinDays}`
        : task.withinDays < 0
        ? `days Passed Is ${Math.abs(task.withinDays)}`
        : `Today`
    }) ${task.time}</div>
      </div>
      <div>
        <div class="task-check ${task.checked ? "checked" : ""}">
          <i class="fas fa-check"></i>
        </div>
        <i class="del fa-solid fa-trash-can"></i>
      </div>
    `;
    taskListContainer.appendChild(taskElement);
  });
}

function checkTask(taskCheckElement) {
  if (taskCheckElement.classList.contains("fa-check")) {
    taskCheckElement = taskCheckElement.parentElement;
  }

  const taskElement = taskCheckElement.closest(".task");
  const taskId = parseInt(taskElement.dataset.taskId);
  const taskIndex = allTasks.findIndex((task) => task.id === taskId);

  if (taskIndex !== -1) {
    allTasks[taskIndex].checked = !allTasks[taskIndex].checked;
    localStorage.setItem("tasks", JSON.stringify(allTasks));
    filterTask();
  }
}

function del(taskElement) {
  const taskId = parseInt(taskElement.dataset.taskId);
  allTasks = allTasks.filter((task) => task.id !== taskId);
  localStorage.setItem("tasks", JSON.stringify(allTasks));
  filterTask();
}

// ... (rest of your functions remain the same)

function initializeForm() {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const newTask = new Task(
      form.title.value,
      form.description.value,
      form.day.value,
      form.priority.value,
      form.time.value,
      form.endTime.value,
      form.repeat.value
    );

    newTask.addTask();
    close();
  });
}
// Add these functions to your code

function initializeFlatpickr() {
  flatpickr("input.time", {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true,
    disableMobile: true,
  });
  flatpickr("input.end-time", {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true,
    disableMobile: true,
  });

  flatpickr("input.day", {
    dateFormat: "Y-m-d",
    minDate: "today",
    disableMobile: true,
  });

  // Set default value for input.day to today's date
  const today = new Date().toISOString().split("T")[0];
  document.querySelector("input.day").value = today;
}

function initializeChoices() {
  new Choices("#priority", {
    searchEnabled: false,
    itemSelectText: "",
  });

  new Choices("#repeat", {
    searchEnabled: false,
    itemSelectText: "",
  });
}
document.body.addEventListener("", () => {
  console.log("0");
});
function search() {
  const searchInput = document.querySelector("#search");
  searchInput.addEventListener("keyup", (event) => {
    console.log(9);
    if (searchInput.value.trim() !== "") {
      const filteredTasks = allTasks.filter((task) => {
        return task.title
          .toLowerCase()
          .includes(searchInput.value.toLowerCase());
      });
      sortTasks(filteredTasks);
      createTask(filteredTasks);
    } else {
      const filteredTasks = allTasks.filter((task) => {
        return true;
      });
      sortTasks(filteredTasks);
      createTask(filteredTasks);
    }
  });
}

function toggleSidebar() {
  document.querySelector(".toggle-sidebar").addEventListener("click", () => {
    document.querySelector("aside").classList.toggle("hidden");
    document.querySelector("main").classList.toggle("hidden");
    addTaskButton.classList.toggle("hidden");
    document.querySelectorAll("aside li").forEach((el) => {
      el.lastChild.style.fontSize = document
        .querySelector("aside")
        .classList.contains("hidden")
        ? "0"
        : "1.6rem";
    });
  });
}



function initializeEventListeners() {
  addTaskButton.addEventListener("click", (event) => {
    event.preventDefault();
    document.querySelector(".overlay").style.display = "block";
    form.style.display = "block";
  });

  taskListContainer.addEventListener("click", (event) => {
    const target = event.target;

    if (target.classList.contains("del")) {
      del(target.closest(".task"));
    } else if (
      target.classList.contains("task-check") ||
      target.classList.contains("fa-check")
    ) {
      checkTask(target);
    } else if (
      target.closest(".task") &&
      !target.classList.contains("task-check") &&
      !target.classList.contains("del")
    ) {
      changeTask(target.closest(".task"));
    }
  });
}

function close() {
  document.querySelector(".overlay").style.display = "none";
  form.style.display = "none";
}

function changeTask(taskElement) {
  const taskId = parseInt(taskElement.dataset.taskId);
  const task = allTasks.find((t) => t.id === taskId);

  if (!task) return;

  document.querySelector(".overlay").style.display = "block";
  form.style.display = "block";

  // Populate form with task details
  form.title.value = task.title;
  form.description.value = task.description;
  form.day.value = task.dueDate;
  form.priority.value = task.priority;
  form.time.value = task.time;
  form.repeat.value = task.repeat;

  // Remove existing submit event listener and add a new one
  form.removeEventListener("submit", handleEditSubmit);
  form.addEventListener("submit", handleEditSubmit);

  function handleEditSubmit(event) {
    event.preventDefault();
    const taskIndex = allTasks.findIndex((t) => t.id === taskId);

    if (taskIndex !== -1) {
      const updatedTask = new Task(
        form.title.value,
        form.description.value,
        form.day.value,
        form.priority.value,
        form.time.value,
        form.endTime.value,
        form.repeat.value,
        task.checked
      );

      allTasks[taskIndex] = updatedTask.fullDetails();
      localStorage.setItem("tasks", JSON.stringify(allTasks));
      filterTask();
      close();
    }

    form.removeEventListener("submit", handleEditSubmit);
  }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  allTasks.map((el) => {
    let task = new Task(
      el.title,
      el.description,
      el.dueDate,
      el.priority,
      el.time,
      el.endTime,
      el.repeat,
      el.checked
    );
    return (el.withinDays = task.calculateWithinDays());
  });
  initializeFlatpickr();
  initializeChoices();
  initializeForm();
  initializeEventListeners();
  filterTask(); // This will handle initial sorting and display
  search();
  toggleSidebar();
  document.querySelector(".close").addEventListener("click", close);
  document.querySelector(".filter").addEventListener("change", filterTask);
  if (document.querySelectorAll("task") > 1) {
    window.addEventListener("resize", () => {
      document
        .querySelectorAll(".fil :where(label,input,.filter)")
        .forEach((el) => {
          el.style.width = `${document.querySelector(".task").clientWidth}px`;
        });
    });
    document
      .querySelectorAll(".fil :where(label,input,.filter)")
      .forEach((el) => {
        el.style.width = `${document.querySelector(".task").clientWidth}px`;
      });
  }
});
