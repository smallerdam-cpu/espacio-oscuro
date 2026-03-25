class Enemy {
    constructor(name, health, damage, visionRange, loot) {
        this.name = name;
        this.health = health;
        this.damage = damage;
        this.visionRange = visionRange;
        this.loot = loot;
    }

    attack() {
        console.log(`${this.name} attacks for ${this.damage} damage!`);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        console.log(`${this.name} has been defeated!`);
    }
}

class Boss extends Enemy {
    constructor(name, health, damage, visionRange, loot, specialAbility) {
        super(name, health, damage, visionRange, loot);
        this.specialAbility = specialAbility;
    }

    useSpecialAbility() {
        console.log(`${this.name} uses its special ability: ${this.specialAbility}!`);
    }
}

class AIBehavior {
    constructor(enemy) {
        this.enemy = enemy;
    }

    patrol() {
        console.log(`${this.enemy.name} is patrolling its area.`);
    }

    chase(target) {
        console.log(`${this.enemy.name} is chasing ${target}.`);
    }

    idle() {
        console.log(`${this.enemy.name} is idling.`);
    }
}

const enemyTypes = [
    new Enemy('Goblin', 30, 5, 15, 'gold coin'),
    new Enemy('Orc', 50, 7, 20, 'health potion'),
    new Enemy('Skeleton', 25, 4, 10, 'bone fragment'),
    new Enemy('Zombie', 40, 6, 25, 'rotted flesh'),
    new Boss('Dragon', 100, 15, 30, 'treasure pile', 'fire breath')
];

// Example AI Behavior for the first enemy
const goblinAI = new AIBehavior(enemyTypes[0]);

goblinAI.patrol();
