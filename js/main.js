class Task {
  constructor(
    title,
    description,
    dueDate,
    priority,
    time = "",
    repeat = "none"
  ) {
    this.id = Date.now(); // Unique identifier for each task
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.priority = priority;
    this.time = time;
    this.repeat = repeat;
  }

  fullDetails() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      dueDate: this.dueDate,
      priority: this.priority,
      withinDays: Math.floor(
        (new Date(new Date(this.dueDate).setHours(0, 0, 0, 0)) -
          new Date(new Date().setHours(0, 0, 0, 0))) /
          (1000 * 60 * 60 * 24)
      ),
      time: this.time,
    };
  }

  addTask() {
    tasks.push(this.fullDetails());
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
}

function sortTasks() {
  tasks.sort((a, b) => {
    if (a.priority > b.priority) return -1;
    if (a.priority < b.priority) return 1;
    if (a.dueDate < b.dueDate) return -1;
    if (a.dueDate > b.dueDate) return 1;
    return 0;
  });
}

function createTask(tasks) {
  taskListContainer.innerHTML = ""; // Clear the task list
  tasks.forEach(({ title, dueDate, withinDays, time }) => {
    const taskElement = document.createElement("div");
    taskElement.classList.add("task");

    taskElement.innerHTML = `
      <div>
        <div class="task-title">${title}</div>
        <div class="task-date">${dueDate} (${
      withinDays > 0
        ? `days remaining is ${withinDays}`
        : withinDays < 0
        ? `days Passed Is ${withinDays}`
        : `Today`
    } ) ${time}</div>
      </div>
      <div>
      <div class="task-check">
        <i class="fas fa-check"></i>
        </div>
        <i class="del fa-solid fa-trash-can"></i>
      </div>
    `;

    taskListContainer.appendChild(taskElement);
  });
}

function initializeForm() {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const newTask = new Task(
      form.title.value,
      form.description.value,
      form.day.value,
      form.priority.value,
      form.time.value,
      form.repeat.value
    );

    newTask.addTask();
    createTask(tasks);
    document.querySelector(".overlay").style.display = "none";
    form.style.display = "none";
  });
}

function initializeFlatpickr() {
  flatpickr("input.time", {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true,
  });

  flatpickr("input.day", {
    dateFormat: "Y-m-d",
    minDate: "today",
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

function initializeEventListeners() {
  addTaskButton.addEventListener("click", (event) => {
    event.preventDefault();
    document.querySelector(".overlay").style.display = "block";
    form.style.display = "block";
  });

  document.querySelector(".toggle-sidebar").addEventListener("click", () => {
    document.querySelector("aside").classList.toggle("hidden");
    document.querySelectorAll("aside li").forEach((el) => {
      el.lastChild.style.fontSize = document
        .querySelector("aside")
        .classList.contains("hidden")
        ? "0"
        : "1.6rem";
    });
    document.querySelector(".add-task").classList.toggle("sidebar-hidden");
  });

}

// function changeTask() {
  //   document.querySelectorAll(".task").forEach((el, i) => {
    //     el.addEventListener("click", (e) => {
//       if (!e.target.classList.contains("del")&&!e.target.classList.contains('')) {
//         document.querySelector(".overlay").style.display = "block";
//         form.style.display = "block";
//         form.title.value = tasks[i].title;
//         form.description.value = tasks[i].description;
//         form.day.value = tasks[i].dueDate;
//         form.priority.value = tasks[i].priority;
//         form.time.value = tasks[i].time;
//         form.repeat.value = tasks[i].repeat;
//         form.addEventListener("submit", (event) => {
//           event.preventDefault();
//           tasks.splice(i, i + 1);
//           console.log(tasks);
//           localStorage.setItem("tasks", JSON.stringify(tasks));
//           sortTasks();
//           createTask(tasks);
//           close();
//         });
//       }
//     });
//   });
// }

function del() {
  document.querySelectorAll(".del").forEach(function (el, i) {
    document.querySelector(".del").addEventListener("click", function (e) {
      tasks.splice(i, i + 1);
      localStorage.setItem("tasks", JSON.stringify(tasks));
      this.parentElement.parentElement.remove();
    });
  });
}

// function close() {
//   document.querySelector(".close").addEventListener("click", () => {
//     document.querySelector(".overlay").style.display = "none";
//     form.style.display = "none";
//   });
// }

document.querySelectorAll(".del").forEach(function (el, i) {
  console.log(el)
  document.querySelector(".del").addEventListener("click",  (e) => {
    console.log(this)
    tasks.splice(i, i + 1);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    this.parentElement.parentElement.remove();
  });
});
document.addEventListener("DOMContentLoaded", function () {
  close();
  initializeFlatpickr();
  initializeChoices();
  initializeForm();
  initializeEventListeners();
  sortTasks();
  createTask(tasks);
  // changeTask();
  document.querySelectorAll(".task-check").forEach((taskCheckElement) => {
    taskCheckElement.addEventListener("click", () => {
      console.log(this)
      taskCheckElement.classList.toggle("checked");
      taskCheckElement.parentElement.firstElementChild.style.textDecoration =
        taskCheckElement.classList.contains("checked")
          ? "line-through"
          : "none";
    });
  });
});

const form = document.querySelector("form.details");
const addTaskButton = document.querySelector(".add-task");
const taskListContainer = document.getElementById("tasksContainer");
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
