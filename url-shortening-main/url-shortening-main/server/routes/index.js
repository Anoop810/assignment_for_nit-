const express = require('express');
const router = express.Router();
const urlController = require('../controllers/url');

// Create short URL
router.post('/', urlController.createShortUrl);

// Get all URLs
router.get('/links', urlController.getAllUrls);  

router.delete('/', urlController.deleteUrl);

router.get('/analytics', urlController.analytics);
// Delete all URLs
router.delete('/all', urlController.deleteAllUrls);  


router.get('/:shortUrl', urlController.redirectToOriginalUrl);

module.exports = router;