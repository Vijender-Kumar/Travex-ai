const axios = require('axios')

async function fetchImageFromGoogleDrive(url) {
    try {
        const fileId = url.match(/\/file\/d\/(.+?)\//)[1];
        const response = await axios.get(`https://drive.google.com/uc?export=download&id=${fileId}`, {
            responseType: 'stream'
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching image:', error);
        throw error;
    }
}

async function fetchImageFromMidJourneyUrl(url) {
    try {
        const response = await axios.get(url, {
            responseType: 'stream'
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching image:', error);
        throw error;
    }
}

async function extractFileId(url) {
    try {
        const match = url.match(/\/d\/([^\/]*)/);
        return match && match[1] ? match[1] : null;
    } catch (error) {
        console.error("An error occurred while extracting the file ID:", error);
        return null;
    }
}

module.exports = {
    fetchImageFromGoogleDrive,
    fetchImageFromMidJourneyUrl,
    extractFileId,
}