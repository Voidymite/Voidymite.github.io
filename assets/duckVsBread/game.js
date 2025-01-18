const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MINI_JUMP_FORCE = -15;  // Higher jump for mini duck
const MOVEMENT_SPEED = 5;
const RUN_MULTIPLIER = 1.8;
const ENEMY_SPEED = 3;
const POINTS_FOR_POWERUP = 100;
const EGG_SPEED = 8;
const BOMB_GRAVITY = 0.3;
const BOMB_BOUNCE = -0.5;

class Game {
  constructor() {
    this.setupMenuHandlers();
    this.effects = [];
    this.eggs = [];
    this.bombs = [];
    this.swords = [];
    this.jumpKeyHeld = false;
    this.throwingEgg = false;
    this.debugMenuVisible = false;
    this.setupDebugMenu();
    
    // Create audio element
    this.backgroundMusic = new Audio('yeah.wav');
    this.backgroundMusic.loop = true;
  }

  cleanup() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.enemySpawnInterval) {
      clearInterval(this.enemySpawnInterval);
    }
    
    // Stop music
    this.backgroundMusic.pause();
    this.backgroundMusic.currentTime = 0;
    
    this.enemies?.forEach(enemy => enemy.element.remove());
    this.platforms?.forEach(platform => platform.element.remove());
    this.powerups?.forEach(powerup => powerup.element.remove());
    this.effects?.forEach(effect => effect.element.remove());
    this.eggs?.forEach(egg => egg.element.remove());
    this.bombs?.forEach(bomb => bomb.element.remove());
    this.swords?.forEach(sword => sword.element.remove());
    this.effects = [];
    this.eggs = [];
    this.bombs = [];
    this.swords = [];
    
    document.removeEventListener('keydown', this.keydownHandler);
    document.removeEventListener('keyup', this.keyupHandler);
  }

  init() {
    this.player = document.getElementById('player');
    this.gameContainer = document.getElementById('game');
    this.scoreElement = document.getElementById('score-value');
    this.nextPowerupElement = document.getElementById('next-powerup');
    this.finalScoreElement = document.getElementById('final-score');
    this.gameOverScreen = document.getElementById('game-over');
    this.restartButton = document.getElementById('restart-button');
    this.powerupTimer = document.getElementById('powerup-timer');
    this.powerupTimerIcon = document.getElementById('powerup-timer-icon');
    this.powerupTimeLeft = document.getElementById('powerup-time-left');
    
    this.playerState = {
      x: 50,
      y: 0,
      velocityY: 0,
      velocityX: 0,
      canJump: true,
      doubleJumpAvailable: true,
      score: 0,
      powerup: null,
      powerupTimeLeft: 0
    };

    this.enemies = [];
    this.platforms = [];
    this.powerups = [];
    this.keys = {};
    this.gameActive = true;
    this.animationFrameId = null;
    this.enemySpawnInterval = null;
    this.lastPowerupScore = 0;
    this.eggs = [];
    this.bombs = [];
    this.swords = [];
  }

  setupMenuHandlers() {
    const playButton = document.getElementById('play-button');
    const manualButton = document.getElementById('manual-button');
    const backButton = document.getElementById('back-button');
    const menuButton = document.getElementById('menu-button');
    const titleScreen = document.getElementById('title-screen');
    const manual = document.getElementById('manual');
    const gameElement = document.getElementById('game');

    playButton.addEventListener('click', () => {
      titleScreen.classList.add('hidden');
      gameElement.classList.remove('hidden');
      this.init();
      this.setupEventListeners();
      this.startGame();
    });

    manualButton.addEventListener('click', () => {
      titleScreen.classList.add('hidden');
      manual.classList.remove('hidden');
    });

    backButton.addEventListener('click', () => {
      manual.classList.add('hidden');
      titleScreen.classList.remove('hidden');
    });

    menuButton.addEventListener('click', () => {
      this.cleanup();
      gameElement.classList.add('hidden');
      this.gameOverScreen.classList.add('hidden');
      titleScreen.classList.remove('hidden');
    });
  }

  setupEventListeners() {
    this.keydownHandler = (e) => this.keys[e.key] = true;
    this.keyupHandler = (e) => this.keys[e.key] = false;
    
    document.addEventListener('keydown', this.keydownHandler);
    document.addEventListener('keyup', this.keyupHandler);
    this.restartButton.addEventListener('click', () => this.restartGame());
  }

  startGame() {
    this.generatePlatforms();
    this.gameLoop();
    this.enemySpawnLoop();
    // Start playing music
    this.backgroundMusic.play();
  }

  restartGame() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.enemySpawnInterval) {
      clearInterval(this.enemySpawnInterval);
    }
    
    this.enemies.forEach(enemy => enemy.element.remove());
    this.platforms.forEach(platform => platform.element.remove());
    this.powerups.forEach(powerup => powerup.element.remove());
    this.enemies = [];
    this.platforms = [];
    this.powerups = [];
    this.effects.forEach(effect => effect.element.remove());
    this.effects = [];
    this.eggs.forEach(egg => egg.element.remove());
    this.eggs = [];
    this.bombs.forEach(bomb => bomb.element.remove());
    this.bombs = [];
    this.swords.forEach(sword => sword.element.remove());
    this.swords = [];
    
    this.playerState = {
      x: 50,
      y: 0,
      velocityY: 0,
      velocityX: 0,
      canJump: true,
      doubleJumpAvailable: true,
      score: 0,
      powerup: null,
      powerupTimeLeft: 0
    };
    
    this.lastPowerupScore = 0;
    this.gameOverScreen.classList.add('hidden');
    this.scoreElement.textContent = '0';
    this.gameActive = true;
    
    this.startGame();
  }

  generatePlatforms() {
    const platformPositions = [
      { x: 0, y: 380, width: 800 },  // Ground
      { x: 200, y: 280, width: 200 },
      { x: 400, y: 180, width: 200 },
      { x: 100, y: 100, width: 200 }
    ];

    platformPositions.forEach(pos => {
      const platform = document.createElement('div');
      platform.className = 'platform';
      platform.style.left = `${pos.x}px`;
      platform.style.top = `${pos.y}px`;
      platform.style.width = `${pos.width}px`;
      this.gameContainer.appendChild(platform);
      this.platforms.push({
        element: platform,
        x: pos.x,
        y: pos.y,
        width: pos.width
      });
    });
  }

  spawnEnemy() {
    if (!this.gameActive) return;
    
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    const startFromRight = Math.random() > 0.5;
    const x = startFromRight ? 800 : -30;
    const y = Math.random() * 300;
    enemy.style.left = `${x}px`;
    enemy.style.top = `${y}px`;
    this.gameContainer.appendChild(enemy);
    this.enemies.push({
      element: enemy,
      x,
      y,
      direction: startFromRight ? -1 : 1
    });
  }

  enemySpawnLoop() {
    this.enemySpawnInterval = setInterval(() => this.spawnEnemy(), 2000);
  }

  spawnPowerup() {
    const powerupTypes = ['flamethrower', 'eat', 'fan', 'eggs', 'mini', 'bomb', 'sword'];
    const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
    
    const powerup = document.createElement('div');
    powerup.className = `powerup ${type}`;
    
    const x = Math.random() * (800 - 30);
    const y = Math.random() * (400 - 30);
    
    powerup.style.left = `${x}px`;
    powerup.style.top = `${y}px`;
    
    this.gameContainer.appendChild(powerup);
    
    this.powerups.push({
      element: powerup,
      x,
      y,
      type
    });
  }

  applyPowerupEffect(type) {
    this.playerState.powerup = type;
    this.playerState.powerupTimeLeft = 10 * 60; // 10 seconds at 60fps
    
    // Show and update powerup timer
    this.powerupTimer.classList.remove('hidden');
    this.powerupTimerIcon.textContent = type === 'flamethrower' ? '🔥' : 
                                      type === 'eat' ? '🍽️' : 
                                      type === 'fan' ? '💨' : 
                                      type === 'eggs' ? '🥚' : 
                                      type === 'bomb' ? '💣' : 
                                      type === 'sword' ? '⚔️' : '🐤';
    
    if (type === 'flamethrower') {
      // Destroy enemies in front of the player
      this.enemies.forEach((enemy, index) => {
        if (Math.abs(enemy.x - this.playerState.x) < 200 &&
            Math.abs(enemy.y - this.playerState.y) < 100) {
          enemy.element.remove();
          this.enemies.splice(index, 1);
          this.playerState.score += 20;
          this.scoreElement.textContent = this.playerState.score;
        }
      });
    }
    if (type === 'mini') {
      this.player.classList.add('mini');
      if (this.player.style.transform === 'scaleX(-1)') {
        this.player.classList.add('mini-flip');
      }
    }
  }

  checkPowerupCollisions() {
    this.powerups.forEach((powerup, index) => {
      if (this.playerState.x < powerup.x + 30 &&
          this.playerState.x + 40 > powerup.x &&
          this.playerState.y < powerup.y + 30 &&
          this.playerState.y + 40 > powerup.y) {
        this.applyPowerupEffect(powerup.type);
        powerup.element.remove();
        this.powerups.splice(index, 1);
      }
    });
  }

  checkCollisions() {
    if (!this.gameActive) return;

    // Platform collisions
    let onPlatform = false;
    const playerRect = {
      x: this.playerState.x,
      y: this.playerState.y,
      width: 40,
      height: 40
    };

    this.platforms.forEach(platform => {
      if (this.playerState.velocityY >= 0 &&
          playerRect.x < platform.x + platform.width &&
          playerRect.x + playerRect.width > platform.x &&
          playerRect.y + playerRect.height >= platform.y &&
          playerRect.y < platform.y) {
        this.playerState.y = platform.y - playerRect.height;
        this.playerState.velocityY = 0;
        this.playerState.canJump = true;
        this.playerState.doubleJumpAvailable = true;
        onPlatform = true;
      }
    });

    // Enemy collisions
    this.enemies.forEach((enemy, index) => {
      if (this.playerState.x < enemy.x + 30 &&
          this.playerState.x + 40 > enemy.x &&
          this.playerState.y < enemy.y + 30 &&
          this.playerState.y + 40 > enemy.y) {
        if (this.playerState.powerup === 'eat') {
          enemy.element.remove();
          this.enemies.splice(index, 1);
          this.playerState.score += 30;
          this.scoreElement.textContent = this.playerState.score;
        } else {
          this.gameOver();
        }
      }
    });

    this.checkPowerupCollisions();

    if (!onPlatform && this.playerState.velocityY === 0) {
      this.playerState.velocityY = GRAVITY;
    }
  }

  gameOver() {
    this.gameActive = false;
    if (this.enemySpawnInterval) {
      clearInterval(this.enemySpawnInterval);
    }
    // Stop music
    this.backgroundMusic.pause();
    this.backgroundMusic.currentTime = 0;
    
    this.finalScoreElement.textContent = this.playerState.score;
    this.gameOverScreen.classList.remove('hidden');
  }

  createFlameEffect() {
    const flame = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    flame.setAttribute("class", "effect flame");
    flame.setAttribute("width", "100");
    flame.setAttribute("height", "40");
    flame.style.position = "absolute";
    
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "#ff4400");
    path.setAttribute("d", "M5,20 Q25,5 45,20 T85,20");
    flame.appendChild(path);
    
    return flame;
  }

  createWindEffect() {
    const wind = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    wind.setAttribute("class", "effect wind");
    wind.setAttribute("width", "80");
    wind.setAttribute("height", "20");
    wind.style.position = "absolute";
    
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "rgba(255,255,255,0.8)");
    path.setAttribute("stroke-width", "3");
    path.setAttribute("d", "M5,10 Q20,5 35,10 T65,10");
    wind.appendChild(path);
    
    return wind;
  }

  findNearestEnemy() {
    if (!this.enemies.length) return null;
    
    let nearestEnemy = null;
    let shortestDistance = Infinity;
    
    this.enemies.forEach(enemy => {
      const dx = enemy.x - this.playerState.x;
      const dy = enemy.y - this.playerState.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestEnemy = enemy;
      }
    });
    
    return nearestEnemy;
  }

  throwEgg() {
    const nearestEnemy = this.findNearestEnemy();
    if (!nearestEnemy) return;

    const egg = document.createElement('div');
    egg.className = 'egg';
    egg.style.left = `${this.playerState.x + 20}px`;
    egg.style.top = `${this.playerState.y + 20}px`;
    this.gameContainer.appendChild(egg);

    const dx = nearestEnemy.x - this.playerState.x;
    const dy = nearestEnemy.y - this.playerState.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const vx = (dx / distance) * EGG_SPEED;
    const vy = (dy / distance) * EGG_SPEED;

    this.eggs.push({
      element: egg,
      x: this.playerState.x + 20,
      y: this.playerState.y + 20,
      vx: vx,
      vy: vy,
      target: nearestEnemy
    });
  }

  createExplosionEffect(x, y) {
    const explosion = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    explosion.setAttribute("class", "effect explosion");
    explosion.setAttribute("width", "100");
    explosion.setAttribute("height", "100");
    explosion.style.position = "absolute";
    explosion.style.left = `${x - 50}px`;
    explosion.style.top = `${y - 50}px`;
    
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "50");
    circle.setAttribute("cy", "50");
    circle.setAttribute("r", "45");
    circle.setAttribute("fill", "orange");
    
    explosion.appendChild(circle);
    this.gameContainer.appendChild(explosion);
    
    this.effects.push({
      element: explosion,
      timeLeft: 30
    });
  }

  spawnBomb() {
    const bomb = document.createElement('div');
    bomb.className = 'bomb';
    bomb.style.left = `${this.playerState.x + 20}px`;
    bomb.style.top = `${this.playerState.y}px`;
    this.gameContainer.appendChild(bomb);

    this.bombs.push({
      element: bomb,
      x: this.playerState.x + 20,
      y: this.playerState.y,
      velocityY: 0,
      velocityX: this.player.style.transform === 'scaleX(-1)' ? 5 : -5
    });
  }

  throwSword() {
    const sword = document.createElement('img');
    sword.src = 'Diamon-Sword.gif';
    sword.className = 'sword';
    sword.style.left = `${this.playerState.x + 20}px`;
    sword.style.top = `${this.playerState.y + 20}px`;
    this.gameContainer.appendChild(sword);

    const direction = this.player.style.transform === 'scaleX(-1)' ? 1 : -1;
    this.swords.push({
      element: sword,
      x: this.playerState.x + 20,
      y: this.playerState.y + 20,
      velocityX: direction * 10
    });
  }

  checkBombCollisions() {
    this.bombs.forEach((bomb, bombIndex) => {
      // Check for bread collisions
      this.enemies.forEach((enemy, enemyIndex) => {
        if (Math.abs(bomb.x - enemy.x) < 30 && Math.abs(bomb.y - enemy.y) < 30) {
          // Create explosion effect
          this.createExplosionEffect(bomb.x, bomb.y);
          
          // Remove the bomb
          bomb.element.remove();
          this.bombs.splice(bombIndex, 1);
          
          // Remove the enemy
          enemy.element.remove();
          this.enemies.splice(enemyIndex, 1);
          
          this.playerState.score += 20;
          this.scoreElement.textContent = this.playerState.score;
        }
      });

      // Check for platform collisions
      this.platforms.forEach(platform => {
        if (bomb.x < platform.x + platform.width &&
            bomb.x + 20 > platform.x &&
            bomb.y + 20 > platform.y &&
            bomb.y < platform.y + 20) {
          bomb.y = platform.y - 20;
          bomb.velocityY *= BOMB_BOUNCE;
        }
      });
    });
  }

  update() {
    if (!this.gameActive) return;

    // Update next powerup display
    const nextPowerupScore = Math.ceil((this.lastPowerupScore + POINTS_FOR_POWERUP) / POINTS_FOR_POWERUP) * POINTS_FOR_POWERUP;
    this.nextPowerupElement.textContent = `Next powerup: ${nextPowerupScore} points`;

    // Check if we should spawn a powerup
    if (Math.floor(this.playerState.score / POINTS_FOR_POWERUP) > 
        Math.floor(this.lastPowerupScore / POINTS_FOR_POWERUP)) {
      this.spawnPowerup();
      this.lastPowerupScore = this.playerState.score;
    }

    // Update powerup timer display
    if (this.playerState.powerupTimeLeft > 0) {
      const secondsLeft = Math.ceil(this.playerState.powerupTimeLeft / 60);
      this.powerupTimeLeft.textContent = secondsLeft + 's';
      this.playerState.powerupTimeLeft--;
      if (this.playerState.powerupTimeLeft === 0) {
        this.playerState.powerup = null;
        this.powerupTimer.classList.add('hidden');
        if (this.playerState.powerup === 'mini') {
          this.player.classList.remove('mini', 'mini-flip');
        }
      }
    }

    // Clean up old effects
    this.effects = this.effects.filter(effect => {
      if (effect.timeLeft <= 0) {
        effect.element.remove();
        return false;
      }
      effect.timeLeft--;
      return true;
    });

    // Update eggs
    this.eggs = this.eggs.filter(egg => {
      egg.x += egg.vx;
      egg.y += egg.vy;
      egg.element.style.left = `${egg.x}px`;
      egg.element.style.top = `${egg.y}px`;

      // Check for collision with target enemy
      if (egg.target && 
          Math.abs(egg.x - egg.target.x) < 30 &&
          Math.abs(egg.y - egg.target.y) < 30) {
        // Remove both egg and enemy
        egg.element.remove();
        const enemyIndex = this.enemies.indexOf(egg.target);
        if (enemyIndex !== -1) {
          egg.target.element.remove();
          this.enemies.splice(enemyIndex, 1);
          this.playerState.score += 20;
          this.scoreElement.textContent = this.playerState.score;
        }
        return false;
      }

      // Remove eggs that go off screen
      if (egg.x < -50 || egg.x > 850 || egg.y < -50 || egg.y > 450) {
        egg.element.remove();
        return false;
      }

      return true;
    });

    // Update bombs
    this.bombs = this.bombs.filter(bomb => {
      bomb.velocityY += BOMB_GRAVITY;
      bomb.y += bomb.velocityY;
      bomb.x += bomb.velocityX;
      
      bomb.element.style.left = `${bomb.x}px`;
      bomb.element.style.top = `${bomb.y}px`;
      
      // Remove bombs that go off screen
      if (bomb.x < -50 || bomb.x > 850 || bomb.y > 450) {
        bomb.element.remove();
        return false;
      }
      
      return true;
    });

    this.checkBombCollisions();

    // Update swords
    this.swords = this.swords.filter(sword => {
      sword.x += sword.velocityX;
      sword.element.style.left = `${sword.x}px`;

      // Check for collisions with enemies
      this.enemies.forEach((enemy, enemyIndex) => {
        if (Math.abs(sword.x - enemy.x) < 100 && 
            Math.abs(sword.y - enemy.y) < 100) {
          enemy.element.remove();
          this.enemies.splice(enemyIndex, 1);
          this.playerState.score += 20;
          this.scoreElement.textContent = this.playerState.score;
        }
      });

      // Remove swords that go off screen
      if (sword.x < -100 || sword.x > 900) {
        sword.element.remove();
        return false;
      }
      return true;
    });

    // Player movement
    if (this.keys['ArrowLeft'] || this.keys['a']) {
      this.playerState.velocityX = -MOVEMENT_SPEED * (this.keys['Shift'] ? RUN_MULTIPLIER : 1);
      if (this.playerState.powerup === 'mini') {
        this.player.classList.remove('mini-flip');
        this.player.classList.add('mini');
      } else {
        this.player.style.transform = 'scaleX(1)';
      }
    } else if (this.keys['ArrowRight'] || this.keys['d']) {
      this.playerState.velocityX = MOVEMENT_SPEED * (this.keys['Shift'] ? RUN_MULTIPLIER : 1);
      if (this.playerState.powerup === 'mini') {
        this.player.classList.remove('mini');
        this.player.classList.add('mini-flip');
      } else {
        this.player.style.transform = 'scaleX(-1)';
      }
    } else {
      this.playerState.velocityX = 0;
    }

    // Update enemies
    this.enemies.forEach((enemy, index) => {
      let speed = ENEMY_SPEED;
      if (this.playerState.powerup === 'fan') {
        const distance = Math.abs(enemy.x - this.playerState.x);
        if (distance < 200) {
          enemy.direction = enemy.x < this.playerState.x ? -1 : 1;
          speed = ENEMY_SPEED * 2;
        }
      }
      
      enemy.x += speed * enemy.direction;
      enemy.element.style.left = `${enemy.x}px`;
      
      if (enemy.x < -50 || enemy.x > 850) {
        enemy.element.remove();
        this.enemies.splice(index, 1);
        this.playerState.score += 10;
        this.scoreElement.textContent = this.playerState.score;
      }
    });

    // Modified powerup logic to require holding X
    if (this.playerState.powerup && this.keys['x']) {
      if (this.playerState.powerup === 'flamethrower') {
        // Create flame effect
        if (Math.random() < 0.3) {  // Only create effect sometimes to avoid too many elements
          const flame = this.createFlameEffect();
          const facing = this.player.style.transform === 'scaleX(-1)' ? 1 : -1;
          const xOffset = facing === 1 ? 40 : -100;
          flame.style.left = `${this.playerState.x + xOffset}px`;
          flame.style.top = `${this.playerState.y + 10}px`;
          flame.style.transform = `scaleX(${facing})`;
          this.gameContainer.appendChild(flame);
          this.effects.push({ element: flame, timeLeft: 10 });
        }

        this.enemies.forEach((enemy, index) => {
          if (Math.abs(enemy.x - this.playerState.x) < 200 &&
              Math.abs(enemy.y - this.playerState.y) < 100 &&
              ((this.player.style.transform === 'scaleX(-1)' && enemy.x > this.playerState.x) ||
               (this.player.style.transform === 'scaleX(1)' && enemy.x < this.playerState.x))) {
            enemy.element.remove();
            this.enemies.splice(index, 1);
            this.playerState.score += 20;
            this.scoreElement.textContent = this.playerState.score;
          }
        });
      } else if (this.playerState.powerup === 'fan') {
        // Create wind effect
        if (Math.random() < 0.3) {
          const wind = this.createWindEffect();
          const facing = this.player.style.transform === 'scaleX(-1)' ? 1 : -1;
          const xOffset = facing === 1 ? 40 : -80;
          wind.style.left = `${this.playerState.x + xOffset}px`;
          wind.style.top = `${this.playerState.y + 15}px`;
          wind.style.transform = `scaleX(${facing})`;
          this.gameContainer.appendChild(wind);
          this.effects.push({ element: wind, timeLeft: 30 });
        }

        this.enemies.forEach(enemy => {
          const distance = Math.abs(enemy.x - this.playerState.x);
          if (distance < 200) {
            enemy.direction = enemy.x < this.playerState.x ? -1 : 1;
            enemy.x += ENEMY_SPEED * 2 * enemy.direction;
            enemy.element.style.left = `${enemy.x}px`;
          }
        });
      } else if (this.playerState.powerup === 'eggs') {
        // Only throw egg when X is first pressed
        if (!this.throwingEgg) {
          this.throwEgg();
          this.throwingEgg = true;
        }
      } else if (this.playerState.powerup === 'bomb') {
        // Only spawn bomb when X is first pressed
        if (!this.throwingEgg) {  
          this.spawnBomb();
          this.throwingEgg = true;
        }
      } else if (this.playerState.powerup === 'sword') {
        if (!this.throwingEgg) {
          this.throwSword();
          this.throwingEgg = true;
        }
      }
    } else {
      this.throwingEgg = false;
    }

    // Jumping
    if ((this.keys['z'] || this.keys['Z'])) {
      if (this.jumpKeyHeld) {
        // Do nothing while key is being held
      } else {
        if (this.playerState.canJump) {
          this.playerState.velocityY = this.playerState.powerup === 'mini' ? MINI_JUMP_FORCE : JUMP_FORCE;
          this.playerState.canJump = false;
        } else if (this.playerState.doubleJumpAvailable) {
          this.playerState.velocityY = this.playerState.powerup === 'mini' ? MINI_JUMP_FORCE : JUMP_FORCE;
          this.playerState.doubleJumpAvailable = false;
        }
        this.jumpKeyHeld = true;
      }
    } else {
      this.jumpKeyHeld = false;
    }

    // Apply gravity
    this.playerState.velocityY += GRAVITY;

    // Update position
    this.playerState.x += this.playerState.velocityX;
    this.playerState.y += this.playerState.velocityY;

    // Boundary checking
    if (this.playerState.x < 0) this.playerState.x = 0;
    if (this.playerState.x > 760) this.playerState.x = 760;
    if (this.playerState.y > 360) {
      this.playerState.y = 360;
      this.playerState.velocityY = 0;
      this.playerState.canJump = true;
      this.playerState.doubleJumpAvailable = true;
    }

    this.checkCollisions();
    
    // Update player position
    this.player.style.left = `${this.playerState.x}px`;
    this.player.style.top = `${this.playerState.y}px`;
  }

  setupDebugMenu() {
    const debugMenu = document.createElement('div');
    debugMenu.id = 'debug-menu';
    debugMenu.className = 'hidden';
    debugMenu.innerHTML = `
      <h3>Debug Menu</h3>
      <div class="debug-buttons">
        <button data-powerup="flamethrower">🔥 Spawn Flamethrower</button>
        <button data-powerup="eat">🍽️ Spawn Eat Power</button>
        <button data-powerup="fan">💨 Spawn Fan</button>
        <button data-powerup="eggs">🥚 Spawn Eggs</button>
        <button data-powerup="mini">🐤 Spawn Mini Duck</button>
        <button data-powerup="bomb">💣 Spawn Bombs</button>
        <button data-powerup="sword">⚔️ Spawn Sword</button>
      </div>
    `;
    document.body.appendChild(debugMenu);

    // Add click handlers for debug buttons
    debugMenu.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => {
        const type = button.dataset.powerup;
        const powerup = document.createElement('div');
        powerup.className = `powerup ${type}`;
        powerup.style.left = `${this.playerState.x}px`;
        powerup.style.top = `${this.playerState.y - 50}px`;
        this.gameContainer.appendChild(powerup);
        this.powerups.push({
          element: powerup,
          x: this.playerState.x,
          y: this.playerState.y - 50,
          type
        });
      });
    });

    // Add key handler for debug menu toggle
    document.addEventListener('keydown', (e) => {
      if (e.key === '7') {
        this.debugMenuVisible = !this.debugMenuVisible;
        debugMenu.classList.toggle('hidden');
      }
    });
  }

  gameLoop() {
    this.update();
    this.animationFrameId = requestAnimationFrame(() => this.gameLoop());
  }
}

new Game();