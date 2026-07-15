export function safeErrorResponse(error, context = "Operation") {
  const isDev = process.env.NODE_ENV === "development";

  console.error(`[${context}] Error:`, error);

  return Response.json(
    {
      error: isDev
        ? `${context} failed: ${error.message}`
        : `${context} failed. Please try again.`,
    },
    { status: 500 }
  );
}
