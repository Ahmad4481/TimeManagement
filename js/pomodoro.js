if (Notification.permission !== 'denied') {
  Notification.requestPermission();
}

function toggleSidebar() {
  document.querySelector(".toggle-sidebar").addEventListener("click", () => {
    document.querySelector("aside").classList.toggle("hidden");
    document.querySelectorAll("aside li").forEach((el) => {
      el.lastChild.style.fontSize = document
        .querySelector("aside")
        .classList.contains("hidden")
        ? "0"
        : "1.6rem";
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const timer = new PomodoroTimer();

  

  toggleSidebar();
});

// الكود الخاص بـ Pomodoro Timer
class PomodoroTimer {
  constructor() {
    this.minutesDisplay = document.getElementById("minutes");
    this.secondsDisplay = document.getElementById("seconds");
    this.startButton = document.getElementById("start");
    this.pauseButton = document.getElementById("pause");
    this.resetButton = document.getElementById("reset");
    this.modeButtons = document.querySelectorAll(".mode-btn");

    this.pomodoroInput = document.getElementById("pomodoro-duration");
    this.shortBreakInput = document.getElementById("short-break");
    this.longBreakInput = document.getElementById("long-break");

    this.timeLeft =
      this.pomodoroInput.value && !isNaN(this.pomodoroInput.value)
        ? this.pomodoroInput.value * 60
        : 25;

    this.timerId = null;
    this.isRunning = false;
    this.currentMode = "pomodoro";

    this.initializeEventListeners();
  }

  initializeEventListeners() {
    this.startButton.addEventListener("click", () => this.startTimer());
    this.pauseButton.addEventListener("click", () => this.pauseTimer());
    this.resetButton.addEventListener("click", () => this.resetTimer());

    this.modeButtons.forEach((button) => {
      button.addEventListener("click", (e) => this.changeMode(e));
    });

    this.pomodoroInput.addEventListener("change", () => this.updateSettings());
    this.shortBreakInput.addEventListener("change", () =>
      this.updateSettings()
    );
    this.longBreakInput.addEventListener("change", () => this.updateSettings());
  }

  startTimer() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.startButton.disabled = true;
      this.pauseButton.disabled = false;

      this.timerId = setInterval(() => {
        if (this.timeLeft > 0) {
          this.timeLeft--;
          this.updateDisplay();
        } else {
          this.timerComplete();
        }
      }, 1000); // تعدل التأخير هنا ليكون 1000 مللي ثانية (1 ثانية)
    }
  }

  pauseTimer() {
    clearInterval(this.timerId);
    this.isRunning = false;
    this.startButton.disabled = false;
    this.pauseButton.disabled = true;
  }

  resetTimer() {
    this.pauseTimer();
    this.timeLeft = this.getCurrentModeTime() * 60;
    this.updateDisplay();
  }

  updateDisplay() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;

    this.minutesDisplay.textContent = minutes.toString().padStart(2, "0");
    this.secondsDisplay.textContent = seconds.toString().padStart(2, "0");

    document.title = `${minutes}:${seconds.toString().padStart(2, "0")} - Pomodoro Timer`;
  }

  changeMode(event) {
    this.modeButtons.forEach((btn) => btn.classList.remove("active"));
    event.target.classList.add("active");

    if (event.target.textContent === "Pomodoro") {
      this.currentMode = "pomodoro";
      this.timeLeft = this.pomodoroInput.value * 60;
    } else if (event.target.textContent === "Short Break") {
      this.currentMode = "shortBreak";
      this.timeLeft = this.shortBreakInput.value * 60;
    } else {
      this.currentMode = "longBreak";
      this.timeLeft = this.longBreakInput.value * 60;
    }

    this.pauseTimer();
    this.updateDisplay();
  }

  getCurrentModeTime() {
    switch (this.currentMode) {
      case "pomodoro":
        return parseInt(this.pomodoroInput.value);
      case "shortBreak":
        return parseInt(this.shortBreakInput.value);
      case "longBreak":
        return parseInt(this.longBreakInput.value);
      default:
        return 25;
    }
  }

  updateSettings() {
    if (!this.isRunning) {
      this.timeLeft = this.getCurrentModeTime() * 60;
      this.updateDisplay();
    }
  }

  timerComplete() {
    this.pauseTimer();
    this.playNotificationSound();
    this.showPushNotification();
  }

  playNotificationSound() {
    let audio = new Audio(
      "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
    );
    audio.play().catch((error) => console.log("Error playing sound:", error));
  }

  // التعديل هنا لعرض الإشعار عبر Push
  showPushNotification() {
    if (Notification.permission === "granted") {
      navigator.serviceWorker.ready.then(function (registration) {
        registration.showNotification("Pomodoro Timer", {
          body: "Time is up! Take a break.",
          icon: "/path/to/icon.png", // يمكنك إضافة أيقونتك هنا
        });
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  }
}
