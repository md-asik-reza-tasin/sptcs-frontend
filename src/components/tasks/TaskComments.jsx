"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import Textarea from "@/components/common/Textarea";
import api from "@/lib/api";

function formatDate(date) {
  if (!date) return "No date";

  return new Date(date).toLocaleString();
}

export default function TaskComments({ task, onCommentAdded }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const comments = task?.comments || [];

  async function handleSubmit(event) {
    event.preventDefault();

    if (!message.trim()) {
      setError("Comment message is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post(`/api/tasks/${task._id}/comments`, { message });
      setMessage("");
      await onCommentAdded();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add comment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div
              className="rounded-md border border-slate-200 p-4"
              key={comment._id || index}
            >
              <p className="text-sm text-slate-800">{comment.message}</p>
              <p className="mt-2 text-xs text-slate-500">
                {comment.user?.name || "User"} - {formatDate(comment.createdAt)}
              </p>
            </div>
          ))
        ) : (
          <EmptyState title="No comments yet" />
        )}
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <ErrorMessage message={error} />
        <Textarea
          label="Add Comment"
          name="message"
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Write a comment"
          value={message}
        />
        <Button className="w-full sm:w-auto" disabled={loading} type="submit">
          {loading ? "Adding..." : "Add Comment"}
        </Button>
      </form>
    </div>
  );
}
