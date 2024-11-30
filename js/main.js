class Task {
  constructor(title, description, dueDate, priority, status = "Incomplete") {
    this.id = Date.now(); // Unique identifier for each task
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.priority = priority;
    this.status = status;
  }

  markComplete() {
    this.status = "Complete";
  }

  addTask() {
    tasks.push(this);
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  fullDetails() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      priority: this.priority,
      status: this.status,
    };
  }
}

function creteTask() {}

const form = document.querySelector("form.details");
const add = document.querySelector(".add-task");
const taskList = document.getElementById("tasksContainer");
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
tasks.forEach(({ title: t, dueDate: dt }) => {
  let task = document.createElement("div");
  task.classList.add("task");
  task.innerHTML = `
<div>
  <div class="task-title">${t}</div>
  <div class="task-date">${dt} +${dt-new Date()}</div>
</div>
<div class="task-check">
  <i class="fas fa-check"></i>
</div>
  `;
  taskList.appendChild(task);
});

add.addEventListener("click", (el) => {
  document.querySelector(".overlay").style.display = "block";
  form.style.display = "block";
  el.preventDefault();
});
document
  .querySelector('[type="submit"]')
  .addEventListener("click", function (e) {
    e.preventDefault();
    let day = document.getElementsByName("day")[0].value;
    let date = new Date(day);

    // Check if the date is valid
    if (isNaN(date.getTime())) return;

    const newTask = new Task(
      form.title.value,
      form.description.value,
      form.day.value,
      form.priority.value,
      form.status.value
    );

    newTask.addTask();
    document.querySelector(".overlay").style.display = "none";
    form.style.display = "none";
  });

// إضافة التفاعل على الـ div
const taskCheck = document.querySelector(".task-check");

taskCheck.addEventListener("click", function () {
  console.log(this);
  taskCheck.classList.toggle("checked");
  taskCheck.parentElement.style.textDecoration = taskCheck.classList.contains(
    "checked"
  )
    ? "line-through"
    : "none";
});
