"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function DashboardPage() {
  const params = useParams();
  const id = params?.id;
  const [dataset, setDataset] = useState<any[]>([]);
  const [charts, setCharts] = useState<any[]>([]);
  const [status, setStatus] = useState<string>("pending");
  const [dashboardTitle, setDashboardTitle] = useState<string>("");
  const [dashboardDescription, setDashboardDescription] = useState<string>("");
  const [authError, setAuthError] = useState<boolean>(false);
  const [notFound, setNotFound] = useState<string>("");

  const plotlyChartTypes = [
    "histogram",
    "scatter",
    "bar",
    "line",
    "box",
    "pie",
    "violin",
    "heatmap"
  ];

  useEffect(() => {
    if (!id) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setAuthError(true);
      setStatus("error");
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/aiapp/get-dashboard-by-model?model_id=${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (res.status === 401) {
          setAuthError(true);
          setStatus("error");
          return { success: false };
        }
        if (res.status === 404) {
          setNotFound("Dashboard or model not found.");
          setStatus("error");
          return { success: false };
        }
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setCharts(data.charts);
          setDashboardTitle(data.title || "Dashboard");
          setDashboardDescription(data.description || "");
          setStatus("done");
        } else if (data.message && (data.message.includes("Dashboard not found") || data.message.includes("Model not found"))) {
          setNotFound(data.message);
          setStatus("error");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [id]);

  useEffect(() => {
    if (status !== "done" || !id) return;
    const fetchDataset = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getModelDataset?id=${id}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        setDataset(result.data);
        console.log("Fetched data:", result.data, typeof result.data);
      }
    };
    fetchDataset();
  }, [status, id]);

  const renderChart = (chart: any, idx: number) => {
    if (!dataset || dataset.length === 0) return null;
    if (!chart.chart_type || !plotlyChartTypes.includes(chart.chart_type)) {
      return (
        <div key={idx} className="p-4 border border-gray-300 rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Unsupported Chart Type</h3>
          <p className="text-gray-600">Chart type: {chart.chart_type}</p>
        </div>
      );
    }

    // Helper to validate data
    const validateData = (data: any[]) => data.filter(val => val !== null && val !== undefined && val !== '');

    // Histogram
    if (chart.chart_type === "histogram") {
      const x = validateData(dataset.map(row => row[chart.columns[0]]));
      const chartTitle = chart.title || `Histogram of ${chart.columns[0]}`;
      return (
        <div key={idx} className="flex flex-col">
          <h3 className="text-lg font-bold mb-3 pb-1 border-b border-gray-200 text-gray-900 bg-gray-50 rounded-t-md px-2">
            {chartTitle}
          </h3>
          <Plot
            data={[{ type: "histogram", x }]}
            layout={{
              xaxis: { title: { text: chart.columns[0] } }
            }}
            config={{ displayModeBar: false }}
            style={{ width: '100%', height: '400px' }}
          />
          {chart.insight && (
            <div className="mt-2 text-sm text-gray-700 break-words whitespace-pre-line max-h-24 overflow-auto">
              {chart.insight}
            </div>
          )}
        </div>
      );
    }

    // Scatter
    if (chart.chart_type === "scatter" && chart.columns.length >= 2) {
      const x = validateData(dataset.map(row => row[chart.columns[0]]));
      const y = validateData(dataset.map(row => row[chart.columns[1]]));
      const chartTitle = chart.title || `${chart.columns[0]} vs ${chart.columns[1]}`;
      return (
        <div key={idx} className="flex flex-col">
          <h3 className="text-lg font-bold mb-3 pb-1 border-b border-gray-200 text-gray-900 bg-gray-50 rounded-t-md px-2">
            {chartTitle}
          </h3>
          <Plot
            data={[{ type: "scatter", mode: "markers", x, y }]}
            layout={{
              xaxis: { title: { text: chart.columns[0] } },
              yaxis: { title: { text: chart.columns[1] } }
            }}
            config={{ displayModeBar: false }}
            style={{ width: '100%', height: '400px' }}
          />
          {chart.insight && (
            <div className="mt-2 text-sm text-gray-700 break-words whitespace-pre-line max-h-24 overflow-auto">
              {chart.insight}
            </div>
          )}
        </div>
      );
    }

    // Bar
    if (chart.chart_type === "bar" && chart.columns.length >= 2) {
      const x = validateData(dataset.map(row => row[chart.columns[0]]));
      const y = validateData(dataset.map(row => row[chart.columns[1]]));
      const chartTitle = chart.title || `${chart.columns[1]} by ${chart.columns[0]}`;
      return (
        <div key={idx} className="flex flex-col">
          <h3 className="text-lg font-bold mb-3 pb-1 border-b border-gray-200 text-gray-900 bg-gray-50 rounded-t-md px-2">
            {chartTitle}
          </h3>
          <Plot
            data={[{ type: "bar", x, y }]}
            layout={{
              xaxis: { title: { text: chart.columns[0] } },
              yaxis: { title: { text: chart.columns[1] } }
            }}
            config={{ displayModeBar: false }}
            style={{ width: '100%', height: '400px' }}
          />
          {chart.insight && (
            <div className="mt-2 text-sm text-gray-700 break-words whitespace-pre-line max-h-24 overflow-auto">
              {chart.insight}
            </div>
          )}
        </div>
      );
    }

    // Line
    if (chart.chart_type === "line" && chart.columns.length >= 2) {
      const x = validateData(dataset.map(row => row[chart.columns[0]]));
      const y = validateData(dataset.map(row => row[chart.columns[1]]));
      const chartTitle = chart.title || `${chart.columns[1]} over ${chart.columns[0]}`;
      return (
        <div key={idx} className="flex flex-col">
          <h3 className="text-lg font-bold mb-3 pb-1 border-b border-gray-200 text-gray-900 bg-gray-50 rounded-t-md px-2">
            {chartTitle}
          </h3>
          <Plot
            data={[{ type: "scatter", mode: "lines+markers", x, y }]}
            layout={{
              xaxis: { title: { text: chart.columns[0] } },
              yaxis: { title: { text: chart.columns[1] } }
            }}
            config={{ displayModeBar: false }}
            style={{ width: '100%', height: '400px' }}
          />
          {chart.insight && (
            <div className="mt-2 text-sm text-gray-700 break-words whitespace-pre-line max-h-24 overflow-auto">
              {chart.insight}
            </div>
          )}
        </div>
      );
    }

    // Box
    if (chart.chart_type === "box") {
      const y = validateData(dataset.map(row => row[chart.columns[0]]));
      const chartTitle = chart.title || `Box Plot of ${chart.columns[0]}`;
      return (
        <div key={idx} className="flex flex-col">
          <h3 className="text-lg font-bold mb-3 pb-1 border-b border-gray-200 text-gray-900 bg-gray-50 rounded-t-md px-2">
            {chartTitle}
          </h3>
          <Plot
            data={[{ type: "box", y }]}
            layout={{
              xaxis: { title: { text: chart.columns[0] } }
            }}
            config={{ displayModeBar: false }}
            style={{ width: '100%', height: '400px' }}
          />
          {chart.insight && (
            <div className="mt-2 text-sm text-gray-700 break-words whitespace-pre-line max-h-24 overflow-auto">
              {chart.insight}
            </div>
          )}
        </div>
      );
    }

    // Pie
    if (chart.chart_type === "pie") {
      const values = validateData(dataset.map(row => row[chart.columns[0]]));
      const valueCounts: { [key: string]: number } = {};
      values.forEach(value => {
        const strValue = String(value);
        valueCounts[strValue] = (valueCounts[strValue] || 0) + 1;
      });
      const labels = Object.keys(valueCounts);
      const counts = Object.values(valueCounts);
      const chartTitle = chart.title || `Pie Chart of ${chart.columns[0]}`;
      return (
        <div key={idx} className="flex flex-col">
          <h3 className="text-lg font-bold mb-3 pb-1 border-b border-gray-200 text-gray-900 bg-gray-50 rounded-t-md px-2">
            {chartTitle}
          </h3>
          <Plot
            data={[{ type: "pie", labels, values: counts }]}
            layout={{
            }}
            config={{ displayModeBar: false }}
            style={{ width: '100%', height: '400px' }}
          />
          <div className="text-xs text-gray-500 mt-1 text-center">{chart.columns[0]}</div>
          {chart.insight && (
            <div className="mt-2 text-sm text-gray-700 break-words whitespace-pre-line max-h-24 overflow-auto">
              {chart.insight}
            </div>
          )}
        </div>
      );
    }

    // Violin
    if (chart.chart_type === "violin") {
      const y = validateData(dataset.map(row => row[chart.columns[0]]));
      const chartTitle = chart.title || `Violin Plot of ${chart.columns[0]}`;
      return (
        <div key={idx} className="flex flex-col">
          <h3 className="text-lg font-bold mb-3 pb-1 border-b border-gray-200 text-gray-900 bg-gray-50 rounded-t-md px-2">
            {chartTitle}
          </h3>
          <Plot
            data={[{ type: "violin", y }]}
            layout={{
              xaxis: { title: { text: chart.columns[0] } }
            }}
            config={{ displayModeBar: false }}
            style={{ width: '100%', height: '400px' }}
          />
          {chart.insight && (
            <div className="mt-2 text-sm text-gray-700 break-words whitespace-pre-line max-h-24 overflow-auto">
              {chart.insight}
            </div>
          )}
        </div>
      );
    }

    // Heatmap
    if (chart.chart_type === "heatmap") {
      const numericColumns = chart.columns;
      const correlationData = numericColumns.map((col1: string) =>
        numericColumns.map((col2: string) => {
          const values1 = dataset.map(row => row[col1]).filter(v => typeof v === 'number' && !isNaN(v));
          const values2 = dataset.map(row => row[col2]).filter(v => typeof v === 'number' && !isNaN(v));
          if (values1.length !== values2.length || values1.length === 0) return 0;
          const mean1 = values1.reduce((a, b) => a + b, 0) / values1.length;
          const mean2 = values2.reduce((a, b) => a + b, 0) / values2.length;
          const numerator = values1.reduce((sum, val, i) => sum + (val - mean1) * (values2[i] - mean2), 0);
          const denom1 = Math.sqrt(values1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0));
          const denom2 = Math.sqrt(values2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0));
          return denom1 * denom2 === 0 ? 0 : numerator / (denom1 * denom2);
        })
      );
      const chartTitle = chart.title || "Correlation Heatmap";
      return (
        <div key={idx} className="flex flex-col">
          <h3 className="text-lg font-bold mb-3 pb-1 border-b border-gray-200 text-gray-900 bg-gray-50 rounded-t-md px-2">
            {chartTitle}
          </h3>
          <Plot
            data={[{ type: "heatmap", z: correlationData, x: numericColumns, y: numericColumns, colorscale: 'RdBu' }]}
            layout={{
              xaxis: { title: { text: numericColumns[0] } },
              yaxis: { title: { text: numericColumns[1] } }
            }}
            config={{ displayModeBar: false }}
            style={{ width: '100%', height: '400px' }}
          />
          {chart.insight && (
            <div className="mt-2 text-sm text-gray-700 break-words whitespace-pre-line max-h-24 overflow-auto">
              {chart.insight}
            </div>
          )}
        </div>
      );
    }

    // Fallback (should not reach here)
    return null;
  };

  return (
    <div className="p-8">
      <h1 className="mb-2 text-3xl font-bold">{dashboardTitle || `Dashboard: ${id}`}</h1>
      {dashboardDescription && <p className="mb-6 text-gray-600 text-lg">{dashboardDescription}</p>}
      {authError && <div className="text-red-500 mb-4">You must be logged in to view this dashboard.</div>}
      {notFound && <div className="text-red-500 mb-4">{notFound}</div>}
      {status === "pending" && <div>Generating chart suggestions...</div>}
      {status === "done" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Chart Suggestions</h2>
          {charts.length === 0 ? (
            <div className="text-gray-500">No charts available for this dashboard.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {charts.map((chart, idx) => renderChart(chart, idx))}
            </div>
          )}
        </div>
      )}
      {status === "error" && !authError && !notFound && <div className="text-red-500">Error generating chart suggestions.</div>}
    </div>
  );
}
