const goApiMidJourneyPostConfig = (apiUrl, keyValue, payload) => {
    const config_data = {
        url: apiUrl,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': `${keyValue}`,
        },
        data: JSON.parse(JSON.stringify(payload))
    }
    return config_data;
}

const goApiMidJourneyFetchConfig = (apiUrl, payload) => {
    return {
        url: apiUrl,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: JSON.parse(JSON.stringify(payload))
    }
}

module.exports = {
    goApiMidJourneyPostConfig,
    goApiMidJourneyFetchConfig,
}