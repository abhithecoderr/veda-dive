import express from 'express';
import Mandala from '../models/mandala.js';
import Hymn from '../models/hymn.js';
import Stanza from '../models/stanza.js';
import Entity from '../models/entity.js';
import Rishi from '../models/rishi.js';

const router = express.Router();

router.get('/', async (req, res) => {
	try {
		// --- 1. Fetch Featured Data from Database ---

		// Fetch specific, well-known hymns
		const featuredHymns = await Hymn.find({
			location_index: { $in: ['1.1', '10.90', '10.129'] }
		}).lean();

		// Fetch prominent deities
		const featuredDeities = await Entity.find({
			category: 'Deity',
			name_sanskrit: { $in: ['Indra', 'Agni', 'Soma', 'Uṣas'] }
		}).limit(4).lean();

		// Fetch influential Rishis
		const featuredRishis = await Rishi.find({
			name_sanskrit: { $in: ['Vishvamitra Gathina', 'Atri Bhauma', 'Bharadvaja', 'Vamadeva Gautama'] }
		}).limit(4).lean();

		// Fetch a mix of important animals and objects
		const featuredCreaturesAndObjects = await Entity.find({
			category: { $in: ['Animal', 'Object'] },
			name_sanskrit: { $in: ['Cows', 'Ghrita (Ghee)', 'Pressing Stones', 'Dead One'] }
		}).limit(4).lean();

		// --- 2. Static Data for Teaser Sections ---

		const featuredInsights = [
			{
				title: 'The Most Frequent Words',
				description: 'Explore a treemap visualization of the most commonly used words in the Rigveda and discover their significance.',
				imageUrl: '/images/insights/word_dist_global.png', // Example path
				link: '/insights/graph/word-distribution-global'
			},
			{
				title: 'Metrical Patterns Across Mandalas',
				description: 'Analyze the distribution of poetic meters like Gāyatrī and Triṣṭubh throughout the ten books.',
				imageUrl: '/images/insights/meter_dist_global.png', // Example path
				link: '/insights/graph/meter-distribution-global'
			},
            {
				title: 'Deity distribution by Mandala',
				description: 'Discover which deities are invoked with what frequency across the 10 mandalas',
				imageUrl: '/images/insights/deity_dist_mandala.png', // Example path
				link: '/insights/graph/deity-distribution-mandala'
			}
		];

		const featuredLearn = [
			{
				title: 'Understanding Vedic Sanskrit',
				description: 'A beginner\'s guide to the grammar, phonology, and key differences from Classical Sanskrit.',
				imageUrl: '/images/learn/sanskrit_manuscript.png', // Example path
				link: '/learn/vedic-sanskrit-101'
			},
			{
				title: 'The Rishis and their Families',
				description: 'Learn about the ancient seer families and their traditional association with specific Mandalas.',
				imageUrl: '/images/learn/rishi_lineage.png', // Example path
				link: '/learn/rishi-families'
			}
		];

		res.render('home/index', {
			title: 'Home | The Rigveda Project',
			activeNav: 'Home',
			featuredHymns,
			featuredDeities,
			featuredRishis,
			featuredCreaturesAndObjects,
			featuredInsights,
			featuredLearn
		});

	} catch (error) {
		console.error("Error fetching data for home page:", error);
		// Render the page with empty arrays or default data to prevent a crash
		res.status(500).render('home/index', {
			title: 'Home | The Rigveda Project',
			activeNav: 'Home',
			featuredHymns: [],
			featuredDeities: [],
			featuredRishis: [],
			featuredCreaturesAndObjects: [],
			featuredInsights: [],
			featuredLearn: []
		});
	}
});


