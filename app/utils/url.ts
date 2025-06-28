export const getAbsoluteUrl = (path: string) => {
  const baseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  return `${baseUrl}${path}`;
};
