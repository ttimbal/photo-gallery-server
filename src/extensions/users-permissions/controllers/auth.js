'use strict';

/**
 * Auth.js controller
 *
 * @description: A set of functions called "actions" for managing `Auth`.
 */

/* eslint-disable no-useless-escape */
const crypto = require('crypto');
const request = require("request");
const _ = require('lodash');
const utils = require('@strapi/utils');
const { getService } = require('../utils');
const {
  validateCallbackBody,
  validateRegisterBody,
  validateSendEmailConfirmationBody,
} = require('./validation/auth');

const { sanitize } = utils;
const { ApplicationError, ValidationError } = utils.errors;

const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const sanitizeUser = (user, ctx) => {
  const { auth } = ctx.state;
  const userSchema = strapi.getModel('plugin::users-permissions.user');

  return sanitize.contentAPI.output(user, userSchema);
};


module.exports = {
  async callback(ctx) {
    const provider = ctx.params.provider || 'local';
    const params = ctx.request.body;

    const store = await strapi.store({ type: 'plugin', name: 'users-permissions' });

    if (provider === 'local') {
      if (!_.get(await store.get({ key: 'grant' }), 'email.enabled')) {
        throw new ApplicationError('This provider is disabled');
      }

      await validateCallbackBody(params);

      const query = { provider };

      // Check if the provided identifier is an email or not.
      const isEmail = emailRegExp.test(params.identifier);

      // Set the identifier to the appropriate query field.
      if (isEmail) {
        query.email = params.identifier.toLowerCase();
      } else {
        query.username = params.identifier;
      }

      // Check if the user exists.
      const user = await strapi.query('plugin::users-permissions.user').findOne({ where: query, populate:{role:true}});
      //const role = await strapi.query('plugin::users-permissions.role').findMany();

      if (!user) {
        throw new ValidationError('Invalid identifier or password');
      }

      if (
        _.get(await store.get({ key: 'advanced' }), 'email_confirmation') &&
        user.confirmed !== true
      ) {
        throw new ApplicationError('Your account email is not confirmed');
      }

      if (user.blocked === true) {
        throw new ApplicationError('Your account has been blocked by an administrator');
      }

      // The user never authenticated with the `local` provider.
      if (!user.password) {
        throw new ApplicationError(
          'This user never set a local password, please login with the provider used during account creation'
        );
      }

      const validPassword = await getService('user').validatePassword(
        params.password,
        user.password
      );

      if (!validPassword) {
        throw new ValidationError('Invalid identifier or password');
      } else {
        ctx.send({
          jwt: getService('jwt').issue({
            id: user.id,
          }),
          user: await sanitizeUser(user, ctx),
        });
      }
    } else {
      if (!_.get(await store.get({ key: 'grant' }), [provider, 'enabled'])) {
        throw new ApplicationError('This provider is disabled');
      }

      // Connect the user with the third-party provider.
      let user;
      let error;
      try {
        [user, error] = await getService('providers').connect(provider, ctx.query);
      } catch ([user, error]) {
        throw new ApplicationError(error.message);
      }

      if (!user) {
        throw new ApplicationError(error.message);
      }
      ctx.send({
        jwt: getService('jwt').issue({ id: user.id }),
        user: await sanitizeUser(user, ctx),
      });
    }
  },

  async register(ctx) {
    const pluginStore = await strapi.store({ type: 'plugin', name: 'users-permissions' });

    const settings = await pluginStore.get({
      key: 'advanced',
    });

    if (!settings.allow_register) {
      throw new ApplicationError('Register action is currently disabled');
    }

    const params = {
      ..._.omit(ctx.request.body, ['confirmed', 'confirmationToken', 'resetPasswordToken']),
      provider: 'local',
    };

    await validateRegisterBody(params);

    // Throw an error if the password selected by the user
    // contains more than three times the symbol '$'.
    if (getService('user').isHashed(params.password)) {
      throw new ValidationError(
        'Your password cannot contain more than three times the symbol `$`'
      );
    }

/*    const role = await strapi
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: settings.default_role } });

    if (!role) {
      throw new ApplicationError('Impossible to find the default role');
    }*/

    // Check if the provided email is valid or not.
    const isEmail = emailRegExp.test(params.email);

    if (isEmail) {
      params.email = params.email.toLowerCase();
    } else {
      throw new ValidationError('Please provide a valid email address');
    }

    //params.role = role.id;
    params.password = await getService('user').hashPassword(params);

    const user = await strapi.query('plugin::users-permissions.user').findOne({
      where: { email: params.email },
    });
    const user2 = await strapi.query('plugin::users-permissions.user').findOne({
      where: { username: params.username },
    });
    if(user2){
      throw new ApplicationError('Username is already taken');
    }
    if (user && user.provider === params.provider) {
      throw new ApplicationError('Email is already taken');
    }

    if (user && user.provider !== params.provider && settings.unique_email) {
      throw new ApplicationError('Email is already taken');
    }

    try {
      if (!settings.email_confirmation) {
        params.confirmed = true;
      }

        const user = await strapi.query('plugin::users-permissions.user').create({ data: params });
      //luxand cloud
      const options = {
        method: 'POST',
        url: "https://api.luxand.cloud/subject/v2",
        qs: {"name":params.username,"store":"1"},
        headers: {
          'token': "22fd1796f78149ff9bb2e25f758f5d0b"
        },
        formData: {
           photo: params.url
        }
      };


         request(options, async(error, response, body) => {
          const data = JSON.parse(body)

          if (error || (data.message !== 'Successfully created')) {
            await strapi.query('plugin::users-permissions.user').delete({where: {id: user.id}})
            console.log('Luxand cloud failed')
          }
        });




      const sanitizedUser = await sanitizeUser(user, ctx);
      if (settings.email_confirmation) {
        try {
          await getService('user').sendConfirmationEmail(sanitizedUser);
        } catch (err) {
          throw new ApplicationError(err.message);
        }

        return ctx.send({ user: sanitizedUser });
      }

      const jwt = getService('jwt').issue(_.pick(user, ['id']));

      return ctx.send({
        jwt,
        user: sanitizedUser,
      });
    } catch (err) {
      console.log(err.message);
      if (_.includes(err.message, 'username')) {
        throw new ApplicationError('Username already taken');
      } else {
        throw new ApplicationError('Email already taken 3');
      }
    }
  },
}
