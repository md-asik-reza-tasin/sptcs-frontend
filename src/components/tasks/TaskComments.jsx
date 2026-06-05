"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import EmptyState from "@/components/common/EmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import Textarea from "@/components/common/Textarea";
import useAuth from "@/hooks/useAuth";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/errors";

function formatDate(date) {
  if (!date) return "No date";

  return new Date(date).toLocaleString();
}

export default function TaskComments({ task, onCommentAdded }) {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const comments = task?.comments || [];
  const canAddComment = user?.role === "admin" || user?.role === "manager";

  function handleMessageChange(event) {
    setMessage(event.target.value);
    setFieldError("");
    setFormError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!canAddComment) {
      return;
    }

    if (!message.trim()) {
      setFieldError("Comment message is required");
      return;
    }

    setLoading(true);
    setFieldError("");
    setFormError("");

    try {
      await api.post(`/api/tasks/${task._id}/comments`, { message });
      setMessage("");
      await onCommentAdded();
    } catch (error) {
      setFormError(getErrorMessage(error, "Failed to add comment."));
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
                {comment.user?.name || "User"}
                {comment.user?.role ? ` (${comment.user.role})` : ""} -{" "}
                {formatDate(comment.createdAt)}
              </p>
            </div>
          ))
        ) : (
          <EmptyState title="No comments yet" />
        )}
      </div>

      {!canAddComment ? (
        <p className="rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600">
          You can view comments, but only managers/admins can add new comments.
        </p>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <ErrorMessage message={formError} />
          <Textarea
            error={fieldError}
            label="Add Comment"
            name="message"
            onChange={handleMessageChange}
            placeholder="Write a comment"
            value={message}
          />
          <Button className="w-full sm:w-auto" disabled={loading} type="submit">
            {loading ? "Adding..." : "Add Comment"}
          </Button>
        </form>
      )}
    </div>
  );
}
