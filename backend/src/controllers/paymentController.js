
const paymentService = require('../services/paymentService');

// @desc    Create a payment intent (e.g., for a fine or deposit)
// @route   POST /api/payments/create-intent
// @access  Private/Reader, Staff, Admin
const createPaymentIntent = async (req, res, next) => {
  try {
    const { loanId, amount, paymentType } = req.body;
    const userId = req.user._id;

    if (!amount || !paymentType) {
      return res.status(400).json({ message: 'Amount and payment type are required.' });
    }
    if (loanId) {

    }

    const paymentIntent = await paymentService.createPaymentIntent(userId, loanId, amount, paymentType);
    res.status(201).json({ message: 'Payment intent created successfully.', payment: paymentIntent });
  } catch (error) {
    if (error.message.includes('Associated loan not found') || error.message.includes('No fine amount to pay') || error.message.includes('Payment amount is less')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};

// @desc    Process a created payment intent (mock Stripe/PayPal webhook)
// @route   POST /api/payments/:id/process
// @access  Private/Reader (simulated success from client), Staff, Admin
const processPayment = async (req, res, next) => {
  try {
    const { paymentMethod, billingDetails } = req.body; 
    
    const payment = await paymentService.processPayment(
        req.params.id, 
        paymentMethod, 
        billingDetails 
    );
    
    res.status(200).json({ message: 'Payment processed successfully', payment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private/Reader, Staff, Admin
const getPayments = async (req, res, next) => {
    try {
        const { page, limit, status, userId, search } = req.query;
        
        const pagination = { page: parseInt(page) || 1, limit: parseInt(limit) || 10 };
        const query = {};

        if (status) query.status = status;
        
        if (search) query.search = search;

        if (req.user.role === 'reader') {
            query.userId = req.user._id;
        } else if (userId) { 
            query.userId = userId;
        }

        const { payments, total } = await paymentService.getPayments(query, pagination);
        res.status(200).json({
            data: payments,
            total,
            page: pagination.page,
            pages: Math.ceil(total / pagination.limit),
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get a single payment by ID
// @route   GET /api/payments/:id
// @access  Private/Reader (for own payment), Staff, Admin
const getPayment = async (req, res, next) => {
    try {
        const paymentId = req.params.id;
        const payment = await paymentService.getPaymentById(paymentId);

        if (!payment) {
            return res.status(404).json({ message: 'Payment not found.' });
        }

        if (req.user._id.toString() !== payment.userId._id.toString() && !['admin', 'staff'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized to view this payment.' });
        }

        res.status(200).json(payment);
    } catch (error) {
        if (error.message.includes('Payment not found')) {
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
};


module.exports = {
  createPaymentIntent,
  processPayment,
  getPayments,
  getPayment
};