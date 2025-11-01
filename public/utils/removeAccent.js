export function removeVedicAccents(sanskritLines) {
    const accentRegex = /[\u0951\u0952]/g;

    const cleanedLines = sanskritLines.map(line => {
        return line.replace(accentRegex, '');
    });

    console.log("--- Cleaned Sanskrit Lines (Accents Removed) ---");
    console.log(cleanedLines);

    return cleanedLines;
}

const accentedText = [
    "य॒ः कु॒क्षिः सो॑म॒पात॑मः स॒मु॒द्र इ॑व॒ पिन्व॑ते",
    "उ॒र्वीरापो॒ न का॒कुदः॑"
];
removeVedicAccents(accentedText);