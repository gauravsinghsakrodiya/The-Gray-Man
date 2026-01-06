let items = document.querySelectorAll('.slider .item');
let next = document.getElementById('next');
let prev = document.getElementById('prev');

let active = 3;
let autoSlideInterval;

function loadshow() {
  let stt = 0;
  items[active].style.transform = 'none';
  items[active].style.zIndex = 1;
  items[active].style.filter = 'none';
  items[active].style.opacity = 1;

  for (let i = active + 1; i < items.length; i++) {
    stt++;
    items[i].style.transform = `translateX(${120 * stt}px) scale(${1 - 0.2 * stt}) perspective(16px) rotateY(-1deg)`;
    items[i].style.zIndex = -stt;
    items[i].style.filter = 'blur(5px)';
    items[i].style.opacity = stt > 2 ? 0 : 0.6;
  }

  stt = 0;
  for (let i = active - 1; i >= 0; i--) {
    stt++;
    items[i].style.transform = `translateX(${-120 * stt}px) scale(${1 - 0.2 * stt}) perspective(16px) rotateY(1deg)`;
    items[i].style.zIndex = -stt;
    items[i].style.filter = 'blur(5px)';
    items[i].style.opacity = stt > 2 ? 0 : 0.6;
  }
}

function goNext() {
  if (active < items.length - 1) {
    active++;
    loadshow();
  } else {
    // Last slide → trigger fast reverse flip
    flipToStart();
  }
}

function goPrev() {
  active = (active - 1 + items.length) % items.length;
  loadshow();
}

// 🚀 Flip Book Style Reverse
function flipToStart() {
  let reverseIndex = active;
  let interval = setInterval(() => {
    reverseIndex--;
    if (reverseIndex >= 0) {
      active = reverseIndex;
      loadshow();
    } else {
      clearInterval(interval);
      active = 0;
      loadshow();
    }
  }, 150); // Fast reverse (every 200ms)
}

next.onclick = goNext;
prev.onclick = goPrev;

function startAutoSlide() {
  autoSlideInterval = setInterval(goNext, 5000);
}

startAutoSlide();
loadshow();
