export default function ErrorMessage({ message }) {
  const displayMessage = message || "Something went wrong. Please try again.";

  return (
    <p className="break-words rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
      {displayMessage}
    </p>
  );
}
