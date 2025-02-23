"use client";

import React, { useState, useEffect } from "react";
import { Card, Badge, Spinner, Alert, Button } from "flowbite-react";

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

    fetch("http://localhost:8000/getAllModels/", {
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
        return "failure";
      case "Finished":
      case "Done":
        return "success";
      default:
        return "info";
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
                <div className="mt-4">
                  <Badge color="info">{model.task}</Badge>
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
                <div className="mt-4 w-40">
                  <Badge color="info">{model.task}</Badge>
                </div>
                <Button color="blue" href={`/app/models/${model.id}`}>
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
