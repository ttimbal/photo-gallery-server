'use strict';

/**
 * fcm service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::fcm.fcm');
