class Player {
    constructor() {
        this.level = 1;
        this.experience = 0;
        this.credits = 0;
        this.rank = 'Novice';
        this.health = 100;
        this.equipment = [];
        this.stats = {
            strength: 10,
            agility: 10,
            intelligence: 10,
            stamina: 10,
        };
    }

    gainExperience(amount) {
        this.experience += amount;
        this.checkLevelUp();
    }

    checkLevelUp() {
        const experienceNeeded = this.level * 100; // Example level-up condition
        if (this.experience >= experienceNeeded) {
            this.level++;
            this.experience -= experienceNeeded;
            this.rank = this.getRank(); // Update rank on level up
        }
    }

    getRank() {
        if (this.level < 5) return 'Novice';
        if (this.level < 10) return 'Intermediate';
        return 'Expert';
    }

    addCredits(amount) {
        this.credits += amount;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
    }

    heal(amount) {
        this.health += amount;
        if (this.health > 100) this.health = 100;
    }

    equipItem(item) {
        this.equipment.push(item);
    }

    getStats() {
        return this.stats;
    }
}

module.exports = Player;