/* ============================================================
   SISTEMA DE ENEMIGOS
   Enemies System - AI, Combat, Behavior
   ============================================================ */

class Enemy {
    constructor(config, x, y) {
        this.id = config.id;
        this.name = config.name;
        this.health = config.health;
        this.maxHealth = config.health;
        this.damage = config.damage;
        this.speed = config.speed;
        this.reward = config.reward;
        this.visionRange = config.visionRange;
        this.size = config.size;

        // Posición
        this.x = x;
        this.y = y;
        this.angle = 0;

        // Estado
        this.state = 'idle'; // idle, chase, attack, flee
        this.targetPlayer = null;
        this.vx = 0;
        this.vy = 0;
        this.lastAttackTime = 0;
        this.color = '#ff6600';

        // Para patrulla
        this.patrolTarget = { x: x, y: y };
        this.updatePatrolTarget();
    }

    // TODO: Implementar IA más avanzada
    // TODO: Agregar comportamientos de grupo
    // TODO: Implementar patrones de ataque especiales para bosses

    update(deltaTime, player, mapWidth, mapHeight) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Verificar si jugador está en rango de visión
        if (distance < this.visionRange) {
            this.state = 'chase';
            this.targetPlayer = player;
        } else {
            this.state = 'idle';
            this.targetPlayer = null;
        }

        // Comportamiento según estado
        if (this.state === 'chase') {
            this.chase(player);
        } else if (this.state === 'idle') {
            this.patrol();
        } else if (this.state === 'flee') {
            this.flee(player);
        }

        // Si está muy dañado, huir
        if (this.health / this.maxHealth < 0.2) {
            this.state = 'flee';
            this.flee(player);
        }

        // Aplicar movimiento
        this.x += this.vx * this.speed;
        this.y += this.vy * this.speed;

        // Limites del mapa
        if (this.health <= 0) {
            return false; // Enemigo muerto
        }

        // Salir del mapa cuando está muy dañado
        if (this.health / this.maxHealth < 0.1 && (this.x < -100 || this.x > mapWidth + 100 || this.y < -100 || this.y > mapHeight + 100)) {
            return false;
        }

        return true;
    }

    // Perseguir al jugador
    chase(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.vx = dx / distance;
            this.vy = dy / distance;
            this.angle = Math.atan2(dy, dx);
        }
    }

    // Patrullar
    patrol() {
        const dx = this.patrolTarget.x - this.x;
        const dy = this.patrolTarget.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 50) {
            this.updatePatrolTarget();
        } else {
            this.vx = dx / distance * 0.5;
            this.vy = dy / distance * 0.5;
        }
    }

    // Huir del jugador
    flee(player) {
        const dx = this.x - player.x;
        const dy = this.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.vx = (dx / distance) * 1.5;
            this.vy = (dy / distance) * 1.5;
        }
    }

    // Actualizar objetivo de patrulla
    updatePatrolTarget() {
        this.patrolTarget = {
            x: this.x + (Math.random() - 0.5) * 400,
            y: this.y + (Math.random() - 0.5) * 400
        };
    }

    // Recibir daño
    takeDamage(damage) {
        this.health -= damage;
        return this.health > 0;
    }

    // Atacar al jugador
    attack(player) {
        const now = Date.now();
        if (now - this.lastAttackTime > 1000) {
            this.lastAttackTime = now;
            player.takeDamage(this.damage);
            return true;
        }
        return false;
    }

    // Dibujar enemigo
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Cuerpo del enemigo
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.size, 0);
        ctx.lineTo(-this.size, -this.size);
        ctx.lineTo(-this.size * 0.5, 0);
        ctx.lineTo(-this.size, this.size);
        ctx.closePath();
        ctx.fill();

        // Contorno
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();

        // Barra de vida
        const barWidth = this.size * 2;
        const barHeight = 4;
        ctx.fillStyle = '#333333';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.size - 10, barWidth, barHeight);

        const healthPercent = this.health / this.maxHealth;
        const healthColor = healthPercent > 0.5 ? '#ff6600' : healthPercent > 0.2 ? '#ffaa00' : '#ff0000';
        ctx.fillStyle = healthColor;
        ctx.fillRect(this.x - barWidth / 2, this.y - this.size - 10, barWidth * healthPercent, barHeight);

        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - barWidth / 2, this.y - this.size - 10, barWidth, barHeight);

        // Nombre del enemigo
        ctx.fillStyle = '#ffff00';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.x, this.y - this.size - 20);
    }
}

// Gestor de enemigos
class EnemyManager {
    constructor() {
        this.enemies = [];
        this.spawnRate = 3000; // ms entre spawns
        this.lastSpawnTime = 0;
    }

    // TODO: Implementar waves de enemigos
    // TODO: Agregar spawn dinámico según dificultad
    // TODO: Implementar limpieza de recursos

    update(deltaTime, player, mapWidth, mapHeight) {
        // Actualizar enemigos existentes
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const isAlive = enemy.update(deltaTime, player, mapWidth, mapHeight);

            if (!isAlive) {
                this.enemies.splice(i, 1);
            }
        }

        // Generar nuevos enemigos
        const now = Date.now();
        if (now - this.lastSpawnTime > this.spawnRate && this.enemies.length < 10) {
            this.spawnEnemy(mapWidth, mapHeight);
            this.lastSpawnTime = now;
        }
    }

    // Generar enemigo
    spawnEnemy(mapWidth, mapHeight) {
        // Seleccionar tipo de enemigo aleatorio
        const enemyTypes = CONFIG.enemies.slice(0, 4); // Excluir boss por ahora
        const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];

        // Posición aleatoria
        const x = Math.random() * mapWidth;
        const y = Math.random() * mapHeight;

        const enemy = new Enemy(randomType, x, y);
        this.enemies.push(enemy);
    }

    // Spawnear jefe
    spawnBoss(x, y) {
        const boss = new Enemy(CONFIG.enemies[4], x, y);
        this.enemies.push(boss);
    }

    // Dibujar todos los enemigos
    draw(ctx) {
        for (const enemy of this.enemies) {
            enemy.draw(ctx);
        }
    }

    // Detectar colisiones con jugador
    checkCollisions(player) {
        for (const enemy of this.enemies) {
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < player.size + enemy.size) {
                enemy.attack(player);
            }

            // Disparos del jugador golpean al enemigo
            const playerVisionRange = 1000;
            if (distance < playerVisionRange && player.targetEnemy === null) {
                player.targetEnemy = enemy;
            }
        }
    }

    // Obtener enemigo objetivo más cercano
    getNearestEnemy(player) {
        let nearest = null;
        let minDistance = Infinity;

        for (const enemy of this.enemies) {
            const dx = enemy.x - player.x;
            const dy = enemy.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < minDistance) {
                minDistance = distance;
                nearest = enemy;
            }
        }

        return nearest;
    }
}