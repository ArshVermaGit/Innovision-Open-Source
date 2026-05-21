"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StarRating from "./StarRating";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const ReviewForm = ({ courseId, existingReview, onReviewSubmitted, onCancel }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [reviewText, setReviewText] = useState(existingReview?.reviewText || "");
  const [loading, setLoading] = useState(false);

  const isEditing = !!existingReview;
  const charCount = reviewText.length;
  const maxChars = 1000;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setLoading(true);

    try {
      const url = isEditing
        ? `/api/reviews/${existingReview.id}`
        : "/api/reviews";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          rating,
          reviewText: reviewText.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || `Review ${isEditing ? "updated" : "submitted"} successfully`);
        if (onReviewSubmitted) {
          onReviewSubmitted(data.review);
        }
        if (!isEditing) {
          setRating(0);
          setReviewText("");
        }
      } else {
        toast.error(data.error || `Failed to ${isEditing ? "update" : "submit"} review`);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {isEditing ? "Edit Your Review" : "Write a Review"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Rating</label>
            <StarRating rating={rating} onRatingChange={setRating} size="lg" />
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Your Review <span className="text-muted-foreground">(Optional)</span>
            </label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this course..."
              className="min-h-32 resize-none"
              maxLength={maxChars}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Help others by sharing your thoughts</span>
              <span className={charCount > maxChars * 0.9 ? "text-orange-500" : ""}>
                {charCount}/{maxChars}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2">
            <Button type="submit" disabled={loading || rating === 0} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? "Updating..." : "Submitting..."}
                </>
              ) : (
                <>{isEditing ? "Update Review" : "Submit Review"}</>
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
