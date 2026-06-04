"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import ErrorMessage from "@/components/common/ErrorMessage";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Textarea from "@/components/common/Textarea";

const priorityOptions = [
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

const statusOptions = [
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
];

const defaultFormData = {
  title: "",
  description: "",
  project: "",
  assignedMember: "",
  dueDate: "",
  priority: "medium",
  status: "todo",
  attachments: "",
};

function getInitialFormData(initialData) {
  if (!initialData) return defaultFormData;

  return {
    title: initialData.title || "",
    description: initialData.description || "",
    project: initialData.project?._id || initialData.project || "",
    assignedMember:
      initialData.assignedMember?._id ||
      initialData.assignedTo?._id ||
      initialData.assignedMember ||
      initialData.assignedTo ||
      "",
    dueDate: initialData.dueDate?.slice(0, 10) || "",
    priority: initialData.priority || "medium",
    status: initialData.status || "todo",
    attachments: Array.isArray(initialData.attachments)
      ? initialData.attachments.join(", ")
      : initialData.attachments || "",
  };
}

export default function TaskForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  projects = [],
  users = [],
}) {
  const [formData, setFormData] = useState(getInitialFormData(initialData));
  const [error, setError] = useState("");

  const projectOptions = [
    { label: "Select project", value: "" },
    ...projects.map((project) => ({
      label: project.name,
      value: project._id,
    })),
  ];

  const userOptions = [
    { label: "Select member", value: "" },
    ...users.map((user) => ({
      label: `${user.name} (${user.role})`,
      value: user._id,
    })),
  ];

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function validateForm() {
    if (!formData.title.trim()) return "Task title is required.";
    if (!formData.description.trim()) return "Task description is required.";
    if (!formData.project) return "Project is required.";
    if (!formData.assignedMember) return "Assigned member is required.";
    if (!formData.dueDate) return "Due date is required.";

    return "";
  }

  function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    const attachments = formData.attachments
      .split(",")
      .map((attachment) => attachment.trim())
      .filter(Boolean);

    setError("");
    onSubmit({ ...formData, attachments });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error} />}

      <Input
        label="Title"
        name="title"
        onChange={handleInputChange}
        placeholder="Enter task title"
        required
        value={formData.title}
      />

      <Textarea
        label="Description"
        name="description"
        onChange={handleInputChange}
        placeholder="Describe the task"
        required
        value={formData.description}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Project"
          name="project"
          onChange={handleInputChange}
          options={projectOptions}
          required
          value={formData.project}
        />
        <Select
          label="Assigned Member"
          name="assignedMember"
          onChange={handleInputChange}
          options={userOptions}
          required
          value={formData.assignedMember}
        />
        <Input
          label="Due Date"
          name="dueDate"
          onChange={handleInputChange}
          required
          type="date"
          value={formData.dueDate}
        />
        <Select
          label="Priority"
          name="priority"
          onChange={handleInputChange}
          options={priorityOptions}
          value={formData.priority}
        />
        <Select
          label="Status"
          name="status"
          onChange={handleInputChange}
          options={statusOptions}
          value={formData.status}
        />
      </div>

      <Textarea
        label="Attachments"
        name="attachments"
        onChange={handleInputChange}
        placeholder="Add comma-separated URLs"
        rows={3}
        value={formData.attachments}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          className="w-full sm:w-auto"
          disabled={loading}
          onClick={onCancel}
          type="button"
          variant="outline"
        >
          Cancel
        </Button>
        <Button className="w-full sm:w-auto" disabled={loading} type="submit">
          {loading
            ? initialData
              ? "Updating..."
              : "Creating..."
            : initialData
              ? "Update Task"
              : "Create Task"}
        </Button>
      </div>
    </form>
  );
}
