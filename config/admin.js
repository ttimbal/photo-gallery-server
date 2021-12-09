module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', 'd709204d18ca6d396bf0240ee07a57a9'),
  },
});
