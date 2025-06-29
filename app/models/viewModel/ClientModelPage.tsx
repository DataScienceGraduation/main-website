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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
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
                  <Table.Cell>
                    <Button 
                      size="sm" 
                      onClick={() => router.push(`/models/${model.id}/details`)}
                    >
                      View Details
                    </Button>
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
