import express from 'express';
import {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserRole,
  toggleUserStatus,
  getUserStats,
  assignRoutesToOperator,
  assignBusesToOperator,
  getCurrentUser,
  searchUsers,
  getUserAnalytics
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { 
  validateUserUpdate,
  validatePagination 
} from '../middleware/validation.js';

const router = express.Router();
// Explicit routes first
router.get('/profile', authenticate, getCurrentUser);
router.get('/search', authenticate, authorize('admin'), searchUsers);
router.get('/analytics', authenticate, authorize('admin'), getUserAnalytics);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, operator, commuter, driver]
 *         description: Filter by user role
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in username, email, or full name
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Admin access required
 */
router.get('/', authenticate, authorize('admin'), validatePagination, getAllUsers);

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get user statistics (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics including counts by role, activity, etc.
 *       403:
 *         description: Admin access required
 */
router.get('/stats', authenticate, authorize('admin'), getUserStats);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 *       403:
 *         description: Admin access required
 */
// Parameterized routes (must be last)
router.get('/:id', authenticate, authorize('admin'), getUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               email:
 *                 type: string
 *                 format: email
 *               fullName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, operator, commuter, driver]
 *               isActive:
 *                 type: boolean
 *               operatorDetails:
 *                 type: object
 *                 properties:
 *                   assignedRoutes:
 *                     type: array
 *                     items:
 *                       type: string
 *                   assignedBuses:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 *       403:
 *         description: Admin access required
 */
router.put('/:id', authenticate, authorize('admin'), validateUserUpdate, updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Cannot delete user with active assignments or own account
 *       404:
 *         description: User not found
 *       403:
 *         description: Admin access required
 */
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Update user role (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, operator, commuter, driver]
 *                 description: New role for the user
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Invalid role or cannot change own role
 *       404:
 *         description: User not found
 *       403:
 *         description: Admin access required
 */
router.patch('/:id/role', authenticate, authorize('admin'), updateUserRole);

/**
 * @swagger
 * /api/users/{id}/toggle:
 *   patch:
 *     summary: Toggle user active status (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User status toggled successfully
 *       400:
 *         description: Cannot deactivate own account
 *       404:
 *         description: User not found
 *       403:
 *         description: Admin access required
 */
router.patch('/:id/toggle', authenticate, authorize('admin'), toggleUserStatus);

/**
 * @swagger
 * /api/users/{id}/assign-routes:
 *   post:
 *     summary: Assign routes to operator (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Operator User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - routeIds
 *             properties:
 *               routeIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of route IDs to assign
 *     responses:
 *       200:
 *         description: Routes assigned successfully
 *       400:
 *         description: User must be operator or invalid route IDs
 *       404:
 *         description: User not found
 *       403:
 *         description: Admin access required
 */
router.post('/:id/assign-routes', authenticate, authorize('admin'), assignRoutesToOperator);

/**
 * @swagger
 * /api/users/{id}/assign-buses:
 *   post:
 *     summary: Assign buses to operator (Admin only)
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Operator User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - busIds
 *             properties:
 *               busIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of bus IDs to assign
 *     responses:
 *       200:
 *         description: Buses assigned successfully
 *       400:
 *         description: User must be operator or invalid bus IDs
 *       404:
 *         description: User not found
 *       403:
 *         description: Admin access required
 */
router.post('/:id/assign-buses', authenticate, authorize('admin'), assignBusesToOperator);

export default router;
// Parameterized routes (must be last)
router.get('/:id', authenticate, authorize('admin'), getUser);
router.put('/:id', authenticate, authorize('admin'), validateUserUpdate, updateUser);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);
router.patch('/:id/role', authenticate, authorize('admin'), updateUserRole);
router.patch('/:id/toggle', authenticate, authorize('admin'), toggleUserStatus);
router.post('/:id/assign-routes', authenticate, authorize('admin'), assignRoutesToOperator);
router.post('/:id/assign-buses', authenticate, authorize('admin'), assignBusesToOperator);