module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/events/my-events',
      handler: 'event.myEvents',
      config: {

      },
    },
    {
      method: 'PUT',
      path: '/events/:id/add-member',
      handler: 'event.addMember',
      config: {

      },
    },
    {
      method: 'PUT',
      path: '/events/:id/delete-member',
      handler: 'event.deleteMember',
      config: {

      },
    },
  ],
};
