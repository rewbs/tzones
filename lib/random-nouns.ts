export const ADJECTIVES = [
    "Happy", "Sleepy", "Grumpy", "Sneezy", "Dopey", "Bashful", "Doc",
    "Dancing", "Flying", "Swimming", "Running", "Jumping", "Singing",
    "Purple", "Green", "Blue", "Red", "Yellow", "Orange", "Pink",
    "Giant", "Tiny", "Huge", "Small", "Big", "Little",
    "Fuzzy", "Fluffy", "Spiky", "Smooth", "Rough", "Shiny",
    "Loud", "Quiet", "Silent", "Noisy",
    "Fast", "Slow", "Quick", "Speedy",
    "Funny", "Silly", "Goofy", "Crazy", "Wacky",
    "Brave", "Cowardly", "Strong", "Weak",
    "Smart", "Clever", "Intelligent", "Wise",
    "Kind", "Nice", "Friendly",
    "Cosmic", "Galactic", "Interstellar", "Universal",
    "Magic", "Mystic", "Enchanted", "Cursed",
    "Ancient", "Modern", "Future", "Past",
]

export const NOUNS = [
    "Potato", "Octopus", "Banjo", "Wombat", "Platypus", "Marshmallow",
    "Spatula", "Toaster", "Penguin", "Giraffe", "Elephant", "Kangaroo",
    "Unicorn", "Dragon", "Dinosaur", "Robot", "Alien", "Ghost",
    "Pirate", "Ninja", "Wizard", "Clown", "Jellyfish", "Starfish",
    "Pancake", "Waffle", "Biscuit", "Cookie", "Muffin", "Cupcake",
    "Taco", "Burrito", "Pizza", "Burger", "Sandwich", "Salad",
    "Apple", "Banana", "Orange", "Grape", "Melon", "Berry",
    "Car", "Bus", "Train", "Plane", "Boat", "Ship",
    "Tree", "Flower", "Grass", "Leaf", "Cloud", "Sun", "Moon", "Star",
    "Cat", "Dog", "Bird", "Fish", "Mouse", "Rat",
    "Hat", "Shoe", "Sock", "Shirt", "Pants", "Dress",
    "Book", "Pen", "Pencil", "Paper", "Crayon", "Marker",
    "Chair", "Table", "Bed", "Desk", "Lamp", "Rug",
    "Pickle", "Cucumber", "Tomato", "Carrot", "Onion", "Garlic",
    "Cheese", "Milk", "Yogurt", "Butter", "Cream", "Ice",
    "Trombone", "Kazoo", "Didgeridoo", "Accordion", "Bagpipe",
    "Gazebo", "Pergola", "Bungalow", "Igloo", "Teepee",
    "Narwhal", "Manatee", "Capybara", "Axolotl", "Pangolin"
]

export function getRandomMeetingName() {
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
    return `Meeting ${noun}`
}
