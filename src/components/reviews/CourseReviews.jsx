"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";
import { Separator } from "@/components/ui/separator";

const CourseReviews = ({ courseId }) => {
  const [userReview, setUserReview] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUserReview();
    }
  }, [user, courseId]);

  const fetchUserReview = async () => {
    try {
      const response = await fetch(`/api/reviews/${courseId}`);
      const data = await response.json();

      if (response.ok && data.reviews) {
        const myReview = data.reviews.find((r) => r.userId === user.email);
        setUserReview(myReview || null);
      }
    } catch (error) {
      console.error("Error fetching user review:", error);
    }
  };

  const handleReviewSubmitted = (review) => {
    setUserReview(review);
    setEditingReview(null);
    // Force refresh of the entire reviews list
    setRefreshKey(prev => prev + 1);
    // Small delay to ensure backend has processed
    setTimeout(() => {
      fetchUserReview();
    }, 500);
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setUserReview(review);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
  };

  const handleReviewDeleted = () => {
    setUserReview(null);
    setEditingReview(null);
    setRefreshKey(prev => prev + 1);
    fetchUserReview();
  };

  return (
    <div className="space-y-8">
      {/* Review Form - Show only if user hasn't reviewed OR is editing */}
      {user && (!userReview || editingReview) && (
        <>
          <ReviewForm
            courseId={courseId}
            existingReview={editingReview}
            onReviewSubmitted={handleReviewSubmitted}
            onCancel={editingReview ? handleCancelEdit : null}
          />
          <Separator />
        </>
      )}

      {/* Show message if user already reviewed and not editing */}
      {user && userReview && !editingReview && (
        <>
          <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              You have already reviewed this course. You can edit or delete your review below.
            </p>
          </div>
          <Separator />
        </>
      )}

      {/* Reviews List */}
      <ReviewList
        key={refreshKey}
        courseId={courseId}
        onEditReview={handleEditReview}
        onReviewDeleted={handleReviewDeleted}
        onReviewsUpdated={fetchUserReview}
        refreshTrigger={refreshKey}
      />
    </div>
  );
};

export default CourseReviews;
