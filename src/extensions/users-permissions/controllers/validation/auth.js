'use strict';

const { yup, validateYupSchema } = require('@strapi/utils');

const callbackBodySchema = yup.object().shape({
  identifier: yup.string().required(),
  password: yup.string().required(),
});

const registerBodySchema = yup.object().shape({
  username: yup.string().required(),
  profilePhoto: yup.number().required(),
  url: yup.string().required(),
  email: yup
    .string()
    .email()
    .required(),
  password: yup.string().required(),
  role: yup.string().required(),
  fullName:yup.string().required(),
});

const sendEmailConfirmationBodySchema = yup.object().shape({
  email: yup
    .string()
    .email()
    .required(),
});

module.exports = {
  validateCallbackBody: validateYupSchema(callbackBodySchema),
  validateRegisterBody: validateYupSchema(registerBodySchema),
  validateSendEmailConfirmationBody: validateYupSchema(sendEmailConfirmationBodySchema),
};
