const express = require('express');
const loanController = require('../controllers/loanController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
  '/request',
  protect,
  authorize('reader'),
  loanController.requestLoan
);

router.get(
  '/stats',
  protect,
  authorize('admin', 'staff'),
  loanController.getStats
);

router.get(
  '/calendar',
  protect,
  authorize('admin', 'staff', 'reader'),
  loanController.getLoansForCalendar
);

router.get(
  '/',
  protect,
  authorize('admin', 'staff', 'reader'),
  loanController.getLoans
);

router.put(
  '/:id/confirm',
  protect,
  authorize('admin', 'staff'),
  loanController.confirmLoan
);

router.put(
  '/:id/return',
  protect,
  authorize('admin', 'staff', 'reader'),
  loanController.processReturn
);

router.put(
  '/:id/cancel',
  protect,
  authorize('admin', 'staff', 'reader'),
  loanController.cancelLoan
);
router.delete(
  '/:id',
  protect,
  authorize('admin'),
  loanController.deleteLoan
);
router.put('/:id/pay-fine', protect, loanController.payFine);

router.get(
  '/:id',
  protect,
  authorize('admin', 'staff', 'reader'),
  loanController.getLoan
);




module.exports = router;
