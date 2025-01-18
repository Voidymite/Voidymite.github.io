export class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 30;
    this.speed = 1; // Reduced from 2
  }
  
  update(player) {
    const angle = Math.atan2(player.y - this.y, player.x - this.x);
    this.x += Math.cos(angle) * this.speed;
    this.y += Math.sin(angle) * this.speed;
  }
  
  draw(ctx) {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size/2, 0, Math.PI * 2);
    ctx.fill();
  }
  
  checkCollision(entity) {
    const dx = this.x - entity.x;
    const dy = this.y - entity.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (this.size/2 + entity.size/2);
  }
}