/**
 * @file goal.route.js
 * @module routes/goalRoutes
 * @description Endpoint routing mapping for mental wellness wizard workflows and Gemini AI pipelines.
 */

const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todo.controller');
const { opaqueAuthMiddleware } = require('../middlewares/auth.middleware');

/**
 * @route   POST /api/v1/todo/create-todo
 * @access  Private
 */
router.post('/create-todo', opaqueAuthMiddleware, todoController.createTodo);

/**
 * @route   GET /api/v1/todo/get-all-todos
 * @access  Private
 */
router.get('/get-all-todos', opaqueAuthMiddleware, todoController.getAllTodos);

/**
 * @route   PATCH /api/v1/todo/update-todo/:todoId
 * @access  Private
 */
router.patch(
  '/update-todo/:todoId',
  opaqueAuthMiddleware,
  todoController.updateTodo
);

/**
 * @route   DELETE /api/v1/todo/delete-todo/:todoId
 * @access  Private
 */
router.delete(
  '/delete-todo/:todoId',
  opaqueAuthMiddleware,
  todoController.deleteTodo
);

/**
 * @route   PATCH /api/v1/todo/toggle-todo-complete/:todoId
 * @access  Private
 */
router.patch(
  '/toggle-todo-complete/:todoId',
  opaqueAuthMiddleware,
  todoController.toggleTodoCompletion
);

module.exports = router;
