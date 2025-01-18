export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 3; 
    this.size = 40;
    this.health = 100;
    this.sprite = new Image();
    this.sprite.src = 'https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Chris_Griffin.png/220px-Chris_Griffin.png';
  }
  
  update(keys, canvas) {
    if (keys['w'] || keys['ArrowUp']) this.y -= this.speed;
    if (keys['s'] || keys['ArrowDown']) this.y += this.speed;
    if (keys['a'] || keys['ArrowLeft']) this.x -= this.speed;
    if (keys['d'] || keys['ArrowRight']) this.x += this.speed;
    
    // Keep player in bounds
    this.x = Math.max(this.size/2, Math.min(canvas.width - this.size/2, this.x));
    this.y = Math.max(this.size/2, Math.min(canvas.height - this.size/2, this.y));
    
    document.getElementById('healthValue').textContent = this.health;
  }
  
  draw(ctx) {
    ctx.drawImage(this.sprite, this.x - this.size/2, this.y - this.size/2, this.size, this.size);
  }
  
  takeDamage(amount) {
    this.health -= amount;
  }
}