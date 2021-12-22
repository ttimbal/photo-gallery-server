'use strict';

/**
 * fcm router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::fcm.fcm');
