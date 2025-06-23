"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function DashboardPage() {
  const params = useParams();
  const id = params?.id;
  const [modelDetails, setModelDetails] = useState<any>(null);

  useEffect(() => {
    const fetchModel = async () => {
      if (!id) return;
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/getModel?id=${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (result.success) {
        setModelDetails(result.data);
      }
    };
    fetchModel();
  }, [id]);

  if (!modelDetails) return <p>Loading...</p>;

  return (
    <div className="p-8">
      <h1 className="mb-2 text-3xl font-bold">
        Dashboard: {modelDetails.name}
      </h1>
      <p className="mb-1 text-gray-600">{modelDetails.description}</p>
      <p className="text-gray-500">Task Type: {modelDetails.task}</p>
    </div>
  );
}
