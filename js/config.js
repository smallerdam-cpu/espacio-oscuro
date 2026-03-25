const gameConfig = {
    shipTypes: [
        { name: 'Fighter', speed: 300, armor: 50 },
        { name: 'Bomber', speed: 200, armor: 70 },
        { name: 'Interceptor', speed: 350, armor: 40 }
    ],
    weapons: [
        { name: 'Laser Cannon', damage: 50, range: 500 },
        { name: 'Plasma Gun', damage: 75, range: 400 },
        { name: 'Missile Launcher', damage: 100, range: 600 }
    ],
    shields: [
        { name: 'Standard Shield', strength: 100 },
        { name: 'Reinforced Shield', strength: 150 },
        { name: 'Energy Shield', strength: 200 }
    ],
    abilities: [
        { name: 'Cloaking', duration: 10 },
        { name: 'Repair', amount: 50 },
        { name: 'Speed Boost', duration: 5 }
    ],
    enemies: [
        { name: 'Space Pirate', health: 200, damage: 25 },
        { name: 'Asteroid', health: 100, damage: 10 },
        { name: 'Alien Ship', health: 300, damage: 50 }
    ],
    mapData: {
        sectors: 5,
        obstacles: ['Asteroids', 'Debris', 'Enemies'],
        collectibleItems: ['Health Pack', 'Weapon Upgrade']
    }
};

module.exports = gameConfig;