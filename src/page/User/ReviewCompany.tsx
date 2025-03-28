import React, { useState, useEffect } from 'react';
import axiosInstance from '@/services/api/userInstance';

interface ReviewFormData {
  companyId: string;
  review: string;
  rating: number;
}

interface ReviewCompanyProps {
  companyId: string;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted?: () => void;
}

const ReviewCompany: React.FC<ReviewCompanyProps> = ({
  companyId,
  isOpen,
  onClose,
  onReviewSubmitted,
}) => {
  const [formData, setFormData] = useState<ReviewFormData>({
    companyId,
    review: '',
    rating: 0,
  });
  const [errors, setErrors] = useState<Partial<ReviewFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string>('');
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ companyId, review: '', rating: 0 });
      setErrors({});
      setSubmitMessage('');
      setIsSubmitting(false);
    }
  }, [companyId, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ReviewFormData> = {};
    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      newErrors.review = 'Please select a rating between 1 and 5'; 
    }
    if (!formData.review.trim()) {
      newErrors.review = 'Review cannot be empty';
    } else if (formData.review.length > 500) {
      newErrors.review = 'Review must be 500 characters or less';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value, 10) : value,
    }));
    if (errors[name as keyof ReviewFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await axiosInstance.post('/review', {
        ...formData,
        review: formData.review.trim(),
      });

      if (response.status === 201 || response.status === 200) {
        setSubmitMessage('Review submitted successfully!');
        onReviewSubmitted?.();
        setTimeout(() => {
          setIsClosing(true);
          window.close();
          setTimeout(onClose, 300);
        }, 1500);
      }
    } catch (error: any) {
      setSubmitMessage(
        error.response?.data?.message || 'Failed to submit review. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      {/* Modal Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-70'
        }`}
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div
        className={`relative z-50 w-full max-w-md p-6 mx-auto bg-gray-900 rounded-lg shadow-xl transform transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white focus:outline-none transition-colors duration-200"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Form Title */}
        <h2 className="text-2xl font-bold text-center text-white mb-6">Leave a Review</h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company ID Field */}
          <div>
            <label htmlFor="companyId" className="block text-sm font-medium text-gray-200">
              Company ID
            </label>
            <input
              type="text"
              id="companyId"
              name="companyId"
              value={formData.companyId}
              readOnly
              className="mt-1 block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm bg-gray-800 text-gray-300 cursor-not-allowed focus:outline-none"
            />
          </div>

          {/* Rating Field */}
          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-gray-200">
              Rating (1-5)
            </label>
            <select
              id="rating"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                errors.rating ? 'border-red-500' : 'border-gray-700'
              }`}
            >
              <option value="0" disabled className="text-gray-400">
                Select rating
              </option>
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num} className="text-white bg-gray-800">
                  {num} Star{num !== 1 ? 's' : ''}
                </option>
              ))}
            </select>
            {errors.rating && <p className="mt-1 text-sm text-red-400">{errors.rating}</p>}
          </div>

          {/* Review Textarea */}
          <div>
            <label htmlFor="review" className="block text-sm font-medium text-gray-200">
              Your Review
              <span className="ml-2 text-xs text-gray-400">
                ({formData.review.length}/500)
              </span>
            </label>
            <textarea
              id="review"
              name="review"
              value={formData.review}
              onChange={handleChange}
              placeholder="Share your experience..."
              rows={4}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                errors.review ? 'border-red-500' : 'border-gray-700'
              }`}
            />
            {errors.review && <p className="mt-1 text-sm text-red-400">{errors.review}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit Review'
            )}
          </button>

          {submitMessage && (
            <p
              className={`text-sm text-center transition-opacity duration-300 ${
                submitMessage.includes('success') ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {submitMessage}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default ReviewCompany;