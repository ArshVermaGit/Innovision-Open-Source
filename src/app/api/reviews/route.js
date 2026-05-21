import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getServerSession } from "@/lib/auth-server";


// POST - Submit a new review
export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { courseId, rating, reviewText } = await request.json();

    // Validation
    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (reviewText && reviewText.length > 1000) {
      return NextResponse.json(
        { error: "Review text must be less than 1000 characters" },
        { status: 400 }
      );
    }

    const userEmail = session.user.email;
    const userName = session.user.name || "Anonymous";
    const userImage = session.user.image || null;

    // Check if user already reviewed this course
    const existingReview = await adminDb
      .collection("reviews")
      .where("courseId", "==", courseId)
      .where("userId", "==", userEmail)
      .get();

    if (!existingReview.empty) {
      return NextResponse.json(
        { error: "You have already reviewed this course. Use PATCH to update." },
        { status: 400 }
      );
    }

    // Create review document
    const reviewData = {
      courseId,
      userId: userEmail,
      userName,
      userImage,
      rating,
      reviewText: reviewText || "",
      helpfulCount: 0,
      notHelpfulCount: 0,
      helpfulVotes: [], // Array of user emails who voted helpful
      notHelpfulVotes: [], // Array of user emails who voted not helpful
      reported: false,
      reportCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const reviewRef = await adminDb.collection("reviews").add(reviewData);

    // Update course average rating
    await updateCourseRating(courseId);

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully",
      reviewId: reviewRef.id,
      review: { id: reviewRef.id, ...reviewData },
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
}

// Helper function to update course average rating
async function updateCourseRating(courseId) {
  try {
    const reviewsSnapshot = await adminDb
      .collection("reviews")
      .where("courseId", "==", courseId)
      .where("reported", "==", false)
      .get();

    if (reviewsSnapshot.empty) {
      return;
    }

    let totalRating = 0;
    let count = 0;

    reviewsSnapshot.forEach((doc) => {
      totalRating += doc.data().rating;
      count++;
    });

    const averageRating = totalRating / count;

    // Store rating stats in a separate collection for quick access
    await adminDb
      .collection("courseRatings")
      .doc(courseId)
      .set(
        {
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          totalReviews: count,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
  } catch (error) {
    console.error("Error updating course rating:", error);
  }
}
