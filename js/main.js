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
    renderTasks();
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

const form = document.querySelector("form.details");
const add = document.querySelector(".add-task");
const tasksContainer = document.getElementById("tasksContainer");
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

add.addEventListener("click", (el) => {
  document.querySelector(".overlay").style.display = "block";
  form.style.display = "block";
  el.preventDefault();
});

document.querySelector('[type="submit"]').addEventListener("click", (e) => {
  e.preventDefault();
  let day = document.getElementsByName("day")[0].value;
  let date = new Date(day);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    alert("تاريخ غير صالح");
    return;
  }

  // Check if the date is in the future
  if (date > new Date()) {
    alert("لا يمكن أن يكون التاريخ في المستقبل");
    return;
  }

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
