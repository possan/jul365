import { AudioPlayer } from "./audioplayer.js";

const SONGS = [
  {
    id: "carey10",
    shorttitle: "Mariah Carey",
    title: "Mariah Carey - All i want for christmas",
  },
  {
    id: "justd1000",
    shorttitle: "Just-D",
    title: "Just-D - Nu är det jul igen",
  },
];

let currentSong = "carey10";
let timelineEl;
let timestampEl;
let cursorEl;
let progressEl;
let statusEl;
let status2El;
let rawsegment;
let percent;
let todaypercent;
let player1;
let player2;
let audio1id;
let audio1volume;
let audio2id;
let audio2volume;
let ctx;
let lastchristmas;
let nextchristmas;
const timeformatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "medium",
  hour12: false,
});

function updateids() {
  var segment = (percent * (365 * 4)) / 100.0;
  rawsegment = percent;
  var leftsegment = Math.floor(segment);
  var rightsegment = leftsegment + 1;
  audio1id = leftsegment;
  audio2id = rightsegment;
  var fade = (segment - leftsegment) / (rightsegment - leftsegment);
  audio1volume = Math.round(fade * 100);
  audio2volume = 100 - audio1volume;

  // https://lab.possan.codes/jul365/audio/carey10/segment-100.mp3
  // player1.set(`audio/${currentSong}/segment-${audio1id}.mp3`, audio1volume);
  // player2.set(`audio/${currentSong}/segment-${audio2id}.mp3`, audio2volume);

  player1.set(
    `https://lab.possan.codes/jul365/audio/${currentSong}/segment-${audio1id}.mp3`,
    audio1volume
  );
  player2.set(
    `https://lab.possan.codes/jul365/audio/${currentSong}/segment-${audio2id}.mp3`,
    audio2volume
  );
}

function initDates() {
  const now = new Date();

  lastchristmas = new Date(
    now.getFullYear() - 1,
    11,
    24,
    15,
    0,
    0,
    0
  ).getTime();

  nextchristmas = new Date(now.getFullYear(), 11, 24, 15, 0, 0, 0).getTime();

  todaypercent =
    (100.0 * (now.getTime() - lastchristmas)) / (nextchristmas - lastchristmas);
}

function updateui() {
  progressEl.style.width = `${percent}%`;

  var day = Math.floor(rawsegment / 4);
  var inday = Math.round(((rawsegment % 4) * 100) / 4);

  var ts = lastchristmas + ((nextchristmas - lastchristmas) * percent) / 100.0;

  statusEl.textContent = "";
  status2El.textContent = "";

  timestampEl.textContent = timeformatter.format(ts);
}

function mouseMoveTimeline(e) {
  if (e.buttons === 0) {
    return;
  }
  console.log("e", e);

  const bounds = timelineEl.getBoundingClientRect();
  console.log("bounds", bounds);

  let pct = (e.offsetX * 100) / bounds.width;
  // ((e.clientX - timelineEl.offsetLeft) * 100) / timelineEl.clientWidth;
  console.log("pct", pct);

  pct = Math.max(0, Math.min(100, pct));
  percent = pct;

  updateids();
  updateui();
}

function mouseUpTimeline(e) {
  // if (e.buttons === 0) {
  //   return;
  // }
  console.log("e", e);

  const bounds = timelineEl.getBoundingClientRect();
  console.log("bounds", bounds);

  let pct = (e.offsetX * 100) / bounds.width;
  // ((e.clientX - timelineEl.offsetLeft) * 100) / timelineEl.clientWidth;
  console.log("pct", pct);

  pct = Math.max(0, Math.min(100, pct));
  percent = pct;

  updateids();
  updateui();
}

function maybestartaudio() {
  if (ctx) {
    return;
  }

  document.getElementById("enableaudio").style.display = "none";
  document.getElementById("audioenabled").style.display = "block";

  console.log("start audio");
  ctx = new AudioContext();

  player1.context = ctx;
  player2.context = ctx;

  setInterval(() => {
    player1.tick();
    player2.tick();
  }, 30);
}

function checkSong() {
  const hash = location.hash.length > 1 ? location.hash.substring(1) : "";

  const url = new URL("http://localhost/?" + hash);
  console.log("hash changed", hash, url, url.searchParams);

  const song = url.searchParams.get("song");
  if (song) {
    currentSong = song;
  }

  const time = url.searchParams.get("time");
  if (time) {
    percent = Number(time);
  }

  console.log("currentSong", currentSong);
  console.log("percent", percent);

  updateui();
  updateids();
}

function updateSongMenu() {
  for (let k = 0; k < SONGS.length; k++) {
    const el = document.getElementById(`song${k}`);
    el.textContent = SONGS[k].shorttitle;
    el.className = k === currentSong ? "selected" : "";
    el.setAttribute("href", `#song=${SONGS[k].id}`);
  }

  const song = SONGS.find((s) => s.id === currentSong);
  document.getElementById("songtitle").textContent = song?.title;
}

function setTodayPercent() {
  percent = todaypercent; // Math.random() * 100;
}

function gotoToday() {
  setTodayPercent();
  updateids();
  updateui();
}

function setHash() {
  const hash = `#song=${currentSong}&time=${Math.round(percent * 100) / 100}`;
  console.log("set hash", hash);
  location = hash;
}

function nudgeTime(e) {
  console.log("nudge", e);

  percent -= Number(e.deltaY) / 100.0;
  percent += Number(e.deltaX) / 100.0;
  percent = Math.max(0, Math.min(100, percent));

  updateids();
  updateui();

  event.preventDefault();
}

function init() {
  console.log("init");

  timelineEl = document.querySelector("div.timeline div.inner");
  timelineEl.addEventListener("mousemove", mouseMoveTimeline);
  timelineEl.addEventListener("mouseup", mouseUpTimeline);
  timelineEl.addEventListener("mousedown", mouseUpTimeline);
  timelineEl.addEventListener("mousewheel", nudgeTime, false);
  timelineEl.addEventListener("click", setHash);

  timestampEl = document.getElementById("timestamp");

  progressEl = document.querySelector("div.timeline div.inner div.progress");
  cursorEl = document.querySelector("div.timeline div.inner div.cursor");

  statusEl = document.querySelector("p.status");
  status2El = document.querySelector("p.status2");

  document.getElementById("today").addEventListener("click", gotoToday);
  document.addEventListener("click", maybestartaudio);

  player1 = new AudioPlayer();
  player2 = new AudioPlayer();

  window.addEventListener("hashchange", () => {
    checkSong();
    updateSongMenu();
  });

  // init stuff

  initDates();

  setTodayPercent();
  checkSong();
  updateSongMenu();

  cursorEl.style.left = `${todaypercent}%`;

  updateids();
  updateui();
}

window.addEventListener("load", init);
