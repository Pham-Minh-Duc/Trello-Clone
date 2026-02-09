const express = require('express');
const router = express.Router();
const boardController = require('../controllers/boardController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, boardController.getBoards);
router.get('/:boardId', authMiddleware, boardController.getBoardDetails);
router.post('/', authMiddleware, boardController.createBoard);
router.patch('/:boardId', authMiddleware, boardController.updateBoard);
router.delete('/:boardId', authMiddleware, boardController.deleteBoard);

router.post('/:boardId/invite', authMiddleware, boardController.inviteMember);
router.post('/:boardId/cards/:cardId/invite/accept', authMiddleware, boardController.acceptInvitation);

module.exports = router;