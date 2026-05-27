// routes/reviewRoutes.js
import express from 'express';
import { submitReview, getReviews, approveReview, featureReview, getApprovedReviews } from '../Controllers/reveiwController.js';
import { requireSignIn, isAdmin } from '../Middlewares/AuthMiddleware.js';

const router = express.Router();

// Submit a review — public (logged in users get user_id from localStorage; guests get guest note)
router.post('/submit', submitReview);

// Admin routes — require auth + admin role
router.get('/admin/reviews', requireSignIn, isAdmin, getReviews);
router.put('/admin/reviews/approve/:reviewId', requireSignIn, isAdmin, approveReview);
router.put('/admin/reviews/feature/:reviewId', requireSignIn, isAdmin, featureReview);

// Route to get only approved reviews (public)
router.get("/approved", getApprovedReviews);

export default router;

