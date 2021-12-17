module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/photos/event',
      handler: 'photo.event',
      config: {

      },
    },
    {
      method: 'GET',
      path: '/photos/you',
      handler: 'photo.you',
      config: {

      },
    },
    {
      method: 'POST',
      path: '/photos/upload',
      handler: 'photo.upload',
      config: {

      },
    },
  ],
};
