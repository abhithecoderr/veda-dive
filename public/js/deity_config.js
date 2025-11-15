// Deity configuration for themes, audio, and video
const DEITY_CONFIG = {
    'agni': {
        name: 'Agni',
        theme: 'agni',
        video: 'https://res.cloudinary.com/dwa2d4onb/video/upload/v1762030039/agni_rqfy4u.mp4',
        colors: {
            primary: '#ff4500',
            secondary: '#ff8c00',
            accent: '#ffd700',
            highlight: '#eed846ff',
        },
        soundEffects: [
            '/audio/agni.mp3',
            '/audio/sfx/fire_crackle_2.mp3'
        ],
        music: [
        ]
    },
    'indra': {
        name: 'Indra',
        theme: 'indra',
        video: 'https://res.cloudinary.com/dwa2d4onb/video/upload/v1762028676/indra_xys8fo.mp4',
        colors: {
            primary: '#4169e1',
            secondary: '#1e90ff',
            accent: '#87cefa',
            highlight: '#a8d8ff',
        },
        soundEffects: [
            '/audio/indra_clipped.mp3'
        ],
        music: [

        ]
    },
    'soma': {
        name: 'Soma',
        theme: 'soma',
        video: 'https://res.cloudinary.com/dwa2d4onb/video/upload/v1762030665/soma_bpi3sw.mp4',
        colors: {
            primary: '#9370db',
            secondary: '#ba55d3',
            accent: '#dda0dd',
            highlight: '#e0b0ff',
        },
        soundEffects: ['/audio/soma_clipped.mp3'],
        music: [
             { name: 'Celestial Ambience', url: '/audio/music/soma_clipped.mp3' }
        ]
    },
    'maruts': {
        name: 'Maruts',
        theme: 'maruts',
        video: 'https://res.cloudinary.com/dwa2d4onb/video/upload/v1762029757/maruts_zmrdqg.mp4',
        colors: {
            primary: '#708090',
            secondary: '#778899',
            accent: '#b0c4de',
            highlight: '#d3d3d3',
        },
        soundEffects: ['/audio/maruts_clipped.mp3'],
        music: [
            { name: 'Storm Winds', url: '/audio/music/maruts_clipped.mp3' }
        ]
    },
    'origin_of_things': {
        name: 'Origin of Things',
        theme: 'origin',
        video: 'https://res.cloudinary.com/dwa2d4onb/video/upload/v1762022965/origin_of_things_obdfyf.mp4',
        colors: {
            primary: '#9370DB',
            secondary: '#FFFFFF',
            accent: '#FFD700',
            highlight: '#8f12d6',
        },
        soundEffects: [],
        music: [
            { name: 'Cosmic Drone', url: '/audio/origin_of_things_clipped.mp3' }
        ]
    },
    'creation_of_sacrifice': {
        name: 'Creation of the Sacrifice',
        theme: 'origin',
        video: 'https://res.cloudinary.com/dwa2d4onb/video/upload/v1762022965/origin_of_things_obdfyf.mp4',
        colors: {
            primary: '#9370DB',
            secondary: '#FFFFFF',
            accent: '#FFD700',
            highlight: '#5a189a',
        },
        soundEffects: [],
        music: [
            { name: 'Cosmic Drone', url: '/audio/music/origin_of_things_clipped.mp3' }
        ]
    },
    'default': {
        name: 'Default',
        theme: 'default',
        video: '',
        colors: {
            primary: '#8d582fff',
            secondary: '#035979',
            accent: '#ddab2c',
            highlight: '#ffd700',
        },
        soundEffects: [],
        music: []
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