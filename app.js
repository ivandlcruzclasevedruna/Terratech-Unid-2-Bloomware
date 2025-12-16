// Elementos del DOM
const buttons = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.panel');
const clickSound = document.getElementById('click-sound');
const bgMusic = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const themeSwitch = document.getElementById('theme-switch');
const volumeSlider = document.getElementById('volume-slider');

// Hamburger Menu
const hamburgerBtn = document.getElementById('hamburger-btn');
const dropdownMenu = document.getElementById('dropdown-menu');
const menuItems = document.querySelectorAll('.menu-item');

// Pantalla de inicio
const splashScreen = document.getElementById('splash-screen');
const splashBtn = document.getElementById('splash-btn');
const mainPage = document.getElementById('main-page');

// Lista de canciones (agrega más archivos MP3 aquí)
const playlist = [
  'music/musica1.mp3',
  'music/musica2.mp3',
  'music/musica3.mp3',
  'music/musica4.mp3',
  'music/musica5.mp3',
  // Agrega más canciones aquí (por ejemplo 'music/mi-cancion.mp3')
];

let currentSongIndex = 0;

// Función para crear sonido de clic retro usando Web Audio API
function createRetroClickSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const now = audioContext.currentTime;
  
  // Oscilador para el clic retro
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  
  osc.connect(gain);
  gain.connect(audioContext.destination);
  
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
  
  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
  
  osc.start(now);
  osc.stop(now + 0.1);
}

// Función para reproducir sonido de clic (intenta con Web Audio API primero)
function playClickSound() {
  try {
    createRetroClickSound();
  } catch (e) {
    // Fallback: intenta con elemento audio si existe
    if (clickSound && clickSound.src) {
      clickSound.currentTime = 0;
      clickSound.volume = 0.4;
      clickSound.play().catch(err => console.log('Click sound play error:', err));
    }
  }
}

// Manejo de clics en botones
buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-tab');
    
    // Reproducir sonido de clic retro
    playClickSound();
    
    // Actualizar botones activos
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Mostrar panel activo con transición
    panels.forEach(panel => {
      if (panel.id === target) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });
  });
});

// Reproducir música desde archivo MP3
function playBackgroundMusic() {
  if (playlist.length === 0) {
    console.log('No hay canciones en la lista');
    return;
  }
  
  bgMusic.src = playlist[currentSongIndex];
  bgMusic.volume = 0.3;
  bgMusic.play().catch(err => console.log('Error al reproducir música:', err));
}

function stopBackgroundMusic() {
  bgMusic.pause();
  bgMusic.currentTime = 0;
}

function nextSong() {
  currentSongIndex = (currentSongIndex + 1) % playlist.length;
  if (isPlaying) {
    playBackgroundMusic();
  }
}

function prevSong() {
  currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
  if (isPlaying) {
    playBackgroundMusic();
  }
}

// Cuando termina una canción, pasar a la siguiente
bgMusic.addEventListener('ended', () => {
  nextSong();
});

// Botones Anterior y Siguiente
prevBtn.addEventListener('click', () => {
  playClickSound();
  prevSong();
});

nextBtn.addEventListener('click', () => {
  playClickSound();
  nextSong();
});

// Estado de música
let isPlaying = false;

musicToggle.addEventListener('click', () => {
  playClickSound(); // Sonido de clic al togglear música
  
  if (!isPlaying) {
    // Reproducir música
    playBackgroundMusic();
    isPlaying = true;
    musicToggle.classList.add('playing');
    musicToggle.textContent = '⏸ Música';
  } else {
    // Pausar música
    stopBackgroundMusic();
    isPlaying = false;
    musicToggle.classList.remove('playing');
    musicToggle.textContent = '▶ Música';
  }
});

// Slider de volumen
if (volumeSlider) {
  volumeSlider.addEventListener('input', (e) => {
    const vol = Math.max(0, Math.min(100, Number(e.target.value))) / 100;
    bgMusic.volume = vol;
    localStorage.setItem('musicVolume', vol);
  });
}

