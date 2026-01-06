let interval;
let selectedVoice = null;

function speakLife(totalSeconds, years, days, hours, minutes) {
  if (!('speechSynthesis' in window)) return;

  const message = `You have ${totalSeconds.toLocaleString()} seconds left to live. 
  That's about ${years} years, ${days} days, ${hours} hours, and ${minutes} minutes remaining.`;

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.pitch = 1;
  utterance.rate = 1;

  if (selectedVoice) {
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang;
  }

  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

window.startCountdown = function () {
  clearInterval(interval);

  const birthDateInput = document.getElementById("birthDate").value;
  const deathAge = parseInt(document.getElementById("deathAge").value);
  const countdownDiv = document.getElementById("countdown");

  if (!birthDateInput || isNaN(deathAge)) {
    countdownDiv.innerText = "❗ Please fill in both birthdate and death age.";
    return;
  }

  const birthDate = new Date(birthDateInput);
  const currentDate = new Date();
  const currentAge = (currentDate - birthDate) / (1000 * 60 * 60 * 24 * 365.25);

  if (currentAge < 10) {
    countdownDiv.innerText = "⚠️ Your current age must be at least 10.";
    return;
  }

  if (deathAge <= currentAge) {
    countdownDiv.innerText = "⚠️ Death age must be greater than your current age.";
    return;
  }

  const deathDate = new Date(birthDate);
  deathDate.setFullYear(deathDate.getFullYear() + deathAge);

const distance = deathDate - new Date();
const totalSeconds = Math.floor(distance / 1000);
const seconds = totalSeconds % 60;
const minutes = Math.floor((totalSeconds / 60) % 60);
const hours = Math.floor((totalSeconds / 3600) % 24);
const days = Math.floor((totalSeconds / (3600 * 24)) % 365);
const years = Math.floor(totalSeconds / (3600 * 24 * 365.25));

speakLife(totalSeconds, years, days, hours, minutes);


  // Layout: years on left, seconds on right
  countdownDiv.innerHTML = `
    <div class="countdown-columns">
      <div id="leftColumn"></div>
      <div id="rightColumn"></div>
    </div>
  `;

  const leftColumn = document.getElementById("leftColumn");
  const rightColumn = document.getElementById("rightColumn");

  function updateCountdown(skipAnimation = false) {
    const now = new Date();
    const distance = deathDate - now;

    if (distance <= 0) {
      clearInterval(interval);
      countdownDiv.innerText = "⏳ Time's up.";
      return;
    }

    const totalSeconds = Math.floor(distance / 1000);
    const seconds = Math.floor((distance / 1000) % 60);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const days = Math.floor((distance / (1000 * 60 * 60 * 24)) % 365);
    const years = Math.floor(distance / (1000 * 60 * 60 * 24 * 365));

    const leftUnits = [
      { label: "Years", value: years },
      { label: "Days", value: days },
      { label: "Hours", value: hours },
      { label: "Minutes", value: minutes },
      { label: "Seconds", value: seconds } 
    ];

    const rightUnits = formatBigSeconds(totalSeconds);

    // Reset
    leftColumn.innerHTML = "";
    rightColumn.innerHTML = "";

    /*leftUnits.forEach((unit, i) => {
      createBox(leftColumn, unit.value, unit.label, i, false, skipAnimation);
    });

    rightUnits.forEach((unit, i) => {
      createBox(rightColumn, unit.value, unit.label, i, true, skipAnimation);
    });*/
    // ⬅️ rightUnits go to the left column
rightUnits.forEach((unit, i) => {
  createBox(leftColumn, unit.value, unit.label, i, true, skipAnimation);
});

// ⬅️ leftUnits go to the right column
leftUnits.forEach((unit, i) => {
  createBox(rightColumn, unit.value, unit.label, i, false, skipAnimation);
});

  }
  // some quotes

let currentFact = 0;
function rotateFacts() {
  const factText = document.getElementById("factText");
  factText.style.opacity = 0;
  setTimeout(() => {
    currentFact = (currentFact + 1) % facts.length;
    factText.textContent = facts[currentFact];
    factText.style.opacity = 1;
  }, 400);
}

setInterval(rotateFacts, 5000);
// quotw end

  updateCountdown(false); // First time: animate
  interval = setInterval(() => updateCountdown(true), 1000); // Then: no animation
};


function formatBigSeconds(totalSeconds) {
  return [
    { label: "Billion", value: Math.floor(totalSeconds / 1_000_000_000) },
    { label: "Million", value: Math.floor((totalSeconds % 1_000_000_000) / 1_000_000) },
    { label: "Thousand", value: Math.floor((totalSeconds % 1_000_000) / 1_000) },
    { label: "Hundred", value: Math.floor((totalSeconds % 1_000) / 100) },
    { label: "Seconds", value: totalSeconds % 100 }
  ];
}

function createBox(container, value, label, index, inline = false, skipAnim = false) {
  const box = document.createElement("div");
  box.className = "time-box";

  if (!skipAnim) {
    box.style.animationName = "fadeInUp";
    box.style.animationDuration = "0.6s";
    box.style.animationTimingFunction = "ease";
    box.style.animationFillMode = "forwards";
    box.style.animationDelay = `${index * 0.2}s`;
  } else {
    box.style.opacity = 1;
  }

  const valueEl = document.createElement("div");
  valueEl.className = "value";
  valueEl.textContent = value;

  const labelEl = document.createElement("div");
  labelEl.className = "label";
  labelEl.textContent = label;

  if (inline) {
    box.style.flexDirection = "column";
    labelEl.style.marginLeft = "10px";
  }

  box.appendChild(valueEl);
  box.appendChild(labelEl);
  container.appendChild(box);
}



function initVoiceSelector() {
  const voiceSelect = document.getElementById("voiceSelect");
  if (!voiceSelect) return;

  function loadVoices() {
    const voices = speechSynthesis.getVoices();
    if (!voices.length) return;

    voiceSelect.innerHTML = '<option value="">Select Voice</option>';
    voices.forEach((voice) => {
      const option = document.createElement("option");
      option.value = voice.name;
      option.textContent = `${voice.name} (${voice.lang})`;
      voiceSelect.appendChild(option);

      if (voice.lang === "en-GB" && !selectedVoice) {
        selectedVoice = voice;
        voiceSelect.value = voice.name;
      }
    });
  }

  voiceSelect.addEventListener("change", () => {
    const voices = speechSynthesis.getVoices();
    selectedVoice = voices.find(v => v.name === voiceSelect.value);
  });

  loadVoices();
  if (typeof speechSynthesis.onvoiceschanged !== "undefined") {
    speechSynthesis.onvoiceschanged = loadVoices;
  }
}

window.addEventListener("DOMContentLoaded", () => initVoiceSelector());
window.addEventListener("pagehide", () => speechSynthesis.cancel());
window.addEventListener("beforeunload", () => speechSynthesis.cancel());

document.addEventListener("DOMContentLoaded", function () {
  flatpickr("#birthDate", {
    dateFormat: "Y-m-d"
  });
});






