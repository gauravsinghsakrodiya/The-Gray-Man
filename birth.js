let livedInterval;
let alreadyRendered = false;
let selectedVoice = null;

function loadVoices() {
  const voices = speechSynthesis.getVoices();
  // Choose the first English voice available
  selectedVoice = voices.find(voice => voice.lang.startsWith("en")) || voices[0];
}

// Load voices when available
if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = loadVoices;
  loadVoices();
}

function speakLivedTime(totalSeconds, years, days, hours, minutes) {
  if (!('speechSynthesis' in window) || !selectedVoice) return;

  const message = `You have been alive for ${years} years, ${days} days, ${hours} hours, and ${minutes} minutes.`;

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.voice = selectedVoice;
  speechSynthesis.cancel(); // Stop any previous speech
  speechSynthesis.speak(utterance);
}

function startLivedTimer() {
  clearInterval(livedInterval);
  alreadyRendered = false;

  const birthDateInput = document.getElementById("birthDate").value;
  const outputDiv = document.getElementById("livedOutput");

  if (!birthDateInput) {
    outputDiv.innerHTML = "<p>Please enter your birthdate.</p>";
    return;
  }

  const birthDate = new Date(birthDateInput);

  function updateTime() {
    const now = new Date();
    const diff = now - birthDate;

    if (diff <= 0) {
      outputDiv.innerHTML = "<p>You haven't been born yet!</p>";
      clearInterval(livedInterval);
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor((totalSeconds / 60) % 60);
    const hours = Math.floor((totalSeconds / 3600) % 24);
    const days = Math.floor((totalSeconds / (3600 * 24)) % 365);
    const years = Math.floor(totalSeconds / (3600 * 24 * 365.25));

    if (!alreadyRendered) {
      outputDiv.innerHTML = `
        <div class="time-box" style="animation-delay: 0.2s"><div class="value" id="years">${years}</div><div class="label">Years</div></div>
        <div class="time-box" style="animation-delay: 0.4s"><div class="value" id="days">${days}</div><div class="label">Days</div></div>
        <div class="time-box" style="animation-delay: 0.6s"><div class="value" id="hours">${hours}</div><div class="label">Hours</div></div>
        <div class="time-box" style="animation-delay: 0.8s"><div class="value" id="minutes">${minutes}</div><div class="label">Minutes</div></div>
        <div class="time-box" style="animation-delay: 1s"><div class="value" id="seconds">${seconds}</div><div class="label">Seconds</div></div>
      `;
      alreadyRendered = true;
      speakLivedTime(totalSeconds, years, days, hours, minutes); // Speak once when rendered
    } else {
      document.getElementById("years").textContent = years;
      document.getElementById("days").textContent = days;
      document.getElementById("hours").textContent = hours;
      document.getElementById("minutes").textContent = minutes;
      document.getElementById("seconds").textContent = seconds;
    }
  }

  updateTime(); // Initial update
  livedInterval = setInterval(updateTime, 1000); // Repeat every second
}

window.addEventListener("pagehide", () => speechSynthesis.cancel());
window.addEventListener("beforeunload", () => speechSynthesis.cancel());