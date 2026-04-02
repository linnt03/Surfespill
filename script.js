// Henter elementene fra HTML
const surfer = document.getElementById("surfer");
const game = document.getElementById("game");

let gameRunning = true;
let obstacles = [];

// Fart og spawn (blir vanskeligere over tid)
let speed = 5;
let spawnRate = 1500;

// Lanes (posisjoner på skjermen)
const lanes = [50, 200, 350];
let currentLane = 1; // starter i midten

// Score
let score = 0;


// Setter spilleren i riktig lane (opp/ned posisjon)
function updateSurferPosition() {
  surfer.style.bottom = lanes[currentLane] + "px";
}

// Startposisjon
updateSurferPosition();


// Lytter etter piltaster og flytter spilleren mellom lanes
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


// Lager en ny obstacle og plasserer den i tilfeldig lane
function createObstacle() {
  const obs = document.createElement("div");
  obs.classList.add("obstacle");

  let lane = Math.floor(Math.random() * 3);

  obs.style.bottom = lanes[lane] + "px";
  obs.style.left = window.innerWidth + "px";

  game.appendChild(obs);

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


// Stopper spillet når du krasjer
function gameOver() {
  gameRunning = false;

  alert("Game Over! Score:" + Math.floor(score) ) ;
  location.reload();
}


// Hoved-loop som kjører spillet kontinuerlig
function gameLoop() {
  if (!gameRunning) return;

  moveObstacles();
  checkCollision();
  updateScore();
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


// Starter spillet
spawnObstacleLoop();
setInterval(gameLoop, 20);


