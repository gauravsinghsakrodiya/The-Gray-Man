window.onload = () => {
  const toggleInput = document.getElementById('toggleMode');
  const dateInput = document.getElementById('date');
  const goalInput = document.getElementById("goal");
  const targetInput = document.getElementById("target");
  const resultBox = document.getElementById("result");
  const errorBox = document.getElementById("error");

  // Flatpickr calendar setup
  flatpickr("#date", {
    dateFormat: "Y-m-d",
    maxDate: "today",
    minDate: "1900-01-01",
    defaultDate: "2005-01-01",
    monthSelectorType: "dropdown",
    onOpen: function (selectedDates, dateStr, instance) {
      setTimeout(() => {
        const yearInput = instance.calendarContainer.querySelector(".flatpickr-year");
        if (yearInput) {
          yearInput.addEventListener("beforeinput", function (e) {
            const isTyping = e.inputType === "insertText" || e.inputType === "insertFromPaste";
            const currentLength = this.value.length;
            const selectionLength = window.getSelection().toString().length;
            if (isTyping && currentLength - selectionLength >= 4) e.preventDefault();
          });

          yearInput.addEventListener("wheel", e => e.preventDefault());
          yearInput.addEventListener("input", function () {
            this.value = this.value.replace(/[^0-9]/g, '');
          });
        }
      }, 10);
    }
  });

  // Default to today if not using DOB
  const today = new Date();
  dateInput.value = today.toISOString().split("T")[0];
  dateInput.readOnly = true;

  toggleInput.addEventListener("change", () => {
    errorBox.innerText = "";
    if (toggleInput.checked) {
      dateInput.readOnly = false;
      dateInput.value = "";
    } else {
      const today = new Date();
      dateInput.value = today.toISOString().split("T")[0];
      dateInput.readOnly = true;
    }
  });

  window.calculateGoalReminder = () => {
    const goal = goalInput.value.trim();
    const isDOB = toggleInput.checked;
    const date = dateInput.value;
    const targetYears = parseInt(targetInput.value);
    const now = new Date();
    let yearsLeft = 0;
    let age = null;

    errorBox.innerText = "";
    resultBox.style.display = 'none';

    if (!goal || isNaN(targetYears) || targetYears < 1 || targetYears > 100) {
      alert("Please fill out all fields correctly.");
      return;
    }

    if (isDOB) {
      if (!date) {
        errorBox.innerText = "Please provide your Date of Birth.";
        return;
      }

      const dobDate = new Date(date);
      age = Math.floor((now - dobDate) / (1000 * 60 * 60 * 24 * 365.25));

      if (targetYears <= age) {
        showPopup("Please Enter More Than Your Age Or Switch To Current Date");
        return;
      }

      yearsLeft = targetYears - age;
    } else {
      const futureDate = new Date(now);
      futureDate.setFullYear(now.getFullYear() + targetYears);
      const diffMs = futureDate - now;
      yearsLeft = diffMs / (1000 * 60 * 60 * 24 * 365.25);
    }

    const daysLeft = Math.floor(yearsLeft * 365.25);
    const enteredYear = new Date(date).getFullYear();

    const goalData = {
      goal: goal,
      isDOB: isDOB,
      enteredDate: date,
      enteredYear: enteredYear,
      ageIfDOB: age,
      targetYears: targetYears,
      baseDate: now.toISOString(),
      daysLeft: daysLeft
    };

    let history = JSON.parse(localStorage.getItem("goalHistory")) || [];
    history.push(goalData);
    localStorage.setItem("goalHistory", JSON.stringify(history));

    resultBox.style.display = 'block';
    resultBox.innerHTML = `
      <strong>Goal:</strong> ${goal}<br><br>
      You have approximately <strong>${daysLeft.toLocaleString()}</strong> days left to achieve your goal.
    `;

    displayGoalHistory();
  };

  displayGoalHistory();

  // Sidebar logic
  const sidebar = document.getElementById("sidebar");
  const toggleBtn = document.getElementById("sidebarToggle");

  if (sidebar && toggleBtn) {
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent immediate close
      sidebar.classList.add("open");
      toggleBtn.style.display = "none";
    });

    document.addEventListener("click", (e) => {
      const isMobile = window.innerWidth < 768;
      const clickedOutsideSidebar = !sidebar.contains(e.target) && !toggleBtn.contains(e.target);

      if (isMobile && sidebar.classList.contains("open") && clickedOutsideSidebar) {
        sidebar.classList.remove("open");
        toggleBtn.style.display = "block";
      }
    });
  }
};

function showPopup(message) {
  document.getElementById('popupMessage').innerText = message;
  document.getElementById('popupCard').style.display = 'block';
}

function closePopup() {
  document.getElementById('popupCard').style.display = 'none';
}

function displayGoalHistory() {
  const historyBox = document.getElementById("historyBox");
  if (!historyBox) return;

  const history = JSON.parse(localStorage.getItem("goalHistory")) || [];
  historyBox.innerHTML = "<h3>📜 Goal History</h3>";

  if (history.length === 0) {
    historyBox.innerHTML += "<p>No saved goals yet.</p>";
    return;
  }

  const now = new Date();
  history.forEach((item) => {
    let endDate;

    if (item.isDOB) {
      const dob = new Date(item.enteredDate);
      dob.setFullYear(dob.getFullYear() + item.targetYears);
      endDate = dob;
    } else {
      const baseDate = new Date(item.baseDate);
      baseDate.setFullYear(baseDate.getFullYear() + item.targetYears);
      endDate = baseDate;
    }

    const daysRemaining = Math.max(0, Math.floor((endDate - now) / (1000 * 60 * 60 * 24)));

    const div = document.createElement("div");
    div.style.marginBottom = "10px";

    let content = `
      <strong>🎯 Goal:</strong> ${item.goal}<br>
    `;

    if (item.isDOB) {
      content += `
        📅 DOB: ${item.enteredDate}<br>
        🎂 Age at Entry: ${item.ageIfDOB} years<br>
      `;
    } else {
      content += `
        📅 Current Date: ${item.enteredDate}<br>
      `;
    }

    content += `
      🎯 Target: ${item.targetYears} years<br>
      ⏳ Days Left: <strong>${daysRemaining}</strong>
      <hr>
    `;

    div.innerHTML = content;
    historyBox.appendChild(div);
  });
}
