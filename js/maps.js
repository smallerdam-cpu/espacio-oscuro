/* ============================================================
   SISTEMA DE MAPAS
   Maps System - Portals, Safe Zones, Navigation
   ============================================================ */

class Portal {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.targetMap = config.targetMap;
        this.name = config.name;
        this.radius = 40;
        this.color = '#00ffff';
    }

    // Dibujar portal
    draw(ctx) {
        // Glow de portal
        ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Portal principal
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Contorno
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Nombre del portal
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.x, this.y + this.radius + 20);
    }

    // Verificar si el jugador está dentro del portal
    isPlayerInside(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius;
    }
}

class Map {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.width = config.width;
        this.height = config.height;
        this.enemies = config.enemies;
        this.portals = config.portals.map(p => new Portal(p));
        this.isSafeZone = config.isSafeZone || false;

        // Fondo del mapa
        this.backgroundColor = this.isSafeZone ? '#0a1a0a' : '#0a0e27';
    }

    // TODO: Implementar tile-based mapping
    // TODO: Agregar obstáculos y pared límites
    // TODO: Implementar efectos visuales dinámicos del mapa

    update() {
        // Actualizar efectos de mapa
    }

    draw(ctx, cameraX, cameraY, viewportWidth, viewportHeight) {
        // Fondo del mapa
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(0, 0, viewportWidth, viewportHeight);

        // Grid de referencia (opcional)
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.05)';
        ctx.lineWidth = 1;
        const gridSize = 100;

        for (let x = -cameraX; x < viewportWidth; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, viewportHeight);
            ctx.stroke();
        }

        for (let y = -cameraY; y < viewportHeight; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(viewportWidth, y);
            ctx.stroke();
        }

        // Limites del mapa
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.strokeRect(-cameraX, -cameraY, this.width, this.height);

        // Dibujar portales
        for (const portal of this.portals) {
            portal.draw(ctx);
        }

        // Indicadores de zona segura
        if (this.isSafeZone) {
            ctx.fillStyle = 'rgba(0, 255, 0, 0.05)';
            ctx.fillRect(-cameraX, -cameraY, this.width, this.height);

            ctx.fillStyle = '#00ff00';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('ZONA SEGURA - SIN PVP', this.width / 2 - cameraX, 50);
        }
    }

    getPortalAt(x, y) {
        for (const portal of this.portals) {
            if (portal.isPlayerInside({ x, y })) {
                return portal;
            }
        }
        return null;
    }
}

class MapManager {
    constructor() {
        this.maps = {};
        this.currentMapId = 'map1';
        this.currentMap = null;

        // Crear todos los mapas
        for (const mapConfig of CONFIG.maps) {
            this.maps[mapConfig.id] = new Map(mapConfig);
        }

        this.currentMap = this.maps[this.currentMapId];
    }

    // Cambiar de mapa
    changeMap(mapId) {
        if (this.maps[mapId]) {
            this.currentMapId = mapId;
            this.currentMap = this.maps[mapId];
            return true;
        }
        return false;
    }

    // Obtener mapa actual
    getCurrentMap() {
        return this.currentMap;
    }

    // Obtener ID de mapa actual
    getCurrentMapId() {
        return this.currentMapId;
    }

    // Verificar si mapa actual es zona segura
    isCurrentMapSafeZone() {
        return this.currentMap.isSafeZone;
    }

    // Dibujar mapa actual
    draw(ctx, cameraX, cameraY, viewportWidth, viewportHeight) {
        this.currentMap.draw(ctx, cameraX, cameraY, viewportWidth, viewportHeight);
    }

    // Actualizar mapa actual
    update() {
        this.currentMap.update();
    }
}