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
      <p className="mb-6 text-gray-500">Task Type: {modelDetails.task}</p>

      {/* Model Information */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Model Information</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="font-medium text-gray-700">Target Variable</h3>
            <p className="text-lg">{modelDetails.target_variable}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="font-medium text-gray-700">Model Name</h3>
            <p className="text-lg">{modelDetails.model_name}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="font-medium text-gray-700">Status</h3>
            <p className="text-lg">{modelDetails.status}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="font-medium text-gray-700">Evaluation Metric</h3>
            <p className="text-lg">{modelDetails.evaluation_metric}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow">
            <h3 className="font-medium text-gray-700">Score</h3>
            <p className="text-lg">
              {modelDetails.evaluation_metric_value?.toFixed(4)}
            </p>
          </div>
        </div>
      </div>

      {/* Dataset Information */}
      {modelDetails.dataset && !modelDetails.dataset.error && (
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Dataset Information</h2>

          {/* Dataset Overview */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-white p-4 shadow">
              <h3 className="font-medium text-gray-700">Rows</h3>
              <p className="text-2xl font-bold text-blue-600">
                {modelDetails.dataset.rows?.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow">
              <h3 className="font-medium text-gray-700">Columns</h3>
              <p className="text-2xl font-bold text-green-600">
                {modelDetails.dataset.columns}
              </p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow">
              <h3 className="font-medium text-gray-700">Features</h3>
              <p className="text-2xl font-bold text-purple-600">
                {modelDetails.dataset.columns - 1}
              </p>
            </div>
          </div>

          {/* Column Information */}
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium">Columns & Data Types</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Column
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Data Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Missing Values
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {modelDetails.dataset.column_names?.map(
                    (column: string, index: number) => (
                      <tr key={index}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {column}
                          {column === modelDetails.target_variable && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                              Target
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {modelDetails.dataset.data_types?.[column]}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {modelDetails.dataset.missing_values?.[column] || 0}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sample Data */}
          {modelDetails.dataset.sample_data &&
            modelDetails.dataset.sample_data.length > 0 && (
              <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-medium">
                    Sample Data (First 5 rows)
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {modelDetails.dataset.column_names?.map(
                          (column: string, index: number) => (
                            <th
                              key={index}
                              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                            >
                              {column}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {modelDetails.dataset.sample_data.map(
                        (row: any, rowIndex: number) => (
                          <tr key={rowIndex}>
                            {modelDetails.dataset.column_names?.map(
                              (column: string, colIndex: number) => (
                                <td
                                  key={colIndex}
                                  className="whitespace-nowrap px-6 py-4 text-sm text-gray-900"
                                >
                                  {row[column] !== null &&
                                  row[column] !== undefined
                                    ? String(row[column])
                                    : "null"}
                                </td>
                              ),
                            )}
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>
      )}

      {/* Error handling for dataset */}
      {modelDetails.dataset?.error && (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex">
            <div className="shrink-0">
              <svg
                className="size-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Dataset Information Unavailable
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>{modelDetails.dataset.error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
