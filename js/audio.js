import notes from './notes.js';

let playing = false;

let audioContextGlobal = null;

function getAudioContext() {
  if (!audioContextGlobal) {
    audioContextGlobal = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioContextGlobal.state === 'suspended') {
    audioContextGlobal.resume();
  }

  return audioContextGlobal;
}

const playOscillator = (context, frequency) => {
  const o = context.createOscillator();
  const g = context.createGain();

  o.type = 'sine';
  o.frequency.value = frequency;

  g.gain.value = 0.25;
  o.connect(g);
  g.connect(context.destination);

  g.gain.setValueAtTime(0.25, context.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.2);

  o.start();
  o.stop(context.currentTime + 1.2);
};


window.tID = [];

function playSong(song) {
  manualSound = [];

  const context = getAudioContext();

  window.tID = [];

  for (let i = 0; i < song.length; i++) {
    const tID = setTimeout(() => {
      playOscillator(context, notes[song[i][0]]);

      const li = document.querySelector(`[data-note="${song[i][0]}"]`);
      blink(li);

      if (i + 1 === song.length) {
        playing = false;
      }
    }, song[i][1]);

    window.tID.push(tID);
  }
}


document.getElementById('stop').addEventListener('click', () => {
  playing = false;

  removeSnow();
  removeBgLight();
  removeColorTree();
  manualSound = [];

  const tID = window.tID || [];
  tID.forEach((id) => clearTimeout(id));
  window.tID = [];
});

function notesTime(song) {
  const songTimed = [];
  let acc = 0;
  for (let i = 0; i < song.length; i++) {
    const time = (song[i - 1] ? song[i - 1][1] : 0) * 300;
    acc += time;
    songTimed.push([song[i][0], acc]);
  }

  return songTimed;
}

const song = [
  ['G3', 2],
  ['A3', 1],
  ['G3', 2],
  ['E3', 4],
  ['G3', 2],
  ['A3', 1],
  ['G3', 2],
  ['E3', 4],
  ['D4', 3],
  ['D4', 2],
  ['B3', 3],
  ['C4', 3],
  ['C4', 2],
  ['G3', 3],
  ['A3', 3],
  ['A3', 2],
  ['C4', 2],
  ['B3', 1],
  ['A3', 3],
  ['G3', 2],
  ['A3', 1],
  ['G3', 2],
  ['E3', 3],
  ['A3', 2],
  ['A3', 1],
  ['C4', 3],
  ['B3', 1],
  ['A3', 2],
  ['G3', 3],
  ['A3', 1],
  ['G3', 2],
  ['E3', 3],
  ['D4', 2],
  ['D4', 1],
  ['F4', 2],
  ['D4', 2],
  ['B3', 2],
  ['C4', 3],
  ['E4', 3],
  ['C4', 2],
  ['G3', 1],
  ['E3', 2],
  ['G3', 2],
  ['F3', 2],
  ['D3', 2],
  ['C3', 4],
];

let manualSound = [];
let soundCompare = [];

function blink(el) {
  setTimeout(() => el.classList.add('blink'));
  setTimeout(() => el.classList.remove('blink'), 400);
}

window.playGlobalNote = (frequency) => {
  const context = getAudioContext();
  playOscillator(context, frequency);
};

function makeTree(song) {
  const tree = document.getElementById('tree');
  const uniqueNotes = [...new Set(song.map((n) => n[0]))];
  uniqueNotes.map((note) => {
    const f = notes[note];
    tree.innerHTML += `<li onClick="playGlobalNote(${f})" data-note="${note}">${note}</li>`;
  });
  const lis = document.querySelectorAll('#tree li');
  lis.forEach((li) => {
    li.addEventListener('click', () => blink(li));
  });
}

function setSoundCompare() {
  for (let s of song) {
    soundCompare.push(s[0]);
  }
}

setSoundCompare();

function showAlert(message, type = 'info', duration = 5000) {
  const container = document.getElementById('alert-container');

  const alert = document.createElement('div');
  alert.className = `alert ${type}`;
  alert.innerHTML = `
    <span>${message}</span>
    <button>&times;</button>
  `;

  alert.querySelector('button').onclick = () => removeAlert(alert);

  container.appendChild(alert);

  setTimeout(() => removeAlert(alert), duration);
}

function removeAlert(alert) {
  alert.style.animation = 'slideOut 0.4s ease forwards';
  setTimeout(() => alert.remove(), 400);
}


makeTree(song);
document
  .getElementById('play')
  .addEventListener('click', () => {
    if (!playing) {
      playSong(notesTime(song))
    }

    playing = true;
  } 
);

function addSnow() {
  const script = document.createElement('script');
  script.id = 'snowScript';
  script.src = 'js/snow.js';
  document.body.appendChild(script);
}

function removeSnow() {
  const body = document.querySelector(".container");
  const snow = document.getElementById('embedim--snow'); 

  if (snow !== null) {
    body.removeChild(snow);
  }
}

function setBgLight() {
  let body = document.querySelector(".container");

  body.classList.add("bg-light");
}

function removeBgLight() {
  let body = document.querySelector(".container");

  body.classList.remove("bg-light");
}

function setColorTree() {
  const lis = document.querySelectorAll('#tree li');

  lis.forEach((l) => {
    l.classList.add("tree-active");
  });
}

function removeColorTree() {
  const lis = document.querySelectorAll('#tree li');

  lis.forEach((l) => {
    l.classList.remove("tree-active");
  });

}

document
  .querySelectorAll("[data-note]")
  .forEach((note) => {
    note.addEventListener("click", (el) => {
      manualSound.push(note.dataset.note);
      
      if (soundCompare.length === manualSound.length) {
        if (JSON.stringify(soundCompare) === JSON.stringify(manualSound)) {
          setBgLight();
          setColorTree();
          addSnow();
        } else {
          manualSound = [];
          showAlert("🙁 Poxa... Não é esse o som, tente novamente!");
        }
      }
    });
  });

