class Task {
  constructor(
    title,
    description,
    dueDate,
    priority,
    status = "Incomplete",
    repeat = "none"
  ) {
    this.id = Date.now(); // Unique identifier for each task
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.priority = priority;
    this.status = status;
    this.repeat = repeat;
  }

  markComplete() {
    this.status = "Complete";
  }

  fullDetails() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      priority: this.priority,
      status: this.status,
      withinDays: Math.floor(
        (new Date(new Date(this.dueDate).setHours(0, 0, 0, 0)) -
          new Date(new Date().setHours(0, 0, 0, 0))) /
          (1000 * 60 * 60 * 24)
      ),
    };
  }

  addTask() {
    tasks.push(this.fullDetails());
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
}

function sortTasks() {
  tasks.sort((a, b) => {
    if (a.priority > b.priority) {
      return -1;
    }
    if (a.priority < b.priority) {
      return 1;
    }
    if (a.dueDate < b.dueDate) {
      return -1;
    }
    if (a.dueDate > b.dueDate) {
      return 1;
    }
    return 0;
  });
}

const form = document.querySelector("form.details");
const addTaskButton = document.querySelector(".add-task");
const taskListContainer = document.getElementById("tasksContainer");
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
sortTasks();
createTask(tasks);
function createTask(tasks) {
  taskListContainer.innerHTML = ""; // Clear the task list
  tasks.forEach(({ title, dueDate, withinDays }) => {
    const taskElement = document.createElement("div");
    taskElement.classList.add("task");

    taskElement.innerHTML = `
      <div>
        <div class="task-title">${title}</div>
        <div class="task-date">${dueDate} (${withinDays} days remaining)</div>
      </div>
      <div class="task-check">
        <i style="text-decoration: none !important;" class="fas fa-check"></i>
      </div>
    `;

    taskListContainer.appendChild(taskElement);
  });
}

addTaskButton.addEventListener("click", (event) => {
  event.preventDefault();
  document.querySelector(".overlay").style.display = "block";
  form.style.display = "block";
});
form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (form.day.value === "") {
    form.day.value = +new Date(Date.now());
  } else if (isNaN(Date.parse(form.day.value))) {
    alert("Invalid date format. Please use the format 'YYYY-MM-DD'.");
    return;
  }

  const newTask = new Task(
    form.title.value,
    form.description.value,
    form.day.value,
    form.priority.value,
    form.repeat.value
  );

  newTask.addTask();
  createTask(tasks);
  document.querySelector(".overlay").style.display = "none";
  form.style.display = "none";
});

document.querySelector(".toggle-sidebar").addEventListener("click", () => {
  document.querySelector('aside').classList.toggle("hidden");
  document.querySelector('.add-task').classList.toggle("sidebar-hidden");
  document.querySelector('.tasks-container').style.cssText = `margin-right: ${document.querySelector('aside').classList.contains('hidden')? '0' : '200px'};`;
});

// document.querySelectorAll(".task").forEach((taskElement) => {
//   taskElement.addEventListener("click", () => {
//     document.querySelector(".overlay").style.display = "block";
//     form.style.display = "block";
//   });
// });

document.querySelectorAll(".task-check").forEach((taskCheckElement) => {
  taskCheckElement.addEventListener("click", () => {
    taskCheckElement.classList.toggle("checked");
    taskCheckElement.parentElement.firstElementChild.style.textDecoration =
      taskCheckElement.classList.contains("checked") ? "line-through" : "none";
  });
});
