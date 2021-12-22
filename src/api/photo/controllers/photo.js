'use strict';

/**
 *  photo controller
 */
const {createCoreController} = require('@strapi/strapi').factories;
const request = require("request");

const  admin = require("firebase-admin");

module.exports = createCoreController('api::photo.photo', ({strapi}) => ({
  async findOne(ctx) {
    const {id} = ctx.params;
    const entry = await strapi.db.query('api::photo.photo').findOne({
      where: { id: id },
      populate: {
        image: true,
        photographer: true,
        event: true
      },
    });
    const sanitizedEntity = await this.sanitizeOutput(entry, ctx);

    return this.transformResponse(sanitizedEntity).data;
  },

    async event(ctx) {
      const {user} = ctx.request.query;
      const {event} = ctx.request.query;
      const photos = await strapi.db.query('api::photo.photo').findMany({
        where: {
          event: {
            id: event
          },
          $or: [
            {
              event: {
                user: {
                  id: user
                }
              }
            },
            {
              event: {
                members: {
                  id: user
                }
              }
            },
            {
              event:{
                  status: {
                    name:'publico'
                  }
              }
            }

          ],
        },
        orderBy: { createdAt: 'desc' },
        populate: {
          image: true,
          event: {
            populate: {
              user: true,
              members: true
            }
          }
        },
      });

      const sanitizedEntity = await this.sanitizeOutput(photos, ctx);

      return this.transformResponse(sanitizedEntity);
    },

    async you(ctx) {
      //ctx.request.body.data.uuid = uniqid();
      //return super.create(ctx);
    },

    async upload(ctx) {
      //add luxand cloud and FCM


      for (let i = 0; i < ctx.request.body.data.length; i++) {
        const data=ctx.request.body.data[i]
        const photo=await strapi.db.query('api::photo.photo').create({data: data});
       // options.formData.photo=data.url;
        console.log(data.url)
        recognition(data.url,photo.id,strapi);
      }

      return  {count: ctx.request.body.data.length}
    }
  })
);

const recognition=async(imageUrl,imageId,strapi)=>{
  const options = {
    method: 'POST',
    url: "https://api.luxand.cloud/photo/search",
    qs: {},
    headers: {
      'token': "22fd1796f78149ff9bb2e25f758f5d0b"
    },
    formData: {
      photo: imageUrl
    }
  };

  request(options, (error, response, body)=> {
    const luxandData = JSON.parse(body)
    if (error || luxandData.status==='failure') console.log('Luxand cloud error');
    else{
        addYourPhoto(luxandData,imageId,strapi)
    }
  });

};

const addYourPhoto=async(luxandData,imageId,strapi)=>{
  for (let i = 0; i <luxandData.length ; i++) {
    const person=luxandData[i];
    const username=person.name;
    const user=await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { username: username },
    });
    if(user)
    strapi.db.query('api::your-photo.your-photo').create({data: {user:user.id, photo:imageId}});
    await notification(user);
    //notify to user
  }

}

const notification=async(user)=>{
  const fcm=await strapi.db.query('api::fcm.fcm').findMany({
    where: { user: user.id },
  });

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
      console.log('An error occurred while connecting to Firebase');
    }
  }
}
