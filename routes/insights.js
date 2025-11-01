// /routes/insights.js

import express from "express";
const router = express.Router();

// GET /insights
router.get('/', (req, res) => {
    res.render('insights/index', {
        title: "Rigveda Insights & Analytics",
        activeNav: "Insights"
    });
});

// GET /insights/graph/:graphType - Updated route
router.get('/graph/:graphType', (req, res) => {
    const { graphType } = req.params;
    const title = graphType.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    res.render('insights/graph', {
        title: `Visualization: ${title}`,
        graphType: graphType,
        activeNav: "Insights"
    });
});

export default router;