import express from 'express';

const router = express.Router();

router.get('/disclaimer', (req, res) => {
	res.render('legal/disclaimer', {
		title: 'Disclaimer | The Rigveda Project',
		activeNav: 'Disclaimer'
	});
});

router.get('/privacy-policy', (req, res) => {
	res.render('legal/privacy-policy', {
		title: 'Privacy Policy | The Rigveda Project',
		activeNav: 'Privacy Policy'
	});
});

export default router;
