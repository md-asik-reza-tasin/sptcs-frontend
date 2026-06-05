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

function getMemberUser(member, users) {
  if (member.user && typeof member.user === "object") {
    return member.user;
  }

  return users.find((user) => user._id === member.user);
}

function getMemberUserId(member) {
  return member.user?._id || member.user;
}

export default function TaskForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  projects = [],
  users = [],
  externalErrors = {},
}) {
  const [formData, setFormData] = useState(getInitialFormData(initialData));
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [clearedExternalErrors, setClearedExternalErrors] = useState({});

  function getFieldError(field) {
    if (fieldErrors[field]) {
      return fieldErrors[field];
    }

    if (clearedExternalErrors[field]) {
      return "";
    }

    return externalErrors[field] || "";
  }

  const displayFormError = formError || (
    clearedExternalErrors.form ? "" : externalErrors.form
  );

  const projectOptions = [
    { label: "Select project", value: "" },
    ...projects.map((project) => ({
      label: project.name,
      value: project._id,
    })),
  ];

  const selectedProject = projects.find((project) => {
    return project._id === formData.project;
  });
  const projectMembers = selectedProject?.members || [];
  const assignedMemberOptions = projectMembers
    .map((member) => {
      const user = getMemberUser(member, users);

      if (!user) return null;

      return {
        label: `${user.name} (${user.role})`,
        value: user._id,
      };
    })
    .filter(Boolean);
  const assignedMemberPlaceholder = !formData.project
    ? "Select a project first"
    : assignedMemberOptions.length === 0
      ? "No members in this project"
      : "Select member";
  const userOptions = [
    { label: assignedMemberPlaceholder, value: "" },
    ...assignedMemberOptions,
  ];

  function handleInputChange(event) {
    const { name, value } = event.target;
    let nextData = {
      ...formData,
      [name]: value,
    };

    if (name === "project") {
      const nextProject = projects.find((project) => project._id === value);
      const nextProjectMembers = nextProject?.members || [];
      const isAssignedMemberInProject = nextProjectMembers.some((member) => {
        return getMemberUserId(member)?.toString() === formData.assignedMember;
      });

      if (!isAssignedMemberInProject) {
        nextData = {
          ...nextData,
          assignedMember: "",
        };
      }
    }

    setFormData(nextData);
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));
    setClearedExternalErrors((currentErrors) => ({
      ...currentErrors,
      [name]: true,
      form: true,
    }));
    setFormError("");
  }

  function validateForm() {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = "Task title is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Task description is required";
    }

    if (!formData.project) {
      errors.project = "Project is required";
    }

    if (!formData.assignedMember) {
      errors.assignedMember = "Assigned member is required";
    }

    if (!formData.dueDate) {
      errors.dueDate = "Due date is required";
    }

    return errors;
  }

  function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setClearedExternalErrors({});
      setFormError("");
      return;
    }

    const attachments = formData.attachments
      .split(",")
      .map((attachment) => attachment.trim())
      .filter(Boolean);

    setFieldErrors({});
    setClearedExternalErrors({});
    setFormError("");
    onSubmit({ ...formData, attachments });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <ErrorMessage message={displayFormError} />

      <Input
        error={getFieldError("title")}
        label="Title"
        name="title"
        onChange={handleInputChange}
        placeholder="Enter task title"
        required
        value={formData.title}
      />

      <Textarea
        error={getFieldError("description")}
        label="Description"
        name="description"
        onChange={handleInputChange}
        placeholder="Describe the task"
        required
        value={formData.description}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          error={getFieldError("project")}
          label="Project"
          name="project"
          onChange={handleInputChange}
          options={projectOptions}
          required
          value={formData.project}
        />
        <Select
          disabled={!formData.project || assignedMemberOptions.length === 0}
          error={getFieldError("assignedMember")}
          label="Assigned Member"
          name="assignedMember"
          onChange={handleInputChange}
          options={userOptions}
          required
          value={formData.assignedMember}
        />
        <Input
          error={getFieldError("dueDate")}
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
