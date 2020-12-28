import ApplicationRegistry from './ApplicationRegistry'

import studentRoutes from './api/controllers/StudentController'
import authRoutes from './api/controllers/admin/AuthController'
import adminUserRoutes from './api/controllers/admin/AdminUserController'
import adminTimePeriodRoutes from './api/controllers/admin/AdminTimePeriodController'
import adminStudentRoutes from './api/controllers/admin/AdminStudentController'
import adminBellScheduleRoutes from './api/controllers/admin/AdminBellScheduleController'
import adminReportRoutes from './api/controllers/admin/AdminReportController'

// api routes
export function addApiRoutes (app, keycardPool, logger) {
  const registry = new ApplicationRegistry(keycardPool, logger)

  app.use('/student', studentRoutes(registry.createStudentService(), logger))
  app.use('/auth', authRoutes(registry.createUserService(), logger))
  app.use('/admin/users', adminUserRoutes(registry.createUserService(), logger))
  app.use('/admin/timeperiod', adminTimePeriodRoutes(registry.createTimePeriodService(), logger))
  app.use('/admin/student', adminStudentRoutes(registry.createStudentService(), logger))
  app.use('/admin/bellSchedule', adminBellScheduleRoutes(registry.createBellScheduleService(), logger))
  app.use('/admin/report', adminReportRoutes(registry.createReportService(), logger))
}
