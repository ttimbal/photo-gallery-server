'use strict';

/**
 *  fcm controller
 */
var admin = require("firebase-admin");

const {createCoreController} = require('@strapi/strapi').factories;

module.exports = createCoreController('api::fcm.fcm', ({strapi}) => ({
  async create(ctx) {
    ctx.request.body.data = ctx.request.body;
    return super.create(ctx);
  },
  async find(ctx){
    const fcm=await strapi.db.query('api::fcm.fcm').findMany({
      where: { user: 1 },
    });

    console.log(fcm)
    const message = {
      notification: {
        title: 'Nueva foto',
        body: '¡hey! subieron una foto en la que apareces'
      },
    };
    const registrationTokens = [];
    fcm.forEach((item) => {
      registrationTokens.push(item.token);
    })
    if (registrationTokens.length > 0) {
      try {
        const {
          failureCount,
          successCount
        } = await admin.messaging().sendToDevice(registrationTokens, message, {priority: 'high'});
        console.log(`Successfully sent the notification to ${successCount} devices (${failureCount} failed).`);
      } catch (err) {
        console.log(err);
      }
    }
  }
}));
