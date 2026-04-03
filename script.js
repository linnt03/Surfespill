// Henter elementene fra HTML
const surfer = document.getElementById("surfer");
const game = document.getElementById("entities");
const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const finalScore = document.getElementById("finalScore");


let gameRunning = false;
let obstacles = [];

// Fart og spawn (blir vanskeligere over tid)
let speed = 5;
let spawnRate = 1500;

// Lanes (posisjoner på skjermen)
let currentLane = 1; // starter i midten

function getLanes() {
  const h = window.innerHeight;

  if (window.innerWidth <= 1000) {
    return [40, 100, 160];
  } else {
    return [50, 200, 350];
  }
}

window.addEventListener("resize", () => {
  lanes = getLanes();
  updateSurferPosition();
});


let lanes = getLanes();

// Scorevariabel
let score = 0;


// Setter spilleren i riktig lane (opp/ned posisjon)
function updateSurferPosition() {
  surfer.style.bottom = lanes[currentLane] + "px";
}

// Gir surferen en liten opp/ned bevegelse så det ser ut som han rir bølgen
function animateSurfer() {
  const bob = Math.sin(waveX * 0.05) * 5;

  surfer.style.transform = `translateY(${bob}px)`;
}


// Startposisjon
updateSurferPosition();


// Tar input fra piltaster og flytter spilleren mellom lanes
document.addEventListener("keydown", (event) => {
  if (event.code === "ArrowUp" && currentLane < 2) {
    currentLane++;
    updateSurferPosition();
  }

  if (event.code === "ArrowDown" && currentLane > 0) {
    currentLane--;
    updateSurferPosition();
  }
});

// Bølge som eveger seg over skjermen
let waveX = 0;
const wave = document.getElementById("wave");

function moveWave() {
  waveX -= speed; // følger game speed
  wave.style.backgroundPosition = waveX + "px 0px";
}

// Skum på bølgen som "glitcher"
const foam = document.getElementById("foam");

function animateFoam() {
  if (Math.random() < 0.1) { // 10% sjanse hver frame
    foam.style.opacity = 1;
  } else {
    foam.style.opacity = 0;
  }
}


// Lager en ny obstacle og plasserer den i tilfeldig lane og tilfeldig type obstacle fra fil
function createObstacle() {
  const obs = document.createElement("div");
  obs.classList.add("obstacle");

  // velg tilfeldig obstacle type
  const types = [ "shark", "buoy", "person"]; // TODO - add måke ?
  const type = types[Math.floor(Math.random() * types.length)];

  obs.style.backgroundImage = `url("assets/${type}.png")`;

  let lane = Math.floor(Math.random() * 3);
  obs.style.bottom = lanes[lane] + "px";
  obs.style.left = window.innerWidth + "px";

  document.getElementById("entities").appendChild(obs);

  obstacles.push({
    element: obs,
    lane: lane,
    position: window.innerWidth
  });
}



// Flytter alle obstacles mot venstre og fjerner dem når de er ute av skjermen
function moveObstacles() {
  obstacles.forEach((obs, index) => {
    obs.position -= speed;
    obs.element.style.left = obs.position + "px";

    if (obs.position < -50) {
      obs.element.remove();
      obstacles.splice(index, 1);
    }
  });
}


// Sjekker om spilleren kolliderer med noen av obstacles
// Bruker "bounding box" for nøyaktig collision
function checkCollision() {
  const surferRect = surfer.getBoundingClientRect();

  obstacles.forEach((obs) => {
    const obstacleRect = obs.element.getBoundingClientRect();

    const isColliding =
      surferRect.left < obstacleRect.right &&
      surferRect.right > obstacleRect.left &&
      surferRect.top < obstacleRect.bottom &&
      surferRect.bottom > obstacleRect.top;

    if (isColliding) {
      gameOver();
    }
  });
}


// Oppdaterer score gradvis over tid
function updateScore() {
  score += 0.1;
  document.getElementById("score").innerText = Math.floor(score);
}

// knapp start spill
startBtn.addEventListener("click", () => {
  startScreen.classList.add("hidden");
  gameRunning = true;
  spawnObstacleLoop();
});

// knapp restart spill
restartBtn.addEventListener("click", () => {
  resetGame();
});

function resetGame() {
  // reset score
  score = 0;
  document.getElementById("score").innerText = 0;

  // fjern gamle obstacles
  obstacles.forEach((obs) => obs.element.remove());
  obstacles = [];

  // reset fart og spawn
  speed = 5;
  spawnRate = 1500;

  // reset spiller
  currentLane = 1;
  updateSurferPosition();

  // skjul game over screen
  gameOverScreen.classList.add("hidden");

  // start spillet igjen
  gameRunning = true;

  // restart obstacle spawning
  spawnObstacleLoop();
}



// Stopper spillet når du krasjer og viser scoren du fikk
function gameOver() {
  gameRunning = false;

  gameOverScreen.classList.remove("hidden");

  finalScore.innerText = "Your Score: " + Math.floor(score);

}



// Hovedloop som kjører spillet kontinuerlig
function gameLoop() {
  if (!gameRunning) return;

  moveWave(); // bølgen beveger seg langs skjermen
  moveObstacles(); // Hindere beveger seg mot venstre
  checkCollision(); // Kollisjon = game over
  updateScore(); // score i hjørnet oppdateres
  //animateFoam(); // skum glticher 
  animateSurfer(); // Surfer beveger litt på seg
}


// Spawner obstacles med delay som blir kortere over tid
function spawnObstacleLoop() {
  if (!gameRunning) return;

  createObstacle();

  setTimeout(spawnObstacleLoop, spawnRate);
}


// Øker vanskelighetsgrad gradvis (mer fart + flere obstacles)
setInterval(() => {
  if (!gameRunning) return;

  speed += 0.3;

  if (spawnRate > 500) {
    spawnRate -= 100;
  }
}, 3000);

// touch for mobil
function setupTouchControls() {
  let touchStartY = 0;
  let touchEndY = 0;

  document.addEventListener("touchstart", (e) => {
    touchStartY = e.touches[0].clientY;
  });

  document.addEventListener("touchend", (e) => {
    touchEndY = e.changedTouches[0].clientY;
    handleSwipe();
  });

  function handleSwipe() {
    const diff = touchStartY - touchEndY;

    // swipe opp → gå opp en lane
    if (diff > 50 && currentLane < 2) {
      currentLane++;
      updateSurferPosition();
    }

    // swipe ned → gå ned en lane
    if (diff < -50 && currentLane > 0) {
      currentLane--;
      updateSurferPosition();
    }
  }
}

if ('ontouchstart' in window) {
  setupTouchControls();
}


// Starter spillet
setInterval(gameLoop, 20);


