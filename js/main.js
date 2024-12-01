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
        (new Date(this.dueDate).getTime() - Date.now()) / 1000 / 60 / 60 / 24
      ),
    };
  }

  addTask() {
    tasks.push(this.fullDetails());
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
}

const form = document.querySelector("form.details");
const addTaskButton = document.querySelector(".add-task");
const taskListContainer = document.getElementById("tasksContainer");
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

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
    form.day.value = new Date(Date.now()).toISOString().split('T')[0];
  } else if (isNaN(Date.parse(form.day.value))) {
    alert("Invalid date format. Please use the format 'YYYY-MM-DD'.");
    return;
  } else {
    form.day.value = new Date(Date.now()).toISOString().split('T')[0];
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
