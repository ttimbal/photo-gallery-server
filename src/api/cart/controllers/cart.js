'use strict';

/**
 *  cart controller
 */

const {createCoreController} = require('@strapi/strapi').factories;

module.exports = createCoreController('api::cart.cart', ({strapi}) => ({
  // Method 1: Creating an entirely custom action
  async create(ctx) {
    // some logic here
    const {user,photo}=ctx.request.body.data
    const response = await strapi.db.query('api::cart.cart').findOne({
      where: {
        user: user,
        photo:photo
      },
    });
    if(response){
      const sanitizedEntity = await this.sanitizeOutput(response, ctx);
      return this.transformResponse(sanitizedEntity);
    }

    return  super.create(ctx);

  },

  async deleteAll(ctx){
    const {user}=ctx.request.query
    const response = await strapi.db.query('api::cart.cart').findMany({
      where: {
        user:user
      }
    });
    let counter=0;
    response.forEach(item=>{
      strapi.db.query('api::cart.cart').delete({
        where: {
          id:item.id
        }
      });
      counter++;
    });

    return {count:counter};

  },

  async exampleAction(ctx) {
    const {id}=ctx.request.query
    console.log(id)
    try {
      ctx.body = 'ok';
    } catch (err) {
      ctx.body = err;
    }
  }
}));
