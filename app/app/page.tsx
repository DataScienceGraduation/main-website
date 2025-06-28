"use client";

import React, { useState, useEffect } from "react";
import { Card, Badge, Spinner, Alert, Button } from "flowbite-react";
import { Shapes } from "flowbite-react-icons/solid";
import { ChartMixed } from "flowbite-react-icons/outline";

import { getAbsoluteUrl } from "../utils/url";

export default function ModelsSection() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No authentication token found.");
      setLoading(false);
      return;
    }

    fetch(getAbsoluteUrl("/getAllModels/"), {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch models");
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setModels(data.data);
        } else {
          setError("Error retrieving models from backend");
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Error fetching models");
        setLoading(false);
      });
  }, []);

  const inProgressModels = models.filter((model) => model.status !== "Done");
  const finishedModels = models.filter((model) => model.status === "Done");

  const getBadgeColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "warning";
      case "Error":
      case "failed":
        return "failure";
      case "Finished":
      case "Done":
        return "success";
      default:
        return "info";
    }
  };

  const getTaskIcon = (task: string) => {
    switch (task) {
      case "Classification":
        return <Shapes width="24" height="24" viewBox="0 0 24 24" />;
      case "Regression":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.5 9.5C15.0523 9.5 15.5 9.05228 15.5 8.5C15.5 7.94772 15.0523 7.5 14.5 7.5C13.9477 7.5 13.5 7.94772 13.5 8.5C13.5 9.05228 13.9477 9.5 14.5 9.5Z"
              fill="#145E75"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4 3C4.55228 3 5 3.44772 5 4V19H20C20.5523 19 21 19.4477 21 20C21 20.5523 20.5523 21 20 21H5C4.46946 21 3.96083 20.7892 3.58586 20.4143C3.2107 20.0392 3 19.5304 3 19V4C3 3.44772 3.44772 3 4 3ZM20.244 4.33183C20.613 4.74273 20.5791 5.37499 20.1682 5.74401L17.9502 7.73592L13.1967 12.2175L8.70711 16.7071C8.31658 17.0976 7.68342 17.0976 7.29289 16.7071C6.90237 16.3166 6.90237 15.6834 7.29289 15.2929L11.7929 10.7929C11.7998 10.786 11.8069 10.7791 11.814 10.7724L16.587 6.27239L16.6048 6.25599L18.8318 4.25599C19.2427 3.88697 19.875 3.92092 20.244 4.33183Z"
              fill="#145E75"
            />
            <path
              d="M17.5 12.5C18.0523 12.5 18.5 12.0523 18.5 11.5C18.5 10.9477 18.0523 10.5 17.5 10.5C16.9477 10.5 16.5 10.9477 16.5 11.5C16.5 12.0523 16.9477 12.5 17.5 12.5Z"
              fill="#145E75"
            />
            <path
              d="M14.5 15.5C15.0523 15.5 15.5 15.0523 15.5 14.5C15.5 13.9477 15.0523 13.5 14.5 13.5C13.9477 13.5 13.5 13.9477 13.5 14.5C13.5 15.0523 13.9477 15.5 14.5 15.5Z"
              fill="#145E75"
            />
            <path
              d="M8.5 12.5C9.05228 12.5 9.5 12.0523 9.5 11.5C9.5 10.9477 9.05228 10.5 8.5 10.5C7.94772 10.5 7.5 10.9477 7.5 11.5C7.5 12.0523 7.94772 12.5 8.5 12.5Z"
              fill="#145E75"
            />
            <path
              d="M10.5 8.5C11.0523 8.5 11.5 8.05228 11.5 7.5C11.5 6.94772 11.0523 6.5 10.5 6.5C9.94772 6.5 9.5 6.94772 9.5 7.5C9.5 8.05228 9.94772 8.5 10.5 8.5Z"
              fill="#145E75"
            />
            <path
              d="M14.5 6.5C15.0523 6.5 15.5 6.05228 15.5 5.5C15.5 4.94772 15.0523 4.5 14.5 4.5C13.9477 4.5 13.5 4.94772 13.5 5.5C13.5 6.05228 13.9477 6.5 14.5 6.5Z"
              fill="#145E75"
            />
          </svg>
        );
      case "Clustering":
        return (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M23 8C23 11.3137 20.3137 14 17 14C13.6863 14 11 11.3137 11 8C11 4.68629 13.6863 2 17 2C20.3137 2 23 4.68629 23 8Z"
              fill="#145E75"
            />
            <path
              d="M15 18.5C15 20.9853 12.9853 23 10.5 23C8.01472 23 6 20.9853 6 18.5C6 16.0147 8.01472 14 10.5 14C12.9853 14 15 16.0147 15 18.5Z"
              fill="#145E75"
            />
            <path
              d="M7 10C7 11.6569 5.65685 13 4 13C2.34315 13 1 11.6569 1 10C1 8.34315 2.34315 7 4 7C5.65685 7 7 8.34315 7 10Z"
              fill="#145E75"
            />
          </svg>
        );
      case "TimeSeries":
        return <ChartMixed width="24" height="24" viewBox="0 0 24 24" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <Spinner aria-label="Loading models spinner" size="xl" />
        <p className="mt-2">Loading models...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <Alert color="failure">
          <span className="font-medium">{error}</span>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8">
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-bold">In Progress</h2>
        {inProgressModels.length === 0 ? (
          <p>No in-progress models.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {inProgressModels.map((model) => (
              <Card key={model.id} className="flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold">{model.name}</h3>
                  <Badge color={getBadgeColor(model.status)}>
                    {model.status}
                  </Badge>
                </div>
                <p className="mt-2 text-gray-500">{model.description}</p>
                <div className="mt-4 w-40">
                  <Badge
                    className="flex w-40 flex-row items-end justify-start gap-2 px-3 py-1"
                    color="info"
                  >
                    <div className="flex items-end gap-2">
                      {getTaskIcon(model.task)}
                      <span className="size-5 whitespace-nowrap">
                        {model.task}
                      </span>
                    </div>
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-bold">Your Models</h2>
        {finishedModels.length === 0 ? (
          <p>No finished models.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {finishedModels.map((model) => (
              <Card key={model.id} className="flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold">{model.name}</h3>
                  <Badge color={getBadgeColor(model.status)}>
                    {model.status}
                  </Badge>
                </div>
                <p className="mt-2 text-gray-500">{model.description}</p>

                <p className="text-gray-500">
                  Evaluation Metric: {model.evaluation_metric}
                </p>
                <p className="text-gray-500">
                  Metric Value:{" "}
                  {Math.abs(model.evaluation_metric_value).toFixed(2)}
                </p>
                <div className="mt-4 w-40">
                  <Badge
                    className="flex w-40 flex-row items-end justify-start gap-2 px-3 py-1"
                    color="info"
                  >
                    <div className="flex items-end gap-2">
                      {getTaskIcon(model.task)}
                      <span className="size-5 whitespace-nowrap">
                        {model.task}
                      </span>
                    </div>
                  </Badge>
                </div>
                <Button
                  color="blue"
                  href={`/app/models/viewModel?id=${model.id}`}
                >
                  View Model
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
