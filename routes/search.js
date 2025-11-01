import express from 'express';
import Mandala from '../models/mandala.js';
import Hymn from '../models/hymn.js';
import Stanza from '../models/stanza.js';
import Entity from '../models/entity.js';
import Rishi from '../models/rishi.js';

const router = express.Router();
const SUGGESTION_LIMIT = 5;

router.get('/api/search-suggestions', async (req, res) => {
    const query = req.query.q ? req.query.q.trim() : '';
    if (query.length === 0) return res.json([]);

    const regexQuery = new RegExp(query, 'i');
    const startsWithQuery = new RegExp('^' + query, 'i');
    const isNumberQuery = !isNaN(query);

    const searchPromises = [
        Mandala.find({
            $or: [
                { mandala_num: isNumberQuery ? Number(query) : null },
                { mandala_type: regexQuery }
            ]
        }).limit(SUGGESTION_LIMIT).lean().then(results => results.map(r => ({
            type: 'Mandala',
            display: `Mandala ${r.mandala_num}`,
            path: `/read/mandala/${r.mandala_num}`,
            score: r.mandala_num === Number(query) ? 9 : 7
        }))),

        Hymn.find({
            $or: [
                { location_index: startsWithQuery },
                { 'associated_entities.entity_name': regexQuery },
                { 'associated_rishis.rishi_name': regexQuery }
            ]
        })
        .limit(SUGGESTION_LIMIT).lean().then(results => results.map(r => ({
            type: 'Hymn',
            display: `Hymn ${r.mandala_num}.${r.hymn_num} (${r.addressee || 'Unknown'})`,
            path: `/hymn/${r.mandala_num}.${r.hymn_num}`,
            score: r.location_index === query ? 9 : 6
        }))),

        Stanza.find({
            $or: [
                { location_index: startsWithQuery },
                { $text: { $search: query } }
            ]
        })
        .limit(SUGGESTION_LIMIT).lean().then(results => results.map(r => {
            const hymnPath = `/hymn/${r.mandala_num}.${r.hymn_num}`;

            const cleanId = r.location_index.replace(/\./g, '-');

            const finalPath = `${hymnPath}#stanza-${cleanId}`;

            return {
                type: 'Stanza',
                display: `Stanza ${r.location_index}`,
                // Use the new path with the hash fragment
                path: finalPath,
                score: r.location_index === query ? 9 : 5
            };
        })),

        (async () => {
            const regexResults = await Entity.find({
                $or: [
                    { name_sanskrit: startsWithQuery },
                    { name_english: startsWithQuery }
                ]
            }).limit(SUGGESTION_LIMIT).lean();

            const textResults = await Entity.find(
                { $text: { $search: query } },
                { score: { $meta: "textScore" } }
            )
            .sort({ score: { $meta: "textScore" } })
            .limit(SUGGESTION_LIMIT).lean();

            const allEntities = [...new Map(
                [...regexResults, ...textResults].map(r => [r._id.toString(), r])
            ).values()];

            return allEntities.map(r => {
                const isExactMatch = r.name_sanskrit.toLowerCase() === query.toLowerCase() || r.name_english.toLowerCase() === query.toLowerCase();
                const isPartialMatch = r.name_sanskrit.toLowerCase().startsWith(query.toLowerCase()) || r.name_english.toLowerCase().startsWith(query.toLowerCase());

                let score = r.score || 7;
                if (isExactMatch) score = 10;
                else if (isPartialMatch) score = 9.5;

                return {
                    type: r.category,
                    display: `${r.name_sanskrit}`,
                    path: `/read/${r.category.toLowerCase()}/${encodeURIComponent(r.name_sanskrit)}`,
                    score: score
                };
            });
        })(),

        (async () => {
            const regexResults = await Rishi.find({
                $or: [
                    { name_sanskrit: startsWithQuery },
                    { family: startsWithQuery }
                ]
            }).limit(SUGGESTION_LIMIT).lean();

            const textResults = await Rishi.find(
                { $text: { $search: query } },
                { score: { $meta: "textScore" } }
            )
            .sort({ score: { $meta: "textScore" } })
            .limit(SUGGESTION_LIMIT).lean();

            const allRishis = [...new Map(
                [...regexResults, ...textResults].map(r => [r._id.toString(), r])
            ).values()];

            return allRishis.map(r => {
                const isExactMatch = r.name_sanskrit.toLowerCase() === query.toLowerCase();
                const isPartialMatch = r.name_sanskrit.toLowerCase().startsWith(query.toLowerCase());

                let score = r.score || 7;
                if (isExactMatch) score = 10;
                else if (isPartialMatch) score = 9.5;

                return {
                    type: 'Rishi',
                    display: `Rishi: ${r.name_sanskrit} (${r.family || r.label_english})`,
                    path: `/read/rishi/${encodeURIComponent(r.name_sanskrit)}`,
                    score: score
                };
            });
        })()
    ];

    try {
        const resultsArray = await Promise.all(searchPromises);
        let allSuggestions = resultsArray.flat();

        allSuggestions.sort((a, b) => b.score - a.score);

        res.json(allSuggestions);
    } catch (error) {
        console.error('Multi-schema search error (after fix):', error);
        res.status(500).json({ error: 'Failed to complete search' });
    }
});

export default router;