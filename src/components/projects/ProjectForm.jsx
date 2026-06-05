"use client";

import { useState } from "react";
import Button from "@/components/common/Button";
import ErrorMessage from "@/components/common/ErrorMessage";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Textarea from "@/components/common/Textarea";

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "On Hold", value: "on_hold" },
];

const defaultFormData = {
  name: "",
  description: "",
  deadline: "",
  status: "active",
};

function getInitialFormData(initialData) {
  if (!initialData) {
    return defaultFormData;
  }

  return {
    name: initialData.name || "",
    description: initialData.description || "",
    deadline: initialData.deadline?.slice(0, 10) || "",
    status: initialData.status || "active",
  };
}

export default function ProjectForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
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

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
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

    if (!formData.name.trim()) {
      errors.name = "Project name is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Project description is required";
    }

    if (!formData.deadline) {
      errors.deadline = "Project deadline is required";
    }

    if (!formData.status) {
      errors.status = "Project status is required";
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

    setFieldErrors({});
    setClearedExternalErrors({});
    setFormError("");
    onSubmit(formData);
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <ErrorMessage message={displayFormError} />

      <Input
        error={getFieldError("name")}
        label="Project Name"
        name="name"
        onChange={handleInputChange}
        placeholder="Enter project name"
        required
        value={formData.name}
      />

      <Textarea
        error={getFieldError("description")}
        label="Description"
        name="description"
        onChange={handleInputChange}
        placeholder="Describe the project"
        required
        value={formData.description}
      />

      <Input
        error={getFieldError("deadline")}
        label="Deadline"
        name="deadline"
        onChange={handleInputChange}
        required
        type="date"
        value={formData.deadline}
      />

      <Select
        error={getFieldError("status")}
        label="Status"
        name="status"
        onChange={handleInputChange}
        options={statusOptions}
        value={formData.status}
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
              ? "Update Project"
              : "Create Project"}
        </Button>
      </div>
    </form>
  );
}
