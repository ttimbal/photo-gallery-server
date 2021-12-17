module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/carts',
      handler: 'cart.create',
      config: {

      },
    },
    {
      method: 'DELETE',
      path: '/carts',
      handler: 'cart.deleteAll',
      config: {

      },
    },
  ],
};
