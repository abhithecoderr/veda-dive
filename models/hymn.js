import mongoose from 'mongoose';
import Rishi from './rishi.js';
import Entity from './entity.js';

const HymnSchema = new mongoose.Schema(
    {
        hymn_num: {
            type: Number,
            required: [true, 'Hymn number is required'],
        },
        mandala_num: {
            type: Number,
            required: [true, 'Mandala number is required'],
        },
        location_index: {
            type: String,
            required: [true, 'Canonical location (M.H) is required'],
            unique: true,
            trim: true,
        },
        mandala_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Mandala',
            required: [true, 'Mandala reference is required'],
        },
        associated_rishis: {
            type: [
                {
                    rishi_id: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'Rishi',
                        required: true,
                    },
                    rishi_name: {
                        type: String,
                        required: true,
                    },
                },
            ],
            default: [],
        },
        associated_entities: {
            type: [
                {
                    entity_id: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'Entity',
                        required: true,
                    },
                    entity_name: {
                        type: String,
                        required: true,
                    },
                    entity_type: {
                        type: String,
                        required: true,
                    },
                },
            ],
            default: [],
        },
        hymn_group: {
            type: String,
            default: '',
        },
        addressee: {
            type: String,
            default: '',
        },
        strata: {
            type: String,
            default: '',
        },
        stanza_count: {
            type: Number,
            default: 0,
        },
        summary: {
            type: String,
            default: '',
        },
        label_sanskrit: {
            type: String,
            default: 'Sukta',
            trim: true,
        },
        label_english: {
            type: String,
            default: 'Hymn',
            trim: true,
        },
    },
    {
        collection: 'hymns',
        timestamps: true,
    }
);

HymnSchema.index({ mandala_num: 1, hymn_num: 1, mandala_id: 1 });

HymnSchema.statics.getOverallTotals = async function () {

    // 1. Get Deities and their total associated hymn count
    const totalDeityCounts = await Entity.aggregate([
        { $match: { category: 'Deity', hymn_count: { $gt: 0 } } },
        { $project: { _id: 0, name: '$name_sanskrit', count: '$hymn_count' } },
        { $sort: { count: -1 } }
    ]);

    // 2. Get Rishis and their total associated hymn count
    const totalRishiCounts = await Rishi.aggregate([
        { $match: { hymn_count: { $gt: 0 } } },
        { $project: { _id: 0, name: '$name_sanskrit', count: '$hymn_count' } },
        { $sort: { count: -1 } }
    ]);

    return { totalDeityCounts, totalRishiCounts };
};


HymnSchema.statics.getMandalaDistributions = async function () {
    // Unwind rishis and entities to treat all associations equally
    const hymns = await this.aggregate([
        { $sort: { mandala_num: 1, hymn_num: 1 } },
        // Unwind associated_rishis
        { $unwind: { path: '$associated_rishis', preserveNullAndEmptyArrays: true } },
        // Unwind associated_entities
        { $unwind: { path: '$associated_entities', preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: '$mandala_num',
                total_hymns: { $sum: 1 }, // Total hymns per mandala
                hymns: {
                    $push: {
                        hymn: '$location_index',
                        deity: {
                            $cond: [
                                { $eq: ['$associated_entities.entity_type', 'Deity'] },
                                '$associated_entities.entity_name',
                                null,
                            ],
                        },
                        rishi: '$associated_rishis.rishi_name',
                    },
                },
            },
        },
        { $sort: { _id: 1 } },
    ]);

    // Cross-reference with Rishi and Entity models
    const rishis = await Rishi.find({}, 'name_sanskrit associated_hymns').lean();
    const entities = await Entity.find({ category: 'Deity' }, 'name_sanskrit associated_hymns').lean();

    return hymns.map(mandala => {
        const mandalaRishis = rishis
            .filter(r => r.associated_hymns.some(h => h.startsWith(`${mandala._id}.`)))
            .map(r => r.name_sanskrit);
        const mandalaDeities = entities
            .filter(e => e.associated_hymns.some(h => h.startsWith(`${mandala._id}.`)))
            .map(e => e.name_sanskrit);
        return {
            _id: mandala._id,
            total_hymns: mandala.total_hymns,
            hymns: mandala.hymns.filter(h => h.deity || h.rishi), // Filter out null entries
            rishis: mandalaRishis,
            deities: mandalaDeities,
        };
    });
};

const Hymn = mongoose.model('Hymn', HymnSchema);

export default Hymn;