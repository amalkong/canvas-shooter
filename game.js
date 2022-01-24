
class Player{
	constructor(x,y, radius, color){
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
	}
	
	draw(){
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		ctx.fillStyle = this.color;
		ctx.fill()
	}
}

class Projectile{
	constructor(x, y, radius, color, velocity){
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
	}
	
	draw(){
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		ctx.fillStyle = this.color;
		ctx.fill()
	}
	
	update(){
		this.draw();
		this.x = this.x + this.velocity.x;
		this.y = this.y + this.velocity.y;
	}
}

class Enemy{
	constructor(x, y, radius, color, velocity){
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
	}
	
	draw(){
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		ctx.fillStyle = this.color;
		ctx.fill()
	}
	
	update(){
		this.draw();
		this.x = this.x + this.velocity.x;
		this.y = this.y + this.velocity.y;
	}
}

class Particle{
	constructor(x, y, radius, color, velocity){
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.color = color;
		this.velocity = velocity;
		this.alpha = 1;
	}
	
	draw(){
		ctx.save();
		ctx.globalAlpha = this.alpha;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
		ctx.fillStyle = this.color;
		ctx.fill()
		ctx.restore()
	}
	
	update(){
		this.draw();
		this.velocity.x *= friction;
		this.velocity.y *= friction;
		this.x = this.x + this.velocity.x;
		this.y = this.y + this.velocity.y;
		this.alpha -= 0.01;
	}
}

function init(){
	player = new Player(x, y, player_size, player_clr);
	projectiles = [];
	particles = [];
	enemies = [];
	score = 0;
	scoreEl.textContent = 0;
	menuScoreEl.textContent = 0;
}

function spawnEnemies(){
	setInterval(()=>{
		const radius = Math.random() * (30 - 4) + 4;
		let x, y;
		if(Math.random() < 0.5){
			x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
			y = Math.random() * canvas.width;
		} else {
			x = Math.random() * canvas.width;
			y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
			
		}
		
		const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
		const angle = Math.atan2(
			((canvas.height / 2) - y), 
			((canvas.width / 2) - x)
		);
		const velocity = {
			x: Math.cos(angle),
			y: Math.sin(angle)
		}
		
		enemies.push(
			new Enemy(x, y, radius, color, velocity)
		)
	}, 1000)
}

function animate(){
	animationId = requestAnimationFrame(animate);
	ctx.fillStyle = "rgba(0, 0, 0, 0.1";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	player.draw();
	
	particles.forEach((particle, particleIndex) => {
		if(particle.alpha <= 0){
			particles.splice(particleIndex, 1)
		} else {
			particle.update();
		}
	});
	
	projectiles.forEach((projectile, projectileIndex) => {
		projectile.update();
		
		// remove projectiles once off screen
		if(
			(projectile.x + projectile.radius) < 0 || 
			(projectile.x - projectile.radius) > canvas.width || 
			(projectile.y + projectile.radius) < 0 || 
			(projectile.y - projectile.radius) > canvas.height 
		){
			setTimeout(()=>{
				projectiles.splice(projectileIndex, 1)
			}, 0)
		}
	});
	
	enemies.forEach((enemy, index) => {
		enemy.update();
		// enemy and player collision detection
		// end of game
		const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
		if((dist - enemy.radius - player.radius) < 1){
			cancelAnimationFrame(animationId);
			menuScoreEl.textContent = score;
			
			gameMenu.style.display = "flex";
		}
		
		projectiles.forEach((projectile, projectileIndex) => {
			const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
			
			// enemy and projectile collision detection
			if((dist - enemy.radius - projectile.radius) < 1){
				for(let i = 0;i < enemy.radius * 2;i++){
					particles.push(
						new Particle(
							projectile.x, 
							projectile.y, 
							Math.random() * 2, 
							enemy.color, 
							{
								x: (Math.random() - 0.5) * (Math.random() * 6), 
								y: (Math.random() - 0.5) * (Math.random() * 6)
							}
						)
					)
				}
				
				if((enemy.radius - 10) > 5){
					score += 100;
					scoreEl.textContent = score;
					
					if(gsap) {
						gsap.to(enemy, {
							radius: enemy.radius - 10
						});
					} else {
						enemy.radius -= 10;
					}
					setTimeout(() => {
						projectiles.splice(projectileIndex, 1)
					}, 0);
				} else {
					score += 250;
					scoreEl.textContent = score;
					
					setTimeout(() => {
						// if collision detected between an enemy and projectile , remove enemy and projectile
						enemies.splice(index, 1);
						projectiles.splice(projectileIndex, 1)
					}, 0);
				}
			}
			
		});
	});
}

const scoreEl = document.getElementById("score-value"),
menuScoreEl = document.getElementById("game-score"),
gameMenu = document.getElementById("game-menu"),
startBtn = document.getElementById("start-button"), 
canvas = document.getElementById("canvas"),
ctx = canvas.getContext("2d");

canvas.width = innerWidth - 1;
canvas.height = innerHeight - 10;

const friction = 0.99, 
x = canvas.width / 2, 
y = canvas.height / 2;

let projectiles = [], 
particles = [], 
enemies = [], 
animationId, 
score = 0, 
player_clr = "white", 
player_size = 10, 
player = new Player(x, y, player_size, player_clr);

addEventListener("click", (e) => {
	const angle = Math.atan2(
		(e.clientY - (canvas.height / 2)), 
		(e.clientX - (canvas.width / 2))
	);
	
	const velocity = {
		x: Math.cos(angle) * 5,
		y: Math.sin(angle) * 5
	}
	
	projectiles.push(
		new Projectile((canvas.width / 2), (canvas.height / 2), 5, "white", velocity)
	)
});

startBtn.addEventListener("click", (e) => {
	gameMenu.style.display = "none"
	init();
	animate();
	spawnEnemies();
});
