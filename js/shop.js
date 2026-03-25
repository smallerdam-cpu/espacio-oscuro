class Shop {
    constructor() {
        this.items = {
            ships: [],
            weapons: [],
            shields: [],
            abilities: []
        };
    }

    addItem(category, item) {
        if (this.items[category]) {
            this.items[category].push(item);
        } else {
            throw new Error("Invalid category");
        }
    }

    buyItem(category, itemName) {
        const categoryItems = this.items[category];
        const itemIndex = categoryItems.findIndex(item => item.name === itemName);

        if (itemIndex > -1) {
            const item = categoryItems[itemIndex];
            // Implement currency deduction and other purchase logic here
            console.log(`Purchased: ${item.name}`);
            categoryItems.splice(itemIndex, 1); // Remove purchased item
        } else {
            console.log("Item not found!");
        }
    }

    listItems(category) {
        return this.items[category] || [];
    }
}

// Sample usage
const shop = new Shop();
shop.addItem('ships', { name: 'Star Cruiser', price: 5000 });
shop.addItem('weapons', { name: 'Laser Gun', price: 1500 });
shop.addItem('shields', { name: 'Energy Shield', price: 3000 });
shop.addItem('abilities', { name: 'Invisibility', price: 2000 });

// Display available items
console.log(shop.listItems('ships'));
console.log(shop.listItems('weapons'));