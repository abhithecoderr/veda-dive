// Deity configuration for themes, audio, and video
const DEITY_CONFIG = {
    'agni': {
        name: 'Agni',
        theme: 'agni',
        video: 'https://res.cloudinary.com/dwa2d4onb/video/upload/v1762030039/agni_rqfy4u.mp4',
        audio: '/audio/agni.mp3',
        colors: {
            primary: '#ff4500',
            secondary: '#ff8c00',
            accent: '#ffd700',
            highlight: '#eed846ff',
        }
    },
    'indra': {
        name: 'Indra',
        theme: 'indra',
        video: 'https://res.cloudinary.com/dwa2d4onb/video/upload/v1762028676/indra_xys8fo.mp4',
        audio: '/audio/indra_clipped.mp3',
        colors: {
            primary: '#4169e1',
            secondary: '#1e90ff',
            accent: '#87cefa',
            highlight: '#a8d8ff',
        }
    },
    
    'soma': {
        name: 'Soma',
        theme: 'soma',
        video: 'https://res.cloudinary.com/dwa2d4onb/video/upload/v1762030665/soma_bpi3sw.mp4',
        audio: '/audio/soma_clipped.mp3',
        colors: {
            primary: '#9370db',
            secondary: '#ba55d3',
            accent: '#dda0dd',
            highlight: '#e0b0ff',
        }
    },
    'maruts': {
        name: 'Maruts',
        theme: 'maruts',
        video: 'https://res.cloudinary.com/dwa2d4onb/video/upload/v1762029757/maruts_zmrdqg.mp4',
        audio: '/audio/maruts_clipped.mp3',
        colors: {
            primary: '#708090',
            secondary: '#778899',
            accent: '#b0c4de',
            highlight: '#d3d3d3',
        }
    },

    'mitra': {
        name: 'Mitra',
        theme: 'mitra',
        video: 'https://res.cloudinary.com/dwa2d4onb/video/upload/v1762030626/mitra_ld5tqi.mp4',
        audio: '/audio/mitra_clipped.mp3',
        colors: {
            highlight: '#d3d3d3',
        },
    },
    'asvins': {
        name: 'Asvins',
        theme: 'asvins',
        video: 'https://res.cloudinary.com/dwa2d4onb/video/upload/v1762030603/asvins_clmfda.mp4',
        audio: '/audio/asvins_clipped.mp3',
        colors: {
            highlight: '#d3d3d3',
        }
    },
    'origin_of_things': {
        name: 'Origin of Things', // This is the display name
        theme: 'origin',         // The name of your new CSS file (e.g., /css/themes/origin.css)
        video: 'https://res.cloudinary.com/dwa2d4onb/video/upload/v1762022965/origin_of_things_obdfyf.mp4', // A video of space, nebula, etc.
        audio: '/audio/origin_of_things_clipped.mp3', // A deep, ambient audio track
        colors: {
            primary: '#9370DB',   // Deep purple
            secondary: '#FFFFFF', // White/starlight
            accent: '#FFD700',    // Gold
            highlight: '#5a189a', // Lavender highlight
        }
    },
    'creation_of_sacrifice': {
        name: 'Creation of the Sacrifice', // This is the display name
        theme: 'origin',         // The name of your new CSS file (e.g., /css/themes/origin.css)
        video: 'https://res.cloudinary.com/dwa2d4onb/video/upload/v1762022965/origin_of_things_obdfyf.mp4', // A video of space, nebula, etc.
        audio: '/audio/origin_of_things_clipped.mp3', // A deep, ambient audio track
        colors: {
            primary: '#9370DB',   // Deep purple
            secondary: '#FFFFFF', // White/starlight
            accent: '#FFD700',    // Gold
            highlight: '#5a189a', // Lavender highlight
        }
    },
    'default': {
        name: 'Default',
        theme: 'default',
        video: '',
        audio: '',
        colors: {
            primary: '#9f6335',
            secondary: '#035979',
            accent: '#ddab2c',
            highlight: '#ffd700',
        }
    }
};

const DEITY_NAME_MAP = {
    'agni': 'agni',
    'indra': 'indra',
    'surya': 'surya',
    'varuna': 'varuna',
    'vayu': 'vayu',
    'ushas': 'ushas',
    'soma': 'soma',
    'maruts': 'maruts',
    'marut': 'maruts',
    'origin of things': 'origin_of_things',
    'creation of the sacrifice': 'creation_of_sacrifice'
};