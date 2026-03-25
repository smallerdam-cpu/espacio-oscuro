// js/maps.js

class MapSystem {
    constructor() {
        this.portals = [];
        this.safeZones = [];
        this.sectors = [];
    }

    addPortal(portal) {
        this.portals.push(portal);
    }

    addSafeZone(safeZone) {
        this.safeZones.push(safeZone);
    }

    addSector(sector) {
        this.sectors.push(sector);
    }

    getPortals() {
        return this.portals;
    }

    getSafeZones() {
        return this.safeZones;
    }

    getSectors() {
        return this.sectors;
    }
}

// Example usage:
const map = new MapSystem();
map.addPortal({ name: 'Portal1', location: { x: 10, y: 20 } });
map.addSafeZone({ name: 'SafeZone1', location: { x: 5, y: 5 } });
map.addSector({ name: 'SectorA', layout: [] });

// Exporting the MapSystem class for further usage
module.exports = MapSystem;