const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const authMiddleware = require('../middlewares/authMiddleware');

// router.use(authMiddleware);

router.get('/:boardId/cards/:cardId', authMiddleware, cardController.getCardDetails);
router.get('/:boardId/cards', authMiddleware, cardController.getCardsByBoard);
router.post('/:boardId/cards', authMiddleware, cardController.createCard);

router.delete('/:boardId/cards/:cardId', authMiddleware, cardController.deleteCard);
router.patch('/:boardId/cards/:cardId', authMiddleware, cardController.updateCard);
router.get('/:boardId/cards/user/:userId', authMiddleware, cardController.getCardsByUser);

router.delete('/:boardId/cards/:cardId/tasks/:taskId/assign/:memberId', authMiddleware, cardController.unassignTaskMember);
router.get('/:boardId/cards/:cardId/tasks/:taskId/assign', authMiddleware, cardController.getTaskAssignment);
router.post('/:boardId/cards/:cardId/tasks/:taskId/assign', authMiddleware, cardController.assignTaskMember);
router.get('/:boardId/cards/:cardId/tasks/:taskId', authMiddleware, cardController.getTaskDetails);
router.put('/:boardId/cards/:cardId/tasks/:taskId', authMiddleware, cardController.updateTaskStatus);
router.delete('/:boardId/cards/:cardId/tasks/:taskId', authMiddleware, cardController.deleteTask);
router.post('/:boardId/cards/:cardId/tasks', authMiddleware, cardController.addTaskToCard);
router.get('/:boardId/cards/:cardId/tasks', authMiddleware, cardController.getTasksByCard);



module.exports = router;