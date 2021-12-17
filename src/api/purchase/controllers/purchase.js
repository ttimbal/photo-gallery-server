'use strict';

/**
 *  purchase controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::purchase.purchase', ({strapi}) => ({
  async create(ctx) {
    const {user}=ctx.request.body.data
    const response=await super.create(ctx);
    const cart= await strapi.db.query('api::cart.cart').findMany({
      where: {
        user:user
      }
    });
    cart.forEach(item=>{
      strapi.db.query('api::cart.cart').delete({
        where: {
          id:item.id
        }
      });
    });

    return response;
  },
}));
