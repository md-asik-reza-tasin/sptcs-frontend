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
}) {
  const [formData, setFormData] = useState(getInitialFormData(initialData));
  const [error, setError] = useState("");

  function handleInputChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function validateForm() {
    if (!formData.name.trim()) {
      return "Project name is required.";
    }

    if (!formData.description.trim()) {
      return "Project description is required.";
    }

    if (!formData.deadline) {
      return "Project deadline is required.";
    }

    return "";
  }

  function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    onSubmit(formData);
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error && <ErrorMessage message={error} />}

      <Input
        label="Project Name"
        name="name"
        onChange={handleInputChange}
        placeholder="Enter project name"
        required
        value={formData.name}
      />

      <Textarea
        label="Description"
        name="description"
        onChange={handleInputChange}
        placeholder="Describe the project"
        required
        value={formData.description}
      />

      <Input
        label="Deadline"
        name="deadline"
        onChange={handleInputChange}
        required
        type="date"
        value={formData.deadline}
      />

      <Select
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