// Reproducir música automáticamente al cargar la página (con permiso del navegador)
window.addEventListener('load', () => {
  // Intentar reproducir música automáticamente inmediatamente
  setTimeout(() => {
    // Asegurarnos de que la playlist tiene al menos una canción
    if (playlist.length === 0) return;

    // Seleccionar una canción aleatoria
    currentSongIndex = Math.floor(Math.random() * playlist.length);
    bgMusic.src = playlist[currentSongIndex];

    // Cargar volumen guardado si existe
    const savedVolume = localStorage.getItem('musicVolume');
    const initialVolume = savedVolume !== null ? parseFloat(savedVolume) : 0.3;
    bgMusic.volume = initialVolume;

    // Inicializar slider si existe
    if (volumeSlider) {
      try { volumeSlider.value = Math.round(initialVolume * 100); } catch (e) {}
    }

    // Intentar reproducir y manejar la promesa (autoplay puede fallar)
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        // Reproducción autorizada
        isPlaying = true;
        musicToggle.classList.add('playing');
        musicToggle.textContent = '⏸ Música';
      }).catch((err) => {
        // Autoplay bloqueado: mostrar estado "parado" pero estar listo para reproducir al hacer clic
        console.log('Autoplay bloqueado por el navegador. El usuario deberá iniciar la música.');
        isPlaying = false;
        musicToggle.classList.remove('playing');
        musicToggle.textContent = '▶ Música';
      });
    }
  }, 100);
});

// TOGGLE MODO OSCURO
themeSwitch.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode');
  // Guardar preferencia en localStorage
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('theme', 'dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
});

// Cargar tema guardado al abrir la página
window.addEventListener('load', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeSwitch.checked = true;
  }
});

// SPLASH SCREEN - PANTALLA DE INICIO

// HAMBURGER MENU
hamburgerBtn.addEventListener('click', () => {
  playClickSound();
  hamburgerBtn.classList.toggle('active');
  dropdownMenu.classList.toggle('active');
});

// Menu items - navegación
menuItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    playClickSound();
    
    const target = item.getAttribute('data-tab');
    
    // Cerrar menú después de hacer clic
    hamburgerBtn.classList.remove('active');
    dropdownMenu.classList.remove('active');
    
    // Marcar el botón como activo
    buttons.forEach(btn => {
      if (btn.getAttribute('data-tab') === target) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    // Mostrar el panel correspondiente
    panels.forEach(panel => {
      if (panel.id === target) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });
  });
});

// Cerrar menú cuando se hace clic fuera
document.addEventListener('click', (e) => {
  if (!hamburgerBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
    hamburgerBtn.classList.remove('active');
    dropdownMenu.classList.remove('active');
  }
});

// SNAKE GAME
const snakeCanvas = document.getElementById('snakeCanvas');
const canvasContext = snakeCanvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const startGameBtn = document.getElementById('startGameBtn');
const pauseGameBtn = document.getElementById('pauseGameBtn');
const resetGameBtn = document.getElementById('resetGameBtn');

let gameRunning = false;
let gamePaused = false;
let score = 0;
let gameSpeed = 200;

const gridSize = 20;
const tileCount = snakeCanvas.width / gridSize;

let snake = [
  { x: 10, y: 10 }
];

let food = {
  x: Math.floor(Math.random() * tileCount),
  y: Math.floor(Math.random() * tileCount)
};

let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };

function drawGame() {
  // Limpiar canvas con fondo de red digital
  canvasContext.fillStyle = '#0a2a2a';
  canvasContext.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);
  
  // Dibujar grid de red digital
  canvasContext.strokeStyle = 'rgba(167, 201, 87, 0.08)';
  canvasContext.lineWidth = 0.5;
  for (let i = 0; i <= tileCount; i++) {
    canvasContext.beginPath();
    canvasContext.moveTo(i * gridSize, 0);
    canvasContext.lineTo(i * gridSize, snakeCanvas.height);
    canvasContext.stroke();
    
    canvasContext.beginPath();
    canvasContext.moveTo(0, i * gridSize);
    canvasContext.lineTo(snakeCanvas.width, i * gridSize);
    canvasContext.stroke();
  }
  
  // Dibujar fragmento de energía (comida)
  canvasContext.fillStyle = '#a7c957';
  canvasContext.shadowColor = 'rgba(167, 201, 87, 0.5)';
  canvasContext.shadowBlur = 8;
  canvasContext.fillRect(food.x * gridSize + 2, food.y * gridSize + 2, gridSize - 4, gridSize - 4);
  canvasContext.shadowBlur = 0;
  
  // Dibujar recolector (serpiente biomecánica)
  snake.forEach((segment, index) => {
    if (index === 0) {
      // Cabeza: verde eco
      canvasContext.fillStyle = '#caffbf';
      canvasContext.shadowColor = 'rgba(202, 255, 191, 0.6)';
      canvasContext.shadowBlur = 10;
      canvasContext.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
      canvasContext.shadowBlur = 0;
    } else {
      // Cuerpo: azul eco
      canvasContext.fillStyle = '#90e0ef';
      canvasContext.shadowColor = 'rgba(144, 224, 239, 0.3)';
      canvasContext.shadowBlur = 5;
      canvasContext.fillRect(segment.x * gridSize + 2, segment.y * gridSize + 2, gridSize - 4, gridSize - 4);
      canvasContext.shadowBlur = 0;
    }
  });
}

