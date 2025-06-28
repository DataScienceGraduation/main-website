"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Spinner,
  Table,
  Button,
  Badge,
  Alert,
  Toast,
} from "flowbite-react";
import { HiCheck, HiExclamation, HiInformationCircle } from "react-icons/hi";

import { getAbsoluteUrl } from "../../utils/url";

// Define TypeScript interfaces
interface Model {
  id: number;
  name: string;
  description: string;
  task: string;
  status: string;
  created_at: string;
}

const statusColors: { [key: string]: string } = {
  Done: "success",
  Pending: "gray",
  Training: "purple",
  Failed: "failure",
};

export default function ClientModelPage() {
  const router = useRouter();
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingReports, setGeneratingReports] = useState<{
    [key: number]: boolean;
  }>({});
  const [notification, setNotification] = useState<{
    type: "success" | "failure";
    message: string;
  } | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found.");
        }

        const response = await fetch(getAbsoluteUrl("/automl/list/"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch models");
        }
        const data = await response.json();
        setModels(data.models);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  const pollTaskStatus = (taskId: string, modelId: number) => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem("token");
        const statusResponse = await fetch(
          getAbsoluteUrl(`/aiapp/task-status/?task_id=${taskId}`),
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!statusResponse.ok) {
          // Stop polling on server error
          clearInterval(interval);
          throw new Error("Failed to get task status.");
        }

        const statusData = await statusResponse.json();

        if (statusData.status === "SUCCESS") {
          clearInterval(interval);
          const reportId = statusData.result;
          setNotification({
            type: "success",
            message: "Report generated successfully! Redirecting...",
          });
          setTimeout(() => router.push(`/reports/${reportId}`), 2000);
        } else if (statusData.status === "FAILURE") {
          clearInterval(interval);
          throw new Error(statusData.error || "Report generation failed.");
        }
        // If PENDING or PROGRESS, continue polling
      } catch (err: any) {
        clearInterval(interval);
        setError(err.message);
        setGeneratingReports((prev) => ({ ...prev, [modelId]: false }));
      }
    }, 3000); // Poll every 3 seconds
  };

  const handleGenerateReport = async (modelId: number) => {
    setGeneratingReports((prev) => ({ ...prev, [modelId]: true }));
    setError(null);
    setNotification(null);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(getAbsoluteUrl("/aiapp/generate/"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ model_id: modelId, async: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to start report generation.");
      }

      const data = await response.json();
      if (data.success && data.task_id) {
        setNotification({
          type: "success",
          message: "Report generation started... Please wait.",
        });
        pollTaskStatus(data.task_id, modelId);
      } else {
        throw new Error(data.message || "Could not start report generation.");
      }
    } catch (err: any) {
      setError(err.message);
      setGeneratingReports((prev) => ({ ...prev, [modelId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {notification && (
        <Toast className="fixed right-5 top-5 z-50">
          {notification.type === "success" ? (
            <HiCheck className="size-5 text-cyan-600" />
          ) : (
            <HiExclamation className="size-5 text-red-500" />
          )}
          <div className="pl-4 text-sm font-normal">{notification.message}</div>
        </Toast>
      )}

      <Card>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Your Models
        </h1>
        {error && (
          <Alert color="failure" icon={HiInformationCircle} className="mt-4">
            <span className="font-medium">Error!</span> {error}
          </Alert>
        )}
        <div className="overflow-x-auto">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Model Name</Table.HeadCell>
              <Table.HeadCell>Task</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Created</Table.HeadCell>
              <Table.HeadCell>
                <span className="sr-only">Actions</span>
              </Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {models.map((model) => (
                <Table.Row key={model.id} className="bg-white">
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900">
                    {model.name}
                  </Table.Cell>
                  <Table.Cell>{model.task}</Table.Cell>
                  <Table.Cell>
                    <Badge color={statusColors[model.status] || "gray"}>
                      {model.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(model.created_at).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => router.push(`/models/${model.id}/details`)}
                    >
                      View Details
                    </Button>
                    {model.status === "Done" && (
                      <Button
                        size="sm"
                        color="light"
                        onClick={() => handleGenerateReport(model.id)}
                        disabled={generatingReports[model.id]}
                      >
                        {generatingReports[model.id] ? (
                          <>
                            <Spinner size="sm" />
                            <span className="pl-3">Generating...</span>
                          </>
                        ) : (
                          "Generate Report"
                        )}
                      </Button>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </Card>
    </div>
  );
}
