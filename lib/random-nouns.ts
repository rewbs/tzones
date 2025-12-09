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
    "blorp", "snoot", "wombat", "gherkin", "spatula",
    "nugget", "kumquat", "dingus", "floof", "sprocket",
    "bobbin", "smock", "plonk", "giblet", "noodle",
    "turnip", "widget", "bungus", "clonk", "spleen",
    "whelk", "tuber", "crumpet", "blunderbuss", "gizzard",
    "snorkel", "bumble", "winkle", "throttle", "pudding",
    "brisket", "clump", "dweeb", "flange", "grommet",
    "hobnob", "inkblot", "jamb", "kerfuffle", "lozenge",
    "mullet", "nubbin", "oink", "plinth", "quahog",
    "rumpus", "squib", "trundle", "uvula", "vortex",
    "waddle", "xylophone", "yam", "zeppelin", "armadillo",
    "boggle", "chutney", "dollop", "eggnog", "fungus",
    "gazebo", "hullabaloo", "igloo", "jalopy", "kazoo",
    "lemur", "mongoose", "newt", "octopus", "platypus",
    "quiche", "rhubarb", "splotch", "trousers", "ukulele",
    "vestibule", "wigwam", "yodel", "zucchini", "barnacle",
    "codswallop", "dingleberry", "elbow", "flapjack", "goober",
    "hooligan", "intestine", "jiggle", "knickers", "larynx",
    "muffin", "nipple", "orifice", "pants", "quibble",
    "rutabaga", "schnitzel", "trombone", "underpants", "vuvuzela"
]

export function getRandomMeetingName() {
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
    return `Meeting ${noun}`
}