router.get("/hymn/:location", async (req, res) => {

	let locationIndex = req.params.location;
	const { navType, navId } = req.query;

	let hymn = await Hymn.findOne({location_index: locationIndex}).lean();

	let navHymns = [];
	let navContext = { type: 'mandala', id: hymn ? hymn.mandala_id : '1', label: 'Mandala', contextList: [] };
	const sortOrder = { mandala_num: 1, hymn_num: 1 };

    // Determine the current context
    let effectiveNavType = navType;
    let effectiveNavId = navId;

    if (hymn && navType === 'mandala' && navId !== hymn.mandala_id.toString()) {
        effectiveNavId = hymn.mandala_id.toString();
    }

	// --- Determine Navigation Context and Fetch Relevant Hymns ---
	if (effectiveNavType === 'entity' && effectiveNavId) {
		const entity = await Entity.findById(effectiveNavId).lean();

		if (entity && entity.associated_hymns.length > 0) {

			navHymns = await Hymn.find({ location_index: { $in: entity.associated_hymns } })
				.sort(sortOrder)
				.lean();

            const entityCategory = entity.category;
            const allCategoryEntities = await Entity.find({ category: entityCategory })
                .sort({ name_sanskrit: 1 })
                .lean();

            const contextList = allCategoryEntities.map(e => ({
                id: e._id.toString(),
                name: e.name_sanskrit,
                label: e.category
            }));

			navContext = {
				type: 'entity',
				id: effectiveNavId,
				name: entity.name_sanskrit,
                label: entityCategory,
                contextList: contextList
			};
		}

	} else if (effectiveNavType === 'rishi' && effectiveNavId) {
		const rishi = await Rishi.findById(effectiveNavId).lean();

		if (rishi && rishi.associated_hymns.length > 0) {

			navHymns = await Hymn.find({ location_index: { $in: rishi.associated_hymns } })
				.sort(sortOrder)
				.lean();

            const allRishis = await Rishi.find({}).sort({ name_sanskrit: 1 }).lean();
            const contextList = allRishis.map(r => ({
                id: r._id.toString(),
                name: r.name_sanskrit,
                label: r.label_english
            }));

			navContext = {
				type: 'rishi',
				id: effectiveNavId,
				name: rishi.name_sanskrit,
                label: rishi.label_english,
                contextList: contextList
			};
		}
	}

	// Default (Mandala) or Fallback
	if (navHymns.length === 0 || navContext.type === 'mandala') {

        const currentMandalaNum = hymn ? hymn.mandala_num.toString() : '1';

        // Use the current Mandala number if hymn exists, otherwise default to 1
        const mandalaId = hymn ? hymn.mandala_id : (await Mandala.findOne({ mandala_num: 1 }).select('_id'));

        if (mandalaId) {
            navHymns = await Hymn.find({ mandala_id: mandalaId }).sort(sortOrder).lean();
        } else {
            navHymns = await Hymn.find({}).sort(sortOrder).lean(); // Fallback to all if mandala 1 is missing
        }

        // Fetch all mandalas for the dropdown
        const allMandalas = await Mandala.find({}).sort({ mandala_num: 1 }).lean();
        const contextList = allMandalas.map(m => ({
            id: m.mandala_num.toString(),
            name: `${m.mandala_num}`,
            label: 'Mandala'
        }));

		navContext = {
			type: 'mandala',
			id: currentMandalaNum,
            label: 'Mandala',
            contextList: contextList
		};
	}

    if (navHymns.length > 0 && (!hymn || !navHymns.some(h => h.location_index === hymn.location_index))) {

        const firstHymnLocation = navHymns[0].location_index;

        let newUrl = `/hymn/${firstHymnLocation}`;
        if (navContext.type !== 'mandala') {
             // Append navType and navId if we are in Rishi or Entity context
            newUrl += `?navType=${navContext.type}&navId=${navContext.id}`;
        }

        // Force a browser redirect
        return res.redirect(newUrl);
    }

    if (!hymn && navHymns.length > 0) {
        hymn = navHymns[0];
        locationIndex = hymn.location_index;
    }

    if (!hymn) {
        return res.status(404).send('Hymn not found in any context.');
    }


	const stanzas = await Stanza.find({hymn_id: hymn._id}).lean()

	res.render("read/hymn_detail", {
		title: `Hymn ${hymn.location_index}`, // Use the corrected hymn location
		hymn: hymn,
		stanzas: stanzas,
		hymns: navHymns,
		navContext: navContext,
		activeNav: "Read"
	});
});

export default router;