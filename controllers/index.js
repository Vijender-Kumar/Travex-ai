const { imagineAPI } = require('./midJourney-Imagine.controller')
const { buttonAPI } = require('./midJourney-button.controller')
const { getImageData } = require('./midjourney-get-image.controller')
const { goApiImagine } = require('./goApi-midJourney-imagine.controller')
const { goApiFetchData } = require('./goApi-get-image.controller')
const { goApiUpscale } = require('./goApi-midJourney-upscale.controller')

module.exports = {
    imagineAPI,
    buttonAPI,
    getImageData,
    goApiImagine,
    goApiFetchData,
    goApiUpscale,
}