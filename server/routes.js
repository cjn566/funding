import ApplicationRegistry from './ApplicationRegistry'

import mainRoutes from './api/controllers/MainController'

// api routes
export function addApiRoutes (app, keycardPool, logger) {
  const registry = new ApplicationRegistry(keycardPool, logger)
  app.use('/app', mainRoutes(registry.createMainService(), logger))
}
