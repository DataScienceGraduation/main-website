"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getAbsoluteUrl } from "../../utils/url";

export default function ProfilingPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [profileHtml, setProfileHtml] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateProfile = async () => {
      if (!id) {
        setError("No model ID specified");
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in again.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          getAbsoluteUrl(`/aiapp/dataprofile?id=${id}`),
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result = await response.json();

        if (result.success) {
          setProfileHtml(result.html);
        } else {
          setError(`Profile generation failed: ${result.message}`);
        }
      } catch (error) {
        console.error("Error generating profile:", error);
        setError("Error generating data profile");
      } finally {
        setIsLoading(false);
      }
    };

    generateProfile();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-semibold">
            Generating Data Profile...
          </div>
          <div className="text-gray-600">
            Please wait while we analyze your data
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-2xl font-semibold text-red-600">Error</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {profileHtml && (
          <iframe
            srcDoc={profileHtml}
            title="Data Profile"
            style={{ width: "100%", height: "90vh", border: "none" }}
          />
        )}
      </div>
    </div>
  );
}