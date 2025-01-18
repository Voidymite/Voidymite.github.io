import { Player } from './player.js';
import { Enemy } from './enemy.js';
import { Bullet } from './bullet.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 800;
    this.canvas.height = 600;
    
    this.player = new Player(400, 300);
    this.enemies = [];
    this.bullets = [];
    this.score = 0;
    
    // Wave system variables
    this.currentWave = 1;
    this.enemiesInWave = 5; 
    this.enemiesSpawned = 0;
    this.waveInProgress = false;
    
    // Pause system
    this.isPaused = false;
    this.pauseBtn = document.getElementById('pauseBtn');
    
    this.keys = {};
    this.setupEventListeners();
    
    this.startNewWave();
    this.gameLoop();
  }
  
  setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.togglePause();
      }
      this.keys[e.key] = true;
    });
    window.addEventListener('keyup', (e) => this.keys[e.key] = false);
    window.addEventListener('click', (e) => {
      if (!this.isPaused && e.target !== this.pauseBtn) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.shoot(x, y);
      }
    });
    
    // Pause button listener
    this.pauseBtn.addEventListener('click', () => this.togglePause());
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    this.pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
    
    if (!this.isPaused) {
      this.gameLoop();
    }
  }
  
  startNewWave() {
    this.waveInProgress = true;
    this.enemiesSpawned = 0;
    this.enemiesInWave = 5 + (this.currentWave - 1) * 2; 
    document.getElementById('waveValue').textContent = this.currentWave;
    
    // Clear any existing spawn interval
    if (this.spawnEnemyInterval) {
      clearInterval(this.spawnEnemyInterval);
    }
    
    // Set up new spawn interval
    this.spawnEnemyInterval = setInterval(() => {
      if (this.enemiesSpawned < this.enemiesInWave) {
        this.spawnEnemy();
        this.enemiesSpawned++;
      } else {
        clearInterval(this.spawnEnemyInterval);
      }
    }, 2000);
  }
  
  shoot(targetX, targetY) {
    const angle = Math.atan2(targetY - this.player.y, targetX - this.player.x);
    this.bullets.push(new Bullet(this.player.x, this.player.y, angle));
  }
  
  spawnEnemy() {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    
    switch(side) {
      case 0: // top
        x = Math.random() * this.canvas.width;
        y = -30;
        break;
      case 1: // right
        x = this.canvas.width + 30;
        y = Math.random() * this.canvas.height;
        break;
      case 2: // bottom
        x = Math.random() * this.canvas.width;
        y = this.canvas.height + 30;
        break;
      case 3: // left
        x = -30;
        y = Math.random() * this.canvas.height;
        break;
    }
    
    this.enemies.push(new Enemy(x, y));
  }
  
  checkWaveComplete() {
    if (this.waveInProgress && this.enemiesSpawned >= this.enemiesInWave && this.enemies.length === 0) {
      this.waveInProgress = false;
      this.currentWave++;
      setTimeout(() => this.startNewWave(), 3000); 
    }
  }
  
  update() {
    if (this.isPaused) return;
    
    if (this.player.health <= 0) {
      alert('Game Over! Score: ' + this.score + '\nWave reached: ' + this.currentWave);
      location.reload();
      return;
    }
    
    this.checkWaveComplete();
    this.player.update(this.keys, this.canvas);
    
    this.enemies.forEach((enemy, idx) => {
      enemy.update(this.player);
      if (enemy.checkCollision(this.player)) {
        this.player.takeDamage(10);
        this.enemies.splice(idx, 1);
      }
    });
    
    this.bullets.forEach((bullet, bulletIdx) => {
      bullet.update();
      
      if (bullet.isOffscreen(this.canvas)) {
        this.bullets.splice(bulletIdx, 1);
        return;
      }
      
      this.enemies.forEach((enemy, enemyIdx) => {
        if (bullet.checkCollision(enemy)) {
          this.score += 10;
          document.getElementById('scoreValue').textContent = this.score;
          this.enemies.splice(enemyIdx, 1);
          this.bullets.splice(bulletIdx, 1);
        }
      });
    });
  }
  
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.player.draw(this.ctx);
    this.enemies.forEach(enemy => enemy.draw(this.ctx));
    this.bullets.forEach(bullet => bullet.draw(this.ctx));
    
    if (this.isPaused) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = 'white';
      this.ctx.font = '48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    }
  }
  
  gameLoop() {
    this.update();
    this.draw();
    if (!this.isPaused) {
      requestAnimationFrame(() => this.gameLoop());
    }
  }
}

new Game();