/* ============================================================
   MOTOR PRINCIPAL DEL JUEGO
   Game Engine - Main Loop, Input, Camera
   ============================================================ */

class GameManager {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.minimapCanvas = document.getElementById('minimapCanvas');

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.player = null;
        this.enemyManager = null;
        this.mapManager = null;
        this.ui = null;

        this.isPaused = false;
        this.lastTime = Date.now();
        this.frameCount = 0;
        this.fps = 0;

        // Input
        this.mouseX = 0;
        this.mouseY = 0;
        this.keysPressed = {};

        this.init();
    }

    // TODO: Implementar sistema de guardado/cargado
    // TODO: Agregar sistema de puntuación
    // TODO: Implementar logros

    init() {
        // Inicializar sistemas
        this.mapManager = new MapManager();
        this.player = new Player(100, 100);
        this.enemyManager = new EnemyManager();
        this.ui = new UIManager();

        this.setupEventListeners();
        this.gameLoop();
    }

    setupEventListeners() {
        // Mouse
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('click', (e) => this.onMouseClick(e));

        // Teclado
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        document.addEventListener('keyup', (e) => this.onKeyUp(e));

        // Redimensionar ventana
        window.addEventListener('resize', () => this.onWindowResize());
    }

    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
    }

    onMouseClick(e) {
        if (this.ui.currentScreen === 'game' && !this.isPaused) {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;

            // Mover jugador al click
            this.player.targetX = clickX;
            this.player.targetY = clickY;

            // Seleccionar enemigo si hace click en uno
            const clickedEnemy = this.getEnemyAtPosition(clickX, clickY);
            if (clickedEnemy) {
                this.player.targetEnemy = clickedEnemy;
            }
        }
    }

    onKeyDown(e) {
        this.keysPressed[e.key] = true;

        // Cambiar arma con números
        if (e.key === '1') selectWeapon(1);
        if (e.key === '2') selectWeapon(2);
        if (e.key === '3') selectWeapon(3);
        if (e.key === '4') selectWeapon(4);

        // Habilidades
        if (e.key === 'e' || e.key === 'E') {
            this.player.activateAbility('ability1');
        }
        if (e.key === 'r' || e.key === 'R') {
            this.player.activateAbility('ability2');
        }
    }

    onKeyUp(e) {
        this.keysPressed[e.key] = false;
    }

    onWindowResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    // Obtener enemigo en posición
    getEnemyAtPosition(x, y) {
        for (const enemy of this.enemyManager.enemies) {
            const dx = enemy.x - x;
            const dy = enemy.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < enemy.size + 10) {
                return enemy;
            }
        }
        return null;
    }

    // Comenzar nuevo juego
    startNewGame() {
        this.mapManager = new MapManager();
        this.player = new Player(100, 100);
        this.enemyManager = new EnemyManager();
        this.isPaused = false;
        this.ui.showGameScreen();
        this.ui.updateHUD(this.player);
        this.ui.updateWeaponUI(this.player);
    }

    // Resetear juego
    reset() {
        this.isPaused = false;
        this.player = null;
        this.enemyManager = null;
        this.mapManager = null;
    }

    // Loop principal
    gameLoop = () => {
        requestAnimationFrame(this.gameLoop);

        const now = Date.now();
        const deltaTime = (now - this.lastTime) / 1000;
        this.lastTime = now;

        this.frameCount++;
        if (this.frameCount % 30 === 0) {
            this.fps = Math.round(1 / deltaTime);
        }

        if (!this.isPaused && this.ui.currentScreen === 'game') {
            this.update(deltaTime);
        }

        this.draw();
    }

    update(deltaTime) {
        // Actualizar jugador
        this.player.update(deltaTime);

        // Actualizar enemigos
        const map = this.mapManager.getCurrentMap();
        this.enemyManager.update(deltaTime, this.player, map.width, map.height);

        // Disparo automático
        const shot = this.player.shoot(this.enemyManager.enemies);

        // Verificar colisiones
        this.enemyManager.checkCollisions(this.player);

        // Eliminar enemigos muertos y dar recompensas
        for (let i = this.enemyManager.enemies.length - 1; i >= 0; i--) {
            if (this.enemyManager.enemies[i].health <= 0) {
                const enemy = this.enemyManager.enemies[i];
                this.player.killEnemy(enemy);

                // Generar bonificación
                this.spawnDrop(enemy.x, enemy.y);

                this.enemyManager.enemies.splice(i, 1);
            }
        }

        // Recoger bonificaciones
        this.checkDropCollisions();

        // Verificar portales
        this.checkPortalCollisions();

        // Actualizar mapa
        this.mapManager.update();

        // Actualizar UI
        this.ui.updateHUD(this.player);

        // Jugador muere
        if (this.player.health <= 0) {
            alert('¡DERROTA! Regresando al menú...');
            this.ui.showMainMenu();
            this.reset();
        }
    }

    // Spawner de bonificaciones
    spawnDrop(x, y) {
        // TODO: Implementar sistema visual de bonificaciones
        // Por ahora, recoger automáticamente
        const drop = CONFIG.drops[Math.floor(Math.random() * CONFIG.drops.length)];
        if (drop.type === 'credits') {
            this.player.credits += drop.amount;
        }
    }

    // Comprobar colisiones con bonificaciones
    checkDropCollisions() {
        // TODO: Implementar colisión visual
    }

    // Comprobar colisiones con portales
    checkPortalCollisions() {
        const map = this.mapManager.getCurrentMap();
        for (const portal of map.portals) {
            if (portal.isPlayerInside(this.player)) {
                // Auto-transportar si está en portal por más de 1 segundo
                // Por ahora, mostrar opción
            }
        }
    }

    draw() {
        // Limpiar canvas
        this.ctx.fillStyle = '#0a0e27';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.ui.currentScreen === 'game') {
            // Calcular posición de cámara (centrada en jugador)
            const cameraX = this.player.x - this.canvas.width / 2;
            const cameraY = this.player.y - this.canvas.height / 2;

            // Aplicar transformación de cámara
            this.ctx.save();
            this.ctx.translate(-cameraX, -cameraY);

            // Dibujar mapa
            this.mapManager.draw(this.ctx, cameraX, cameraY, this.canvas.width, this.canvas.height);

            // Dibujar enemigos
            this.enemyManager.draw(this.ctx);

            // Dibujar jugador
            this.player.draw(this.ctx);

            this.ctx.restore();

            // Dibujar minimap
            if (this.minimapCanvas) {
                this.ui.drawMinimap(this.minimapCanvas, this.player, this.mapManager);
            }

            // Dibujar FPS (debug)
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(`FPS: ${this.fps}`, 10, 30);
        }
    }
}

// Crear instancia global del gestor de juego
let gameManager;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    gameManager = new GameManager();
});