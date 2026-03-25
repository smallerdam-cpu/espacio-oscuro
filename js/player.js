/* ============================================================
   SISTEMA DEL JUGADOR
   Player System - Health, Equipment, Stats
   ============================================================ */

class Player {
    constructor(x = 400, y = 300) {
        // Posición
        this.x = x;
        this.y = y;

        // Nave actual
        this.currentShip = CONFIG.ships[0];
        this.ships = [CONFIG.ships[0]]; // Naves poseídas

        // Estadísticas
        this.health = this.currentShip.health;
        this.maxHealth = this.currentShip.health;
        this.level = CONFIG.player.startLevel;
        this.experience = 0;
        this.credits = CONFIG.player.startCredits;
        this.kills = 0;
        this.rank = CONFIG.player.startRank;

        // Equipo
        this.weapons = [CONFIG.weapons[0]]; // Armas poseídas
        this.currentWeapon = CONFIG.weapons[0];
        this.shields = [];
        this.boosters = [];
        this.abilities = [];

        // Movimiento
        this.targetX = this.x;
        this.targetY = this.y;
        this.speed = this.currentShip.speed;
        this.angle = 0;

        // Combate
        this.lastShotTime = 0;
        this.shooting = false;
        this.targetEnemy = null;

        // Habilidades activas
        this.activeDamageBoost = false;
        this.damageBoostTime = 0;
        this.activeShieldBoost = false;
        this.shieldBoostTime = 0;

        // Tamaño
        this.size = 25;
        this.color = '#00ff00';
    }

    // TODO: Implementar sistema de daño con escudos
    // TODO: Agregar animaciones de movimiento
    // TODO: Implementar sistema de buffs y debuffs

    update(deltaTime) {
        // Movimiento hacia el objetivo
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 5) {
            const vx = (dx / distance) * this.speed;
            const vy = (dy / distance) * this.speed;
            this.x += vx;
            this.y += vy;
            this.angle = Math.atan2(dy, dx);
        }

        // Actualizar habilidades activas
        if (this.activeDamageBoost) {
            this.damageBoostTime -= deltaTime;
            if (this.damageBoostTime <= 0) {
                this.activeDamageBoost = false;
            }
        }

