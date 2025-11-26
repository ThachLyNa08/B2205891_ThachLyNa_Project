
const express = require('express');
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh); 
// 1. Route bắt đầu login Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 2. Route Google trả về (Callback)
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Tạo Token JWT (Giống hệt hàm login thường của bạn)
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    
    // Chuyển hướng về Frontend kèm Token trên URL
    // Frontend sẽ bắt lấy token này
    res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${token}`);
  }
);

module.exports = router;