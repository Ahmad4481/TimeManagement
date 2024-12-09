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
    checked = false,
    rrule = null,
    rruleValue = null,
    customRepeatSettings = null
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
    this.rrule = rrule;
    this.rruleValue = rruleValue;
    this.customRepeatSettings = customRepeatSettings
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
      rrule: this.rrule,
      rruleValue: this.rruleValue,
      customRepeatSettings: this.customRepeatSettings
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
    let border =
      task.priority === "high"
        ? "red"
        : task.priority === "medium"
          ? "yellow"
          : task.priority === "low"
            ? "blue"
            : "";
    taskElement.innerHTML = `
        <div>
          <div class="task-title" style="text-decoration: ${task.checked ? "line-through" : "none"
      }">${task.title}</div>
          <div class="task-date">${task.dueDate} (${task.withinDays > 0
        ? `days remaining: ${task.withinDays}`
        : task.withinDays < 0
          ? `days passed: ${Math.abs(task.withinDays)}`
          : `Today`
      }) ${task.time} ${task.endTime && task.endTime !== "" ? `- ${task.endTime}` : ""
      }
      ${task.rruleValue !== null ? `<div>${task.rruleValue}</div>` : ''}
      </div>
        </div>
        <div>
          <div class="task-check ${task.checked ? "checked" : ""}" style="border-color: ${border}">
            <i class="fas fa-check"></i>
          </div>
          <i class="del fa-solid fa-trash-can"></i>
        </div>
      `;
    taskListContainer.appendChild(taskElement);
    form.reset();
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
    const task = allTasks[taskIndex];
    if (task.rrule && !task.checked) {
      const nextTask = { ...task };
      const rruleObj = rrule.RRule.fromString(task.rrule);
      const nextDate = rruleObj.after(new Date(task.dueDate));
      if (nextDate) {
        nextTask.id = Date.now();
        nextTask.dueDate = nextDate.toISOString().split('T')[0];
        nextTask.checked = false;
        nextTask.withinDays = Math.floor(
          (new Date(nextDate) - new Date()) / (1000 * 60 * 60 * 24)
        );
        allTasks.push(nextTask);
      }
    }

    task.checked = !task.checked;

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


