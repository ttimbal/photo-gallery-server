const {callback,register}=require('./controllers/auth')

module.exports = (plugin) => {
  plugin.controllers.auth.callback = callback;
  plugin.controllers.auth.register = register;

  return plugin;
};
