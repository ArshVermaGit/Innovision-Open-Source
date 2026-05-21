"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import StarRating from "./StarRating";
import { ThumbsUp, ThumbsDown, MoreVertical, Pencil, Trash2, Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { formatDistanceToNow } from "date-fns";

const ReviewList = ({ courseId, onEditReview, onReviewDeleted, onReviewsUpdated, refreshTrigger }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, [courseId, sortBy, refreshTrigger]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reviews/${courseId}?sortBy=${sortBy}`);
      const data = await response.json();

      console.log("Reviews API response:", response.status, data);

      if (response.ok) {
        setReviews(data.reviews || []);
        setStats(data.stats || null);
      } else {
        console.error("Failed to load reviews:", data);
        toast.error(data.error || "Failed to load reviews");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (reviewId, voteType) => {
    if (!user) {
      toast.error("Please sign in to vote");
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state
        setReviews((prev) =>
          prev.map((review) =>
            review.id === reviewId
              ? {
                ...review,
                helpfulCount: data.helpfulCount,
                notHelpfulCount: data.notHelpfulCount,
              }
              : review
          )
        );
        toast.success("Vote recorded");
        if (onReviewsUpdated) {
          onReviewsUpdated();
        }
      } else {
        toast.error(data.error || "Failed to vote");
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Failed to vote");
    }
  };

  const handleDelete = async () => {
    if (!selectedReview) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/reviews/${selectedReview.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Review deleted successfully");
        setReviews((prev) => prev.filter((r) => r.id !== selectedReview.id));
        setDeleteDialogOpen(false);
        setSelectedReview(null);
        if (onReviewDeleted) {
          onReviewDeleted();
        }
      } else {
        toast.error(data.error || "Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReport = async () => {
    if (!selectedReview || !reportReason.trim()) {
      toast.error("Please provide a reason for reporting");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/reviews/${selectedReview.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setReportDialogOpen(false);
        setSelectedReview(null);
        setReportReason("");
      } else {
        toast.error(data.error || "Failed to report review");
      }
    } catch (error) {
      console.error("Error reporting review:", error);
      toast.error("Failed to report review");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {stats && stats.totalReviews > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold">{stats.averageRating}</div>
                <StarRating rating={stats.averageRating} readonly size="sm" />
                <div className="text-sm text-muted-foreground mt-1">
                  {stats.totalReviews} {stats.totalReviews === 1 ? "review" : "reviews"}
                </div>
              </div>
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-sm w-8">{star} ★</span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{
                          width: `${stats.totalReviews > 0
                            ? (stats.distribution[star] / stats.totalReviews) * 100
                            : 0
                            }%`,
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">
                      {stats.distribution[star]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sort Controls */}
      {reviews.length > 0 && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
          </h3>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-45">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest">Highest Rated</SelectItem>
              <SelectItem value="lowest">Lowest Rated</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <p>No reviews yet. Be the first to review this course!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const isOwnReview = user && review.userId === user.email;
            const timeAgo = formatDistanceToNow(new Date(review.createdAt), {
              addSuffix: true,
            });

            return (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar>
                        <AvatarImage src={review.userImage} />
                        <AvatarFallback>
                          {review.userName?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div>
                          <div className="font-semibold">{review.userName}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <StarRating rating={review.rating} readonly size="sm" />
                            <span className="text-xs text-muted-foreground">{timeAgo}</span>
                          </div>
                        </div>
                        {review.reviewText && (
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {review.reviewText}
                          </p>
                        )}
                        <div className="flex items-center gap-4 pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote(review.id, "helpful")}
                            className="gap-1 h-8"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                            <span className="text-xs">{review.helpfulCount || 0}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVote(review.id, "not_helpful")}
                            className="gap-1 h-8"
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                            <span className="text-xs">{review.notHelpfulCount || 0}</span>
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    {user && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isOwnReview ? (
                            <>
                              <DropdownMenuItem onClick={() => onEditReview(review)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit Review
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedReview(review);
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Review
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedReview(review);
                                setReportDialogOpen(true);
                              }}
                            >
                              <Flag className="h-4 w-4 mr-2" />
                              Report Review
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Your review will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Dialog */}
      <AlertDialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report Review</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for reporting this review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <textarea
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            placeholder="Describe why this review should be reported..."
            className="w-full min-h-32 p-3 border rounded-md resize-none"
            maxLength={500}
          />
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReport} disabled={actionLoading || !reportReason.trim()}>
              {actionLoading ? "Reporting..." : "Report"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReviewList;
