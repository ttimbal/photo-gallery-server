'use strict';


const uniqid = require('uniqid');

/**
 *  event controller
 */

const {createCoreController} = require('@strapi/strapi').factories;

module.exports = createCoreController('api::event.event', ({strapi}) => ({

      async create(ctx) {
        ctx.request.body.data.uuid = uniqid();
        return super.create(ctx);
      },

    async myEvents(ctx) {
      const {user} = ctx.request.query;
      const events= await strapi.db.query('api::event.event').findMany({
        where: {
          $or: [
            {
                user: {
                  id: user
                }
            },
            {
                members: {
                  id: user
                }
            },
          ],
        },
        orderBy: { createdAt: 'asc' },
      });
      const sanitizedEntity = await this.sanitizeOutput(events, ctx);

      return this.transformResponse(sanitizedEntity);
    },

      async addMember(ctx) {
        const {id} = ctx.params;
        const {identifier} = ctx.request.body;

        const user = await strapi.query('plugin::users-permissions.user').findOne({
          where: {
            $or: [
              {
                email: identifier
              },
              {
                username: identifier
              },
            ],
          },
        });

        const response = await strapi.db.query('api::event.event').findOne({
          select: ['id'],
          where: { id: id },
          populate: { members: true },
        });

        const members=response.members.map(value =>{
          return value.id
        });
        members.push(user.id);

        return strapi.db.query('api::event.event').update({
          where: { id: id },
          data: {
            members: members,
          },
        })
      },

      async deleteMember(ctx) {
        const {id} = ctx.params;
        const {userId} = ctx.request.body;
        const response = await strapi.db.query('api::event.event').findOne({
          select: ['id'],
          where: { id: id },
          populate: { members: true },
        });

        const members=[];
        for( let i = 0; i < response.members.length; i++){
          if ( response.members[i].id !== Number(userId)) {
            members.push(response.members[i].id);
          }
        }

        return strapi.db.query('api::event.event').update({
          where: { id: id },
          data: {
            members: members,
          },
        })
      }
    }
  ),
);
