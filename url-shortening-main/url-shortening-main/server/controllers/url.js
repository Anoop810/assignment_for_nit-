const Url = require('../models/Url');
const validateUrl = require('../utils/validateUrl');
const generateUniqueId = require('../utils/generateUniqueId');

async function createShortUrl(req, res) {
    const { url, alias } = req.body;
    const clientUrl = "http://localhost:5500";  // Use static URL for testing

    // Validate original URL
    if (!validateUrl(url)) {
        return res.status(400).json({ message: 'Invalid URL' });
    }

    try {
        // Check if the original URL already exists
        const existingUrl = await Url.findOne({ originalUrl: url });
        if (existingUrl) {
            const shortUrl = `${clientUrl}/${existingUrl.shortUrl}`;
            return res.status(200).json({ shortUrl, clicks: existingUrl.clicks });
        }

        // Check if the alias is provided and if it's available
        if (alias) {
            const aliasExists = await Url.findOne({ alias });
            if (aliasExists) {
                return res.status(400).json({ message: 'Alias is already taken, please choose another' });
            }
        }

        // Generate unique short URL ID or use custom alias if provided
        const shortUrl = alias || await generateUniqueId();

        const newUrlDoc = new Url({
            originalUrl: url,
            shortUrl,
            alias,  // Optional alias
            createdAt: new Date()
        });

        await newUrlDoc.save();

        const fullShortUrl = `${clientUrl}/${shortUrl}`;
        res.status(200).json({ shortUrl: fullShortUrl, clicks: 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
}

async function redirectToOriginalUrl(req, res) {
    const { shortUrl } = req.params;

    try {
        const urlDoc = await Url.findOne({ shortUrl });
        if (!urlDoc) {
            return res.status(404).json({ message: 'URL not found' });
        }

        // Increment click count
        await Url.findByIdAndUpdate(urlDoc._id, { $inc: { clicks: 1 } });

        // Redirect to the original URL
        return res.redirect(urlDoc.originalUrl);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
}

async function deleteUrl(req, res) {
    const { url } = req.body;

    try {
        const deletedUrl = await Url.deleteOne({ originalUrl: url });
        if (deletedUrl.deletedCount === 0) {
            return res.status(400).json({ message: 'URL not found' });
        }

        res.status(200).json({ message: `URL ${url} deleted successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
}

// Delete all URLs
async function deleteAllUrls(req, res) {
    try {
        await Url.deleteMany({});  // Deletes all documents in the 'urls' collection
        res.status(200).json({ message: 'All URLs deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting all URLs', error: err });
    }
}

// Function to get all URLs
async function getAllUrls(req, res) {
    try {
        const urls = await Url.find();  // Fetch all URLs from the database
        res.status(200).json(urls);  // Send the list of URLs as JSON response
    } catch (error) {
        console.error("Error fetching links", error);
        res.status(500).json({ message: "Error fetching links" });
    }
}

// Endpoint to get total clicks across all URLs
async function analytics(req, res) {
    try {
      const result = await Url.aggregate([
        { $group: { _id: null, totalClicks: { $sum: '$clicks' } } }
      ]);
      console.log(result)
      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching total clicks:', error);
      res.status(500).json({ message: 'Server Error' });
    }
}
  
// Endpoint to get top clicked URLs
async function topUrls(req, res) {
    try {
      const topUrls = await Url.find().sort({ clicks: -1 }).limit(5); // Adjust the number based on your needs
      res.status(200).json(topUrls);
    } catch (error) {
      console.error('Error fetching top clicked URLs:', error);
      res.status(500).json({ message: 'Server Error' });
    }
}

module.exports = {
    createShortUrl,
    redirectToOriginalUrl,
    deleteUrl,
    deleteAllUrls,
    getAllUrls,
    analytics,
    topUrls
};
