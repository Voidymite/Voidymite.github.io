export class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.speed = 10;
    this.size = 5;
    this.angle = angle;
  }
  
  update() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
  }
  
  draw(ctx) {
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  isOffscreen(canvas) {
    return this.x < 0 || this.x > canvas.width || 
           this.y < 0 || this.y > canvas.height;
  }
  
  checkCollision(entity) {
    const dx = this.x - entity.x;
    const dy = this.y - entity.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (this.size + entity.size/2);
  }
}