export function countSanskritGraphemes(word) {
    if (!word || typeof word !== 'string' || word.length === 0) {
        return 0;
    }
    const baseCharacterRegex = /[\u0905-\u0914\u0950]|[\u0915-\u0939](?!\u094d)|[\u0915-\u0939]\u094d$/g;

    const matches = word.match(baseCharacterRegex);

    return matches ? matches.length : 0;
}