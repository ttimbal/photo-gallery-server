'use strict';
const admin = require("firebase-admin");

/**
 *  fcm controller
 */

const {createCoreController} = require('@strapi/strapi').factories;

module.exports = createCoreController('api::fcm.fcm', ({strapi}) => ({
  async create(ctx) {
    ctx.request.body.data = ctx.request.body;
    return super.create(ctx);
  },
}));
