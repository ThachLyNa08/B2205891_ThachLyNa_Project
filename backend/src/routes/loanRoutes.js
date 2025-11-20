const express = require('express');
const loanController = require('../controllers/loanController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

/* --------------------------------------------------------
 * 1. STATIC ROUTES (ƯU TIÊN CAO)
 * -------------------------------------------------------- */

// Reader sends loan request
router.post(
  '/request',
  protect,
  authorize('reader'),
  loanController.requestLoan
);

// Loan stats
router.get(
  '/stats',
  protect,
  authorize('admin', 'staff'),
  loanController.getStats
);

// Calendar view
router.get(
  '/calendar',
  protect,
  authorize('admin', 'staff', 'reader'),
  loanController.getLoansForCalendar
);


/* --------------------------------------------------------
 * 2. COLLECTION ROUTES /loans
 * -------------------------------------------------------- */

// List all loans (admin/staff) or user's loans (reader)
router.get(
  '/',
  protect,
  authorize('admin', 'staff', 'reader'),
  loanController.getLoans
);


/* --------------------------------------------------------
 * 3. ACTION ROUTES ON A SPECIFIC RESOURCE
 * -------------------------------------------------------- */

// Confirm a pending loan
router.put(
  '/:id/confirm',
  protect,
  authorize('admin', 'staff'),
  loanController.confirmLoan
);

// Process returning a book
router.put(
  '/:id/return',
  protect,
  authorize('admin', 'staff', 'reader'),
  loanController.processReturn
);

// Cancel a pending loan
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


/* --------------------------------------------------------
 * 4. RESOURCE ROUTE /loans/:id
 * -------------------------------------------------------- */

// Get a specific loan details
router.get(
  '/:id',
  protect,
  authorize('admin', 'staff', 'reader'),
  loanController.getLoan
);


module.exports = router;
