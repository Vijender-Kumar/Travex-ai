'use strict';


function includeAllRoutes(app, passport) {
    require('./event-api.js')(app, passport);
    require('./prompts-data-api.js')(app, passport);
    require('./midjourney-api.js')(app, passport);
    require('./goapi-midjourney.js')(app, passport);
    require('./goapi-prompts-data-api.js')(app, passport);
}

module.exports = function (app, passport) {
    includeAllRoutes(app, passport);
};