export function getErrorMessage(
  error,
  fallback = "Something went wrong. Please try again.",
) {
  return error?.response?.data?.message || fallback;
}

export function mapTaskErrorToField(message) {
  if (message === "This task already exists in the project.") {
    return { title: message };
  }

  if (message === "Please select a valid deadline.") {
    return { dueDate: message };
  }

  if (message === "Completed tasks cannot be reassigned.") {
    return { assignedMember: message };
  }

  if (message === "Assigned member must be part of this project") {
    return { assignedMember: message };
  }

  return { form: message };
}

export function mapProjectErrorToField(message) {
  if (message === "Deadline cannot be in the past") {
    return { deadline: message };
  }

  if (message === "Name, description, and deadline are required") {
    return { form: message };
  }

  return { form: message };
}

export function mapProjectMemberErrorToField(message) {
  if (message === "User already added to this project") {
    return { userId: message };
  }

  if (message === "User is required") {
    return { userId: message };
  }

  return { form: message };
}
