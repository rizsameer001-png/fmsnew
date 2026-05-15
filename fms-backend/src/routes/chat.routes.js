// const express = require('express');
// const router = express.Router();
// const { protect } = require('../middleware/auth.middleware');

// router.use(protect);

// // Chat routes
// router.get('/', (req, res) => {
//   res.json({ success: true, message: 'Get chats' });
// });

// router.get('/:chatId/messages', (req, res) => {
//   res.json({ success: true, message: 'Get messages' });
// });

// router.post('/send', (req, res) => {
//   res.json({ success: true, message: 'Message sent' });
// });

// router.put('/:chatId/read', (req, res) => {
//   res.json({ success: true, message: 'Messages marked as read' });
// });

// router.post('/group', (req, res) => {
//   res.json({ success: true, message: 'Group chat created' });
// });

// router.post('/:chatId/participants', (req, res) => {
//   res.json({ success: true, message: 'Participant added' });
// });

// router.delete('/:chatId/participants/:userId', (req, res) => {
//   res.json({ success: true, message: 'Participant removed' });
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getChats,
  getMessages,
  sendMessage,
  markAsRead,
  createGroupChat,
  addParticipant,
  removeParticipant,
  getSupportChat
} = require('../controllers/chat.controller');

// All routes require authentication
router.use(protect);

// Chat routes
router.get('/', getChats);
router.get('/support', getSupportChat);  // Add this line for support chat
router.get('/:chatId/messages', getMessages);
router.post('/send', sendMessage);
router.put('/:chatId/read', markAsRead);
router.post('/group', createGroupChat);
router.post('/:chatId/participants', addParticipant);
router.delete('/:chatId/participants/:userId', removeParticipant);

module.exports = router;