function initializeForm() {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    let rruleObj = null;
    let rruleValue = null;
    let customRepeatSettings = null;

    if (form.repeat.value === 'custom') {
      const ruleData = createRRule();
      if (ruleData) {
        rruleObj = ruleData.rruleObj.toString();
        rruleValue = createValue(ruleData.rruleObj);
        customRepeatSettings = ruleData.settings;
      }
    }

    else if (form.repeat.value === 'daily') {
      rruleObj = 'FREQ=DAILY';
      rruleValue = 'daily';
    }
    else if (form.repeat.value === 'weekly') {
      rruleObj = 'FREQ=WEEKLY';
      rruleValue = 'weekly';
    }
    else if (form.repeat.value === 'monthly') {
      rruleObj = 'FREQ=MONTHLY';
      rruleValue = 'monthly';
    }
    else if (form.repeat.value === 'yearly') {
      rruleObj = 'FREQ=YEARLY';
      rruleValue = 'yearly';
    }

    const newTask = new Task(
      form.title.value,
      form.description.value,
      form.day.value,
      form.priority.value,
      form.time.value,
      form.endTime.value,
      form.repeat.value,
      false,
      rruleObj,
      rruleValue,
      customRepeatSettings
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
  new Choices(".filter", {
    searchEnabled: false,
    itemSelectText: "",
  });
}
function search() {
  const searchInput = document.querySelector("#search");
  searchInput.addEventListener("keyup", (event) => {
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
    form.day.value = new Date().toISOString().split("T")[0];
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
  form.endTime.value = task.endTime;

  if (task.repeat === 'custom' && task.customRepeatSettings) {
    const settings = task.customRepeatSettings;
    const customRepeatDiv = document.querySelector('.custom-repeat');

    customRepeatDiv.style.display = 'block';

    document.querySelector('#repeatInterval').value = settings.frequency.interval;
    document.querySelector('#repeatFreq').value = settings.frequency.freq;

    document.querySelectorAll('.weekdays input').forEach(checkbox => {
      checkbox.checked = settings.weekdays.includes(checkbox.value);
    });

    if (settings.monthlyOption) {
      document.querySelector('.month-select').value = settings.monthlyOption;
    }

    const endType = document.querySelector(`input[name="endType"][value="${settings.endSettings.type}"]`);
    if (endType) {
      endType.checked = true;

      if (settings.endSettings.type === 'after') {
        const occurencesInput = document.querySelector('#occurences');
        occurencesInput.disabled = false;
        occurencesInput.value = settings.endSettings.occurences;
      } else if (settings.endSettings.type === 'on') {
        const endDateInput = document.querySelector('#endDate');
        endDateInput.disabled = false;
        endDateInput.value = settings.endSettings.endDate;
      }
    }

    const weekdaysDiv = document.querySelector('.weekdays-select');
    const monthSelect = document.querySelector('.month-select');

    if (settings.frequency.freq === 'WEEKLY') {
      weekdaysDiv.style.display = 'block';
      monthSelect.style.display = 'none';
    } else if (settings.frequency.freq === 'MONTHLY') {
      monthSelect.style.display = 'block';
      weekdaysDiv.style.display = 'none';
    } else {
      weekdaysDiv.style.display = 'none';
      monthSelect.style.display = 'none';
    }
  }

  // Remove existing submit event listener and add a new one
  form.removeEventListener("submit", handleEditSubmit);
  form.addEventListener("submit", handleEditSubmit);

  function handleEditSubmit(event) {
    event.preventDefault();
    const taskIndex = allTasks.findIndex((t) => t.id === taskId);

    if (taskIndex !== -1) {
      let rruleObj = null;
      let rruleValue = null;
      let customRepeatSettings = null;

      if (form.repeat.value === 'custom') {
        const ruleData = createRRule();
        if (ruleData) {
          rruleObj = ruleData.rruleObj.toString();
          rruleValue = createValue(ruleData);
          customRepeatSettings = ruleData.settings;
        }
      }

      const updatedTask = new Task(
        form.title.value,
        form.description.value,
        form.day.value,
        form.priority.value,
        form.time.value,
        form.endTime.value,
        form.repeat.value,
        task.checked,
        rruleObj,
        rruleValue,
        customRepeatSettings
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
      allTasks.map((el) => {
        let task = new Task(
          el.title,
          el.description,
          el.dueDate,
          el.priority,
          el.time,
          el.endTime,
          el.repeat,
          el.checked,
          el.rrule,
          el.rruleValue
        );
        return (el.withinDays = task.calculateWithinDays());
      })
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
  document.querySelectorAll(".close")[0].addEventListener("click", close);
  document.querySelectorAll(".close")[1].addEventListener("click", () => document.querySelector('.custom-repeat').style.display = 'none');
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

function ordinalNumber(n) {
  const suffixes = ["th", "st", "nd", "rd"];
  const value = n % 100;
  const suffix = value >= 11 && value <= 13 ? "th" : suffixes[(value % 10)] || "th";
  return `${n}${suffix}`;
}

function getNthDayOfMonth(year, month, day) {
  let count = 1;
  const date = new Date(`${year}-${month}-${1}`);
  while (date.getDate() <= day) {
    if (daysOfWeek[date.getDay()] == daysOfWeek[new Date(year - month - day).getDay()]) {
      count++;
    }
    date.setDate(date.getDate() + 1);
  }
  return count;
}

document.querySelector('#repeat').addEventListener('change', function (e) {
  const customRepeatDiv = document.querySelector('.custom-repeat');
  const weekdaysDiv = document.querySelector('.weekdays-select');

  if (e.target.value === 'custom') {
    customRepeatDiv.style.display = 'block';
  } else {
    customRepeatDiv.style.display = 'none';
  }
});

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
document.querySelector('#repeatFreq').addEventListener('change', function (e) {
  const weekdaysDiv = document.querySelector('.weekdays-select');
  const monthSelect = document.querySelector('.month-select');

  if (e.target.value === 'WEEKLY') {
    weekdaysDiv.style.display = 'block';
    monthSelect.style.display = 'none';
  } else if (e.target.value === 'MONTHLY') {
    monthSelect.style.display = 'block';
    let date = form.day.value.split('-')
    monthSelect.firstElementChild.innerHTML = `Monthly on the ${ordinalNumber(date[2] < 10 ? date[2][1] : date[2])}`;
    monthSelect.firstElementChild.value = `Monthly on the ${ordinalNumber(date[2] < 10 ? date[2][1] : date[2])}`;
    monthSelect.lastElementChild.innerHTML = `The ${ordinalNumber(getNthDayOfMonth(date[0], date[1], date[2]))} ${daysOfWeek[new Date(`${date[0]}-${date[1]}-${date[2]}`).getDay()]} of every month`
    monthSelect.lastElementChild.value = `The ${ordinalNumber(getNthDayOfMonth(date[0], date[1], date[2]))} ${daysOfWeek[new Date(`${date[0]}-${date[1]}-${date[2]}`).getDay()]} of every month`
    weekdaysDiv.style.display = 'none';
  } else {
    weekdaysDiv.style.display = 'none';
    monthSelect.style.display = 'none';
  }
});

document.querySelectorAll('input[name="endType"]').forEach(radio => {
  radio.addEventListener('change', function () {
    const occurencesInput = document.querySelector('#occurences');
    const endDateInput = document.querySelector('#endDate');
    occurencesInput.disabled = this.value !== 'after';
    endDateInput.disabled = this.value !== 'on';
  });
});

function createRRule() {
  if (form.repeat.value !== 'custom') return null;

  const settings = {
    frequency: {
      freq: document.querySelector('#repeatFreq').value,
      interval: parseInt(document.querySelector('#repeatInterval').value)
    },
    weekdays: Array.from(document.querySelectorAll('.weekdays input:checked'))
      .map(cb => cb.value),
    monthlyOption: document.querySelector('.month-select').value,
    endSettings: {
      type: document.querySelector('input[name="endType"]:checked').value,
      occurences: document.querySelector('#occurences').value,
      endDate: document.querySelector('#endDate').value
    }
  };

  let options = {
    freq: rrule.RRule[settings.frequency.freq],
    interval: settings.frequency.interval,
    dtstart: new Date(form.day.value)
  };

  if (settings.frequency.freq === 'WEEKLY' && settings.weekdays.length) {
    options.byweekday = settings.weekdays.map(day => rrule.RRule[day]);
  }
  else if (settings.frequency.freq === 'MONTHLY') {
    if (settings.monthlyOption === document.querySelector('.month-select').firstElementChild.value) {
      options.bymonthday = parseInt(form.day.value.split('-')[2]);
    }
  }

  if (settings.endSettings.type === 'after') {
    options.count = parseInt(settings.endSettings.occurences);
  } else if (settings.endSettings.type === 'on') {
    options.until = new Date(settings.endSettings.endDate);
  }


  return {
    rruleObj: new rrule.RRule(options),
    settings: settings
  };
}

document.querySelector('.submit-repeat').addEventListener('click', function (e) {
  document.querySelector('.custom-repeat').style.display = 'none';
})


function createValue(rrule) {
  if (!rrule) return '';
  console.log(rrule)
  if (rrule.options === undefined) {
    rrule = rrule.rruleObj;
  };
  let value = `repeat every ${rrule.options.interval || 1} `;

  const freqNames = {
    0: 'year',
    1: 'month',
    2: 'week',
    3: 'day',
  };

  if (document.querySelector('#repeatFreq').value === 'MONTHLY') {
    value += document.querySelector('.month-select').value;
  }
  else if (document.querySelector('#repeatFreq').value === "WEEKLY") {
    const byweekday = Array.from(document.querySelectorAll('.weekdays input'))
      .map((cb, i) => {
        if (cb.checked) {
          return daysOfWeek[i]
        }
      }).filter((d) => d).join(', ')
    value += `week on ${byweekday}`;
  }
  else {
    const freqName = freqNames[rrule.options.freq];
    value += freqName;
    if (rrule.options.interval > 1) {
      value += 's';
    }
  }

  const endType = document.querySelector('input[name="endType"]:checked').value;
  if (endType === 'after') {
    const occurrences = document.querySelector('#occurences').value;
    value += ` for ${occurrences} times`;
  } else if (endType === 'on') {
    const endDate = document.querySelector('#endDate').value;
    value += ` until ${endDate}`;
  }

  return value;
}



form.day.addEventListener('change', function (e) {
  if (form.repeat.value === 'custom') {
    updateRepeatOptions();
  }
});

function updateRepeatOptions() {
  const date = form.day.value.split('-');
  const monthSelect = document.querySelector('.month-select');
  const repeatFreq = document.querySelector('#repeatFreq').value;

  if (repeatFreq === 'MONTHLY') {
    monthSelect.firstElementChild.innerHTML = `Monthly on the ${ordinalNumber(date[2] < 10 ? date[2][1] : date[2])}`;
    monthSelect.firstElementChild.value = `Monthly on the ${ordinalNumber(date[2] < 10 ? date[2][1] : date[2])}`;

    const nthDay = getNthDayOfMonth(date[0], date[1], date[2]);
    const dayName = daysOfWeek[new Date(form.day.value).getDay()];
    monthSelect.lastElementChild.innerHTML = `The ${ordinalNumber(nthDay)} ${dayName} of every month`;
    monthSelect.lastElementChild.value = `The ${ordinalNumber(nthDay)} ${dayName} of every month`;
  }

  const rruleObj = createRRule();
  if (rruleObj) {
    const taskRRule = rruleObj;

    const displayValue = createValue(rruleObj);

    updateRepeatSelectOptions(displayValue, rruleObj);
  }
}

function updateRepeatSelectOptions(displayValue, rruleObj) {
  let customOption = Array.from(form.repeat.options).find(opt => opt.value.startsWith('RRULE:'));

  if (customOption) {
    customOption.text = displayValue;
    customOption.value = rruleObj.toString();
  } else {
    const option = document.createElement('option');
    option.text = displayValue;
    option.value = rruleObj.toString();
    form.repeat.appendChild(option);
  }
}