function updateGame() {
  if (!gameRunning || gamePaused) return;
  
  direction = nextDirection;
  
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  
  // Verificar colisión con límites de la red digital
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    endGame();
    return;
  }
  
  // Verificar colisión con el cuerpo del recolector
  for (let segment of snake) {
    if (head.x === segment.x && head.y === segment.y) {
      endGame();
      return;
    }
  }
  
  snake.unshift(head);
  
  // Verificar si recolectó energía
  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreDisplay.textContent = score;
    playClickSound();
    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } else {
    snake.pop();
  }
  
  drawGame();
}

function gameLoop() {
  updateGame();
  setTimeout(gameLoop, gameSpeed);
}

function startGame() {
  if (!gameRunning) {
    const countdownOverlay = document.getElementById('countdown');
    countdownOverlay.classList.add('show');
    
    let countdown = 3;
    countdownOverlay.textContent = countdown;
    
    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        countdownOverlay.textContent = countdown;
        playClickSound();
      } else {
        clearInterval(countdownInterval);
        countdownOverlay.classList.remove('show');
        
        gameRunning = true;
        gamePaused = false;
        startGameBtn.textContent = 'Jugando...';
        startGameBtn.disabled = true;
        pauseGameBtn.disabled = false;
        pauseGameBtn.textContent = 'Pausar';
        gameLoop();
      }
    }, 1000);
  }
}

function pauseGame() {
  if (gameRunning) {
    gamePaused = !gamePaused;
    pauseGameBtn.textContent = gamePaused ? 'Reanudar' : 'Pausar';
  }
}

function endGame() {
  gameRunning = false;
  startGameBtn.textContent = 'Juego Terminado - Iniciar de Nuevo';
  startGameBtn.disabled = false;
  pauseGameBtn.disabled = true;
  playClickSound();
}

function resetGame() {
  gameRunning = false;
  gamePaused = false;
  score = 0;
  scoreDisplay.textContent = score;
  
  snake = [{ x: 10, y: 10 }];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  
  food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
  };
  
  startGameBtn.textContent = 'Iniciar Juego';
  startGameBtn.disabled = false;
  pauseGameBtn.textContent = 'Pausar';
  pauseGameBtn.disabled = true;
  
  drawGame();
}

// Controles del juego
document.addEventListener('keydown', (e) => {
  if (!gameRunning) return;
  
  switch(e.key.toUpperCase()) {
    case 'ARROWUP':
    case 'W':
      if (direction.y === 0) nextDirection = { x: 0, y: -1 };
      e.preventDefault();
      break;
    case 'ARROWDOWN':
    case 'S':
      if (direction.y === 0) nextDirection = { x: 0, y: 1 };
      e.preventDefault();
      break;
    case 'ARROWLEFT':
    case 'A':
      if (direction.x === 0) nextDirection = { x: -1, y: 0 };
      e.preventDefault();
      break;
    case 'ARROWRIGHT':
    case 'D':
      if (direction.x === 0) nextDirection = { x: 1, y: 0 };
      e.preventDefault();
      break;
  }
});

// Event listeners de botones
startGameBtn.addEventListener('click', startGame);
pauseGameBtn.addEventListener('click', pauseGame);
resetGameBtn.addEventListener('click', resetGame);
pauseGameBtn.disabled = true;

// Dibujar juego inicial
drawGame();



