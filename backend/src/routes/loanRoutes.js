
const express = require('express');
const loanController = require('../controllers/loanController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Reader requests to borrow a book
router.post('/request', protect, authorize('reader'), loanController.requestLoan);

// Admin/Staff manage loans
router.route('/')
  .get(protect, authorize('admin', 'staff', 'reader'), loanController.getLoans); // Get all loans (admin/staff) or user's loans (reader)

router.route('/:id')
  .get(protect, authorize('admin', 'staff', 'reader'), loanController.getLoan); // Get specific loan

router.put('/:id/confirm', protect, authorize('admin', 'staff'), loanController.confirmLoan); // Confirm a loan
router.put('/:id/return', protect, authorize('admin', 'staff', 'reader'), loanController.processReturn); // Process a return
router.put('/:id/cancel', protect, authorize('admin', 'staff', 'reader'), loanController.cancelLoan); // Cancel a pending loan
//router.put('/:id/return', protect, authorize('admin', 'staff', 'reader'), loanController.returnBook);
// Calendar view
router.get('/calendar', protect, authorize('admin', 'staff', 'reader'), loanController.getLoansForCalendar);


module.exports = router;