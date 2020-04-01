const router = require('express').Router();
const taskController = require('../controllers/tasks');
const categoryController = require('../controllers/categories');
const userController = require('../controllers/users');
const middlewares = require('../middleware');

router.post("/users", middlewares.authHeaderCheck, middlewares.authenticateUser, userController.createUser);

router.get("/users/:userType/tasks", middlewares.authHeaderCheck, middlewares.setUser, taskController.getUserTasks);
router.post("/tasks", middlewares.authHeaderCheck, middlewares.setUser, taskController.createTask);
router.get("/tasks/:pincode/incomplete", middlewares.authHeaderCheck, taskController.getPendingTasks);
router.patch("/tasks/:taskId/assign", middlewares.authHeaderCheck, middlewares.setUser, taskController.assignTask);
router.patch("/tasks/:taskId/complete", middlewares.authHeaderCheck, middlewares.setUser, taskController.completeTask);
router.patch("/tasks/:taskId/cancel", middlewares.authHeaderCheck, middlewares.setUser, taskController.cancelTask);

router.get("/categories", categoryController.getCategories);

module.exports = router;