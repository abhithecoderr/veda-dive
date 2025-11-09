import express from 'express';

const router = express.Router();

router.get('/about', (req, res) => {
	res.render('home/about', {
		title: 'About | The Rigveda Project',
		activeNav: 'About'
	});
});

export default router;
