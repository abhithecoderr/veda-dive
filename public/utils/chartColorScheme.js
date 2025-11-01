// A cache to store generated colors so the same name always gets the same color
const randomColorCache = {};

const deityColors = {
    // Key Deities with Thematic Colors
    "Indra": "#0047AB",
    "Agni": "#bb5f1dff",
    "Soma": "#2e5b2dff",
    "All the Gods": "#6f5b74ff",
    "Asvins": "#5f430eff",
    "Varuna": "#0f385eff",
    "Maruts": "#89a5a8ff",
    "Mitra": "#FFD700",
    "Usas": "#FFB6C1",
    "Vayu": "#B0E0E6",
    "Ribhus": "#8B4513",
    "Savitri": "#FFA500",
    "Pusan": "#9ACD32",
    "Agni Vaisvanara": "#FF7F50",
    "Others": "#1c1c1cff"
};

const rishiColors = {
    // Refreshed Rishi palette - cool and mid-tone friendly against beige
    "Vasishtha Maitravaruni": "#6a5acd", // soft indigo
    "Atri Bhauma": "#4a7856", // moss green
    "Tirasci": "#b38c32", // muted gold
    "Bharadvaja Barhaspatya": "#884343", // deep brick red
    "Vishvamitra Gathina": "#324a8a", // strong navy
    "Vamadeva Gautama": "#705040", // warm taupe
    "Gritsamada Saunahotra": "#3a8b6c", // teal green
    "Medhatithi": "#2f7a8c", // cooler teal-blue
    "Agastya": "#6b1d1d", // earthy maroon
    "Dirghatamas": "#3c3c3c", // near-black grey
    "Kutsa Angirasa": "#278e92", // cyan tint
    "Gotama": "#c89b3c", // bronze gold
    "Sons of Kanva": "#c2b8f0", // pale lavender
    "Parucchepa": "#6cb7dd", // light sky blue
    "Madhucchandas": "#dca57a", // peach beige
    "Nodhas": "#355264", // desaturated steel blue
    "Kaksivat": "#89b6cf", // baby blue
    "Virupa": "#a86f3c", // warm amber
    "Krishna": "#111111", // near black
    "Others": "#7c7c7c" // neutral grey
};

// --- NEW: Balanced Meter Colors ---
const meterColors = {
    "Tristubh": "#126d8a",   // deep teal
    "Gayatri": "#f2b732",    // brighter golden
    "Jagati": "#8b4f27",     // warm rust brown
    "Anushtubh": "#50431f",  // olive brown
    "Pankti": "#784885ff",     // dusty blue
    "Ushnih": "#826646",     // muted tan
    "Brhati": "#305c1d",     // forest green
    "Satobrhati": "#a89b7a", // muted sand
    "Dvipada": "#b28a39ff"     // steel cyan
};

const othersColor = '#4e4b47ff';   // slightly lighter neutral grey

const mandalaColors = [
    '#4e7c9c', // cool blue-grey
    '#c0923e', // rich amber
    '#7a5f3e', // warm wood tone
    '#2f6b79', // dark teal
    '#b68b5e', // clay brown
    '#e3ba45', // soft gold
    '#9d8669', // desaturated tan
    '#4a93a5', // sea teal
    '#5b4b2f', // dark olive
    '#cabca0'  // pale beige accent
];

/**
 * Generates a random, visually appealing color and caches it for the given key.
 * @param {string} key - The name to generate a color for.
 * @returns {string} A hex color code.
 */
function generateRandomColor(key) {
    if (randomColorCache[key]) {
        return randomColorCache[key];
    }
    const hue = Math.floor(Math.random() * 360);
    const saturation = '70%';
    const lightness = '50%';
    const color = `hsl(${hue}, ${saturation}, ${lightness})`;

    randomColorCache[key] = color;
    return color;
}

/**
 * Gets a color for a specific entity name or an index.
 * @param {string} schemeName - 'deity', 'rishi', 'mandala', or 'meter'.
 * @param {string|number} key - The name of the entity or the index for a mandala.
 * @returns {string} A hex color code.
 */
export function getColor(schemeName, key) {
    if (key === 'Others') {
        return othersColor;
    }

    switch (schemeName) {
        case 'deity':
            return deityColors[key] || generateRandomColor(key);
        case 'rishi':
            return rishiColors[key] || generateRandomColor(key);
        case 'mandala':
            return typeof key === 'number' ? mandalaColors[key % mandalaColors.length] : generateRandomColor(key);
        case 'meter':
            return meterColors[key] || generateRandomColor(key);
        default:
            return generateRandomColor(key);
    }
}