        if (this.activeShieldBoost) {
            this.shieldBoostTime -= deltaTime;
            if (this.shieldBoostTime <= 0) {
                this.activeShieldBoost = false;
            }
        }
    }

    // Disparar al enemigo objetivo
    shoot(enemies) {
        const now = Date.now();
        const fireRate = this.currentWeapon.fireRate * 1000;

        if (now - this.lastShotTime > fireRate) {
            if (this.targetEnemy && enemies.includes(this.targetEnemy)) {
                const dx = this.targetEnemy.x - this.x;
                const dy = this.targetEnemy.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 1000) {
                    this.lastShotTime = now;

                    // Calcular daño con bonificación
                    let damage = this.currentWeapon.damage;
                    if (this.activeDamageBoost) {
                        damage *= 1.2; // +20% daño
                    }

                    // Aplicar daño al enemigo
                    this.targetEnemy.takeDamage(damage);

                    return {
                        fromX: this.x,
                        fromY: this.y,
                        toX: this.targetEnemy.x,
                        toY: this.targetEnemy.y,
                        damage: damage
                    };
                }
            }
        }
        return null;
    }

    // Recibir daño
    takeDamage(damage) {
        let finalDamage = damage;

        // Aplicar protección de escudos
        if (this.activeShieldBoost) {
            finalDamage *= 0.85; // -15% daño
        }

        if (this.shields.length > 0) {
            const protection = this.shields[0].protection;
            finalDamage *= (1 - protection);
        }

        this.health -= finalDamage;
        return this.health > 0;
    }

    // Recoger créditos/bonificaciones
    collectReward(reward) {
        this.credits += reward;
        this.experience += reward / 10;

        // Verificar subida de nivel
        const expForLevel = 1000;
        while (this.experience >= expForLevel) {
            this.experience -= expForLevel;
            this.levelUp();
        }
    }

    // Subir de nivel
    levelUp() {
        this.level++;
        this.maxHealth += 10;
        this.health = this.maxHealth;

        // Actualizar rango militar según kills
        this.updateRank();
    }

    // Actualizar rango militar
    updateRank() {
        for (let i = CONFIG.ranks.length - 1; i >= 0; i--) {
            if (this.kills >= CONFIG.ranks[i].minKills) {
                this.rank = CONFIG.ranks[i].name;
                break;
            }
        }
    }

    // Matar enemigo
    killEnemy(enemy) {
        this.kills++;
        this.collectReward(enemy.reward);
        this.updateRank();
    }

    // Cambiar arma actual
    selectWeapon(weaponId) {
        const weapon = this.weapons.find(w => w.id === weaponId);
        if (weapon) {
            this.currentWeapon = weapon;
            return true;
        }
        return false;
    }

    // Agregar arma al inventario
    addWeapon(weapon) {
        if (!this.weapons.find(w => w.id === weapon.id)) {
            this.weapons.push(weapon);
        }
    }

    // Cambiar nave
    selectShip(shipId) {
        const ship = this.ships.find(s => s.id === shipId);
        if (ship) {
            this.currentShip = ship;
            this.maxHealth = ship.health;
            this.health = this.maxHealth;
            this.speed = ship.speed;
            return true;
        }
        return false;
    }

    // Comprar nave
    buyShip(ship) {
        if (this.credits >= ship.price && !this.ships.find(s => s.id === ship.id)) {
            this.credits -= ship.price;
            this.ships.push(ship);
            return true;
        }
        return false;
    }

    // Comprar arma
    buyWeapon(weapon) {
        if (this.credits >= weapon.price && !this.weapons.find(w => w.id === weapon.id)) {
            this.credits -= weapon.price;
            this.addWeapon(weapon);
            return true;
        }
        return false;
    }

    // Comprar escudo
    buyShield(shield) {
        if (this.credits >= shield.price) {
            this.credits -= shield.price;
            this.shields = [shield];
            return true;
        }
        return false;
    }

    // Comprar potenciador
    buyBooster(booster) {
        if (this.credits >= booster.price) {
            this.credits -= booster.price;
            this.boosters = [booster];
            // Aplicar bonificación de velocidad
            const baseSpeed = this.currentShip.speed;
            this.speed = baseSpeed * (1 + booster.speedBoost);
            return true;
        }
        return false;
    }

    // Comprar habilidad
    buyAbility(ability) {
        if (this.credits >= ability.price && !this.abilities.find(a => a.id === ability.id)) {
            this.credits -= ability.price;
            this.abilities.push(ability);
            return true;
        }
        return false;
    }

    // Activar habilidad
    activateAbility(abilityId) {
        const ability = this.abilities.find(a => a.id === abilityId);
        if (ability) {
            if (ability.type === 'damage') {
                this.activeDamageBoost = true;
                this.damageBoostTime = ability.duration;
            } else if (ability.type === 'shield') {
                this.activeShieldBoost = true;
                this.shieldBoostTime = ability.duration;
            }
            return true;
        }
        return false;
    }

    // Dibujar jugador
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Cuerpo de la nave
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.size, 0);
        ctx.lineTo(-this.size, -this.size);
        ctx.lineTo(-this.size * 0.5, 0);
        ctx.lineTo(-this.size, this.size);
        ctx.closePath();
        ctx.fill();

        // Contorno
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Efecto de escudo activo
        if (this.activeShieldBoost) {
            ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 1.5, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();

        // Barra de vida
        const barWidth = 50;
        const barHeight = 5;
        ctx.fillStyle = '#333333';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.size - 15, barWidth, barHeight);

        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.3 ? '#00ff00' : '#ff0000';
        ctx.fillRect(this.x - barWidth / 2, this.y - this.size - 15, barWidth * healthPercent, barHeight);

        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - barWidth / 2, this.y - this.size - 15, barWidth, barHeight);
    }

    // Obtener datos del perfil
    getProfileData() {
        return {
            level: this.level,
            rank: this.rank,
            credits: this.credits,
            kills: this.kills,
            experience: this.experience,
            currentShip: this.currentShip.name,
            health: this.health,
            maxHealth: this.maxHealth
        };
    }
}