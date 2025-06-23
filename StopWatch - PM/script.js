const pad = (n, w = 2) => String(n).padStart(w, '0');

// ===== CRONÓMETRO =====
let crInterval, crStart, crElapsed = 0, crRunning = false;
const crDisplay = document.getElementById('cronometro-display');
const crStartBtn = document.getElementById('cronometro-start');
const crLapBtn = document.getElementById('cronometro-lap');
const crResetBtn = document.getElementById('cronometro-reset');
const crLaps = document.getElementById('cronometro-laps');

function formatCron(ms) {
  const date = new Date(ms);
  return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}.${pad(date.getUTCMilliseconds(), 3)}`;
}

function updateCron() {
  crDisplay.textContent = formatCron(Date.now() - crStart + crElapsed);
}

crStartBtn.addEventListener('click', () => {
  if (!crRunning) {
    crStart = Date.now();
    crInterval = setInterval(updateCron, 50);
    crRunning = true;
    crStartBtn.textContent = 'Pausar';
    crLapBtn.disabled = false;
  } else {
    clearInterval(crInterval);
    crElapsed += Date.now() - crStart;
    crRunning = false;
    crStartBtn.textContent = 'Continuar';
  }
});

crLapBtn.addEventListener('click', () => {
  const li = document.createElement('li');
  li.className = "list-group-item";
  li.textContent = crDisplay.textContent;
  crLaps.prepend(li);
});

crResetBtn.addEventListener('click', () => {
  clearInterval(crInterval);
  crElapsed = 0;
  crDisplay.textContent = '00:00:00.000';
  crRunning = false;
  crStartBtn.textContent = 'Iniciar';
  crLapBtn.disabled = true;
  crLaps.innerHTML = '';
});

// ===== CUENTA REGRESIVA =====
let cdInterval, cdEnd, cdRemaining = 0, cdRunning = false, flashInterval;
const sh = document.getElementById('select-hours');
const sm = document.getElementById('select-minutes');
const ss = document.getElementById('select-seconds');
const cdDisplay = document.getElementById('countdown-display');
const cdBtn = document.getElementById('countdown-start');
const cdResetBtn = document.getElementById('countdown-reset');
const cdHist = document.getElementById('countdown-history');
const alarm = document.getElementById('alarm-sound');

["select-hours", "select-minutes", "select-seconds"].forEach((id, idx) => {
  const sel = document.getElementById(id);
  for (let i = 0; i < (idx === 0 ? 24 : 60); i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = pad(i);
    sel.appendChild(opt);
  }
});

function updateCd() {
  const rem = cdEnd - Date.now();
  if (rem <= 0) {
    clearInterval(cdInterval);
    cdDisplay.textContent = '00:00:00';
    if (!flashInterval) {
      startFlash();
      alarm.play();
    }
    cdRunning = false;
    cdBtn.textContent = 'Stop';
    return;
  }
  cdRemaining = rem;
  const hrs = Math.floor(rem / 3600000);
  const mins = Math.floor((rem % 3600000) / 60000);
  const secs = Math.floor((rem % 60000) / 1000);
  cdDisplay.textContent = `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

function startFlash() {
  flashInterval = setInterval(() => {
    cdDisplay.style.visibility = cdDisplay.style.visibility === 'hidden' ? 'visible' : 'hidden';
  }, 500);
}

function stopFlash() {
  clearInterval(flashInterval);
  flashInterval = null;
  cdDisplay.style.visibility = 'visible';
  alarm.pause();
  alarm.currentTime = 0;
}

cdBtn.addEventListener('click', () => {
  if (!cdRunning && cdRemaining === 0 && cdBtn.textContent !== 'Stop') {
    const hrs = +sh.value, mins = +sm.value, secs = +ss.value;
    const total = (hrs * 3600 + mins * 60 + secs) * 1000;
    if (!total) return;
    cdEnd = Date.now() + total;
    cdInterval = setInterval(updateCd, 200);
    cdRunning = true;
    cdBtn.textContent = 'Pausar';

    const li = document.createElement('li');
    li.className = "list-group-item";
    li.textContent = `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    cdHist.prepend(li);

  } else if (cdRunning) {
    clearInterval(cdInterval);
    cdRemaining = cdEnd - Date.now();
    cdRunning = false;
    cdBtn.textContent = 'Continuar';
  } else if (cdBtn.textContent === 'Stop') {
    // Cuando llega a 0 y está sonando/parpadeando
    stopFlash();
    cdBtn.textContent = 'Play';
    cdRemaining = 0;
  } else {
    // Reanudar
    cdEnd = Date.now() + cdRemaining;
    cdInterval = setInterval(updateCd, 200);
    cdRunning = true;
    cdBtn.textContent = 'Pausar';
  }
});

cdResetBtn.addEventListener('click', () => {
  clearInterval(cdInterval);
  stopFlash(); // Solo en caso de reinicio luego de finalización
  sh.selectedIndex = 0;
  sm.selectedIndex = 0;
  ss.selectedIndex = 0;
  cdDisplay.textContent = '00:00:00';
  cdBtn.textContent = 'Play';
  cdRunning = false;
  cdRemaining = 0;
  cdHist.innerHTML = '';
});
