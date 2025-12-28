/**
 * Rating Modal Component
 * Modal for submitting ratings after food pickup completion
 */

import { useState } from 'react';
import { FiX, FiStar, FiCheck } from 'react-icons/fi';
import { RatingInput } from './Rating';
import api from '../lib/axios';
import toast from 'react-hot-toast';

const RatingModal = ({ 
  isOpen, 
  onClose, 
  requestId,
  ratingType, // 'donor_to_receiver' or 'receiver_to_donor'
  targetName, // Name of the person being rated
  onRatingSubmitted,
}) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/ratings', {
        requestId,
        rating,
        feedback: feedback.trim(),
      });
      
      toast.success('Thank you for your feedback!');
      onRatingSubmitted?.();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = () => {
    switch (rating) {
      case 1: return '😞 Poor';
      case 2: return '😐 Fair';
      case 3: return '🙂 Good';
      case 4: return '😊 Very Good';
      case 5: return '🤩 Excellent';
      default: return 'Tap to rate';
    }
  };

  const title = ratingType === 'donor_to_receiver' 
    ? 'Rate the Receiver' 
    : 'Rate the Donor';

  const description = ratingType === 'donor_to_receiver'
    ? 'How was your experience with the receiver?'
    : 'How was your experience with the donor?';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Target Info */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl font-bold text-primary-500">
              {targetName?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          <p className="font-medium text-gray-800">{targetName}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>

        {/* Rating Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div className="text-center">
            <RatingInput 
              value={rating} 
              onChange={setRating}
              disabled={submitting}
            />
            <p className="mt-2 text-lg font-medium text-gray-600">
              {getRatingLabel()}
            </p>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Share your experience (optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={3}
              maxLength={500}
              disabled={submitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">
              {feedback.length}/500
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={rating === 0 || submitting}
            className="w-full py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {submitting ? (
              <>
                <span className="animate-spin">⏳</span>
                Submitting...
              </>
            ) : (
              <>
                <FiCheck />
                Submit Rating
              </>
            )}
          </button>

          {/* Skip Option */}
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm"
          >
            Skip for now
          </button>
        </form>

        {/* Info */}
        <p className="text-xs text-center text-gray-400 mt-4">
          Your rating helps build trust in our community and may help you earn a Trusted badge!
        </p>
      </div>
    </div>
  );
};

export default RatingModal;
