import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getServerSession } from "@/lib/auth-server";

// POST - Vote on a review (helpful or not helpful)
export async function POST(request, { params }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: reviewId } = await params;
    const { voteType } = await request.json(); // "helpful" or "not_helpful"

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    if (!voteType || !["helpful", "not_helpful"].includes(voteType)) {
      return NextResponse.json(
        { error: "Vote type must be 'helpful' or 'not_helpful'" },
        { status: 400 }
      );
    }

    const userEmail = session.user.email;

    // Get the review
    const reviewRef = adminDb.collection("reviews").doc(reviewId);
    const reviewDoc = await reviewRef.get();

    if (!reviewDoc.exists) {
      return NextResponse.json(
        { error: "Review not found" },
        { status: 404 }
      );
    }

    const reviewData = reviewDoc.data();

    // Check if user is trying to vote on their own review
    if (reviewData.userId === userEmail) {
      return NextResponse.json(
        { error: "You cannot vote on your own review" },
        { status: 400 }
      );
    }

    const helpfulVotes = reviewData.helpfulVotes || [];
    const notHelpfulVotes = reviewData.notHelpfulVotes || [];

    let updateData = {};

    if (voteType === "helpful") {
      // Check if already voted helpful
      if (helpfulVotes.includes(userEmail)) {
        // Remove helpful vote
        updateData.helpfulVotes = helpfulVotes.filter((email) => email !== userEmail);
        updateData.helpfulCount = (reviewData.helpfulCount || 0) - 1;
      } else {
        // Add helpful vote
        updateData.helpfulVotes = [...helpfulVotes, userEmail];
        updateData.helpfulCount = (reviewData.helpfulCount || 0) + 1;

        // Remove not helpful vote if exists
        if (notHelpfulVotes.includes(userEmail)) {
          updateData.notHelpfulVotes = notHelpfulVotes.filter(
            (email) => email !== userEmail
          );
          updateData.notHelpfulCount = Math.max(
            (reviewData.notHelpfulCount || 0) - 1,
            0
          );
        }
      }
    } else if (voteType === "not_helpful") {
      // Check if already voted not helpful
      if (notHelpfulVotes.includes(userEmail)) {
        // Remove not helpful vote
        updateData.notHelpfulVotes = notHelpfulVotes.filter(
          (email) => email !== userEmail
        );
        updateData.notHelpfulCount = Math.max(
          (reviewData.notHelpfulCount || 0) - 1,
          0
        );
      } else {
        // Add not helpful vote
        updateData.notHelpfulVotes = [...notHelpfulVotes, userEmail];
        updateData.notHelpfulCount = (reviewData.notHelpfulCount || 0) + 1;

        // Remove helpful vote if exists
        if (helpfulVotes.includes(userEmail)) {
          updateData.helpfulVotes = helpfulVotes.filter(
            (email) => email !== userEmail
          );
          updateData.helpfulCount = Math.max(
            (reviewData.helpfulCount || 0) - 1,
            0
          );
        }
      }
    }

    await reviewRef.update(updateData);

    return NextResponse.json({
      success: true,
      message: "Vote recorded successfully",
      helpfulCount: updateData.helpfulCount ?? reviewData.helpfulCount,
      notHelpfulCount: updateData.notHelpfulCount ?? reviewData.notHelpfulCount,
    });
  } catch (error) {
    console.error("Error voting on review:", error);
    return NextResponse.json(
      { error: "Failed to record vote" },
      { status: 500 }
    );
  }
}
