"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Label, TextInput, Button, Modal } from "flowbite-react";
import { HiCloudUpload } from "react-icons/hi";

import { getAbsoluteUrl } from "../../../utils/url";

export default function ClientModelPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const [modelDetails, setModelDetails] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [forecastHorizon, setForecastHorizon] = useState<number>(1);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [plotImage, setPlotImage] = useState<string | null>(null);
  const [predictionData, setPredictionData] = useState<any>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isGeneratingDashboard, setIsGeneratingDashboard] = useState(false);
  const [authError, setAuthError] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);

  // New state for model sharing
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState("");

  // New state for prediction mode
  const [predictionMode, setPredictionMode] = useState<'single' | 'batch' | 'api'>('single');
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchResult, setBatchResult] = useState<any>(null);

  // Only allow batch prediction for non-TimeSeries models
  const allowBatchPrediction = modelDetails && modelDetails.task !== "TimeSeries";

  const [existingReport, setExistingReport] = useState<any>(null);
  const [existingDashboard, setExistingDashboard] = useState<boolean>(false);

  useEffect(() => {
    const fetchModel = async () => {
      try {
        if (!id) {
          throw new Error("No model ID specified in the query parameters.");
        }
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error(
            "No authentication token found. Please log in again.",
          );
        }

        const res = await fetch(getAbsoluteUrl(`/getModel?id=${id}`), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const result = await res.json();

        if (result.success) {
          try {
            console.log("Raw features:", result.data.list_of_features);

            // Handle both string and object formats
            let parsedFeatures;
            if (typeof result.data.list_of_features === "string") {
              const cleanedString = result.data.list_of_features
                .replace(/'/g, '"')
                .replace(/None/g, "null")
                .replace(/True/g, "true")
                .replace(/False/g, "false")
                .replace(/np\.True_/g, "true")
                .replace(/np\.False_/g, "false")
                .replace(/\[np\..*?\]/g, '["true","false"]');

              console.log("Cleaned string:", cleanedString);
              parsedFeatures = JSON.parse(cleanedString);
            } else {
              parsedFeatures = result.data.list_of_features;
            }

            console.log("Parsed features:", parsedFeatures);

            result.data.list_of_features = parsedFeatures;
            setModelDetails(result.data);

            const initialFormData: Record<string, any> = {};
            Object.keys(parsedFeatures).forEach((key) => {
              initialFormData[key] = "";
            });
            setFormData(initialFormData);
          } catch (parseError) {
            console.error("Error parsing features:", parseError);
            console.error(
              "Feature string that failed to parse:",
              result.data.list_of_features,
            );
            throw new Error(
              "Failed to parse model features - please check console for details",
            );
          }
        } else {
          throw new Error(result.message || "Error retrieving model details");
        }
      } catch (error) {
        console.error("Fetch error:", error);
        alert(
          error instanceof Error
            ? error.message
            : "Error fetching model details",
        );
      }
    };

    const fetchExistingReport = async () => {
      if (!id) return;
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(getAbsoluteUrl(`/aiapp/get-latest-report-for-model/?model_id=${id}`), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.report) {
            setExistingReport(result.report);
          } else {
            setExistingReport(null);
          }
        } else {
          setExistingReport(null);
        }
      } catch {
        setExistingReport(null);
      }
    };

    const fetchExistingDashboard = async () => {
      if (!id) return;
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(getAbsoluteUrl(`/aiapp/get-dashboard-by-model/?model_id=${id}`), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const result = await res.json();
          setExistingDashboard(!!result.success);
        } else {
          setExistingDashboard(false);
        }
      } catch {
        setExistingDashboard(false);
      }
    };

    fetchModel();
    fetchExistingReport();
    fetchExistingDashboard();
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const data = new FormData();

      if (modelDetails.task === "TimeSeries") {
        data.append("data", JSON.stringify({}));
        data.append("forecast_horizon", forecastHorizon.toString());
      } else {
        data.append("data", JSON.stringify(formData));
      }

      data.append("id", id as string);

      const response = await fetch(getAbsoluteUrl("/infer/"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: data,
      });

      const result = await response.json();
      if (result.success) {
        if (modelDetails.task === "TimeSeries" && result.plot) {
          setPlotImage(result.plot);
          setPredictionData(result);
        } else {
          setPlotImage(null);
          setPredictionData(null);
        }

        if (modelDetails.task === "Clustering") {
          setModalMessage(
            `Data point assigned to Cluster ${result.prediction}`,
          );
        } else if (modelDetails.task === "TimeSeries") {
          if (Array.isArray(result.prediction)) {
            setModalMessage(
              `Forecast generated for next ${forecastHorizon} timesteps`,
            );
          } else {
            setModalMessage(`Forecast for next timestep: ${result.prediction}`);
          }
        } else {
          setModalMessage("Prediction Result: " + result.prediction);
        }
      } else {
        setModalMessage("Prediction failed: " + result.message);
        setPlotImage(null);
        setPredictionData(null);
      }
    } catch (error) {
      console.error("Error during prediction:", error);
      setModalMessage("Error during prediction");
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setPlotImage(null);
    setPredictionData(null);
  };

  const handleShareModel = async () => {
    if (!shareEmail) {
      setModalMessage("Please enter an email address.");
      setShowModal(true);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setModalMessage("No authentication token found. Please log in again.");
        setShowModal(true);
        return;
      }

      const response: Response = await fetch(getAbsoluteUrl("/aiapp/share-model/"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          model_id: id,
          email: shareEmail,
        }),
      });

      const result: { success: boolean; message?: string } = await response.json();

      if (result.success) {
        setModalMessage(`Model successfully shared with ${shareEmail}!`);
      } else {
        setModalMessage(`Failed to share model: ${result.message || "Unknown error"}`);
      }
    } catch (error: unknown) {
      console.error("Error sharing model:", error);
      setModalMessage("Error sharing model. Please try again.");
    } finally {
      setShowShareModal(false); // Close the share modal
      setShowModal(true); // Show the general message modal
      setShareEmail(""); // Clear the email input
    }
  };

  const downloadCSV = () => {
    if (!predictionData || !Array.isArray(predictionData.prediction)) return;

    const csvContent = [
      ["Timestep", "Predicted Value"],
      ...predictionData.prediction.map((value: number, index: number) => [
        index + 1,
        value,
      ]),
    ];

    const csvString = csvContent.map((row) => row.join(",")).join("\n");

    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `forecast_${modelDetails.name}_${forecastHorizon}_timesteps.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const response = await fetch(getAbsoluteUrl("/aiapp/generate/"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          model_id: id,
          async: true,
        }),
      });

      const result = await response.json();

      if (result.success) {
        if (result.async && result.task_id) {
          setModalMessage(
            "Report generation started! You will be redirected once the report is ready."
          );
          setShowModal(true);

          // Open WebSocket connection for real-time report notification
          const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
          const wsUrl = `${wsProtocol}://${window.location.hostname}:8000/ws/report/${result.task_id}/`;
          const ws = new window.WebSocket(wsUrl);
          wsRef.current = ws;
          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              if (data.type === "report_ready" && data.task_id === result.task_id) {
                ws.close();
                router.push(`/reports/${data.report_id}`);
              }
            } catch (e) {
              // Ignore parse errors
            }
          };
          ws.onclose = () => {
            wsRef.current = null;
          };
        } else if (result.report_id) {
          // Synchronous processing completed
          router.push(`/reports/${result.report_id}`);
        } else {
          throw new Error(result.message || "Failed to generate report");
        }
      } else {
        throw new Error(result.message || "Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      setModalMessage(
        error instanceof Error ? error.message : "Error generating report"
      );
      setShowModal(true);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleGenerateDashboard = async () => {
    setIsGeneratingDashboard(true);
    setAuthError(false);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setAuthError(true);
        setIsGeneratingDashboard(false);
        setModalMessage("You must be logged in to generate a dashboard.");
        setShowModal(true);
        return;
      }

      // 1. Check if dashboard already exists
      const checkRes = await fetch(
        getAbsoluteUrl(`/aiapp/get-dashboard-by-model/?model_id=${id}`),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const checkData = await checkRes.json();
      if (checkData.success) {
        // Dashboard exists, redirect
        router.push(`/dashboards/${id}`);
        return;
      }

      // 2. If not, proceed to generate dashboard as before
      const response = await fetch(
        getAbsoluteUrl("/aiapp/start-suggest-charts/"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ model_id: id }),
        }
      );
      if (response.status === 401) {
        setAuthError(true);
        setIsGeneratingDashboard(false);
        setModalMessage("You must be logged in to generate a dashboard.");
        setShowModal(true);
        return;
      }
      const result = await response.json();
      if (!result.success || !result.task_id)
        throw new Error(
          result.message || "Failed to start dashboard suggestion"
        );

      setModalMessage(
        "Dashboard suggestion started! You will be redirected once the dashboard is ready."
      );
      setShowModal(true);

      // Open WebSocket connection for real-time notification
      const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
      const wsUrl = `${wsProtocol}://${window.location.hostname}:8000/ws/dashboard/${id}/`;
      const ws = new window.WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "dashboard_ready" && data.model_id === id) {
            ws.close();
            router.push(`/dashboards/${id}`);
          }
        } catch (e) {
          // Ignore parse errors
        }
      };
      ws.onclose = () => {
        wsRef.current = null;
      };
    } catch (err: any) {
      setIsGeneratingDashboard(false);
      setModalMessage(err.message || "Dashboard suggestion failed.");
      setShowModal(true);
    }
  };

  // Handler for batch file upload
  const handleBatchFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBatchFile(e.target.files[0]);
    }
  };

  // Handler for batch prediction
  const handleBatchPredict = async () => {
    if (!batchFile) return;
    const formData = new FormData();
    formData.append("file", batchFile);
    formData.append("model_id", id as string);

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(getAbsoluteUrl("/automlapp/batch_predict/"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        // Download the CSV file
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "batch_predictions.csv";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        setBatchResult(null); // Clear any previous error
      } else {
        // Handle error (show message)
        let errorMsg = "Batch prediction failed.";
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch {}
        setBatchResult({ error: errorMsg });
      }
    } catch (err) {
      setBatchResult({ error: "Network error during batch prediction." });
    }
  };

  if (!modelDetails) return <p>Loading...</p>;

  return (
    <div className="flex flex-col bg-white">
      {/* header & details */}
      <div className="bg-gray-50 p-8">
        <h1 className="mb-4 text-4xl font-bold">{modelDetails.name}</h1>
        <p className="text-gray-500">{modelDetails.description}</p>

        {/* Generate Report Section */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="mb-2 text-lg font-semibold text-gray-800">
                Generate AI Report & Dashboard
              </h3>
              <p className="text-sm text-gray-600">
                Create a comprehensive AI-powered analysis with insights,
                charts, and business recommendations for this model.
              </p>
            </div>
            {existingReport ? (
              <Button
                onClick={() => router.push(`/reports/${existingReport.id}`)}
                className="bg-blue-600 w-40 h-14 hover:bg-blue-700 text-center flex items-center justify-center"
              >
                View Report
              </Button>
            ) : (
              <Button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="bg-blue-500 w-40 h-14 hover:bg-blue-950 text-center flex items-center justify-center"
              >
                {isGeneratingReport ? "Generating Report..." : "Generate Report"}
              </Button>
            )}
            {existingDashboard ? (
              <Button
                onClick={() => router.push(`/dashboards/${id}`)}
                className="ml-4 bg-blue-600 w-40 h-14  hover:bg-blue-950 text-center flex items-center justify-center"
              >
                View Dashboard
              </Button>
            ) : (
              <Button
                onClick={handleGenerateDashboard}
                disabled={isGeneratingDashboard}
                className="ml-4 bg-blue-700 w-40 h-14 hover:bg-blue-950 text-center flex items-center justify-center"
              >
                {isGeneratingDashboard ? "Generating Dashboard..." : "Generate Dashboard"}
              </Button>
            )}
            <Button
              onClick={() => router.push(`/models/profiling?id=${id}`)}
              className="ml-4 bg-blue-800 w-40 h-14 hover:bg-blue-950 text-center flex items-center justify-center"
            >
              Profiling
            </Button>
            <Button
              onClick={() => setShowShareModal(true)}
              className="ml-4 bg-blue-950 w-40 h-14 hover:bg-blue-950 text-center flex items-center justify-center"
            >
              Share Model
            </Button>
          </div>
        </div>

        {/* Prediction Mode Toggle (only for non-TimeSeries) */}
        {allowBatchPrediction && (
          <div className="mt-8 flex gap-4">
            <Button
              color={predictionMode === 'single' ? 'primary' : 'gray'}
              onClick={() => setPredictionMode('single')}
            >
              Single Prediction
            </Button>
            <Button
              color={predictionMode === 'batch' ? 'primary' : 'gray'}
              onClick={() => setPredictionMode('batch')}
            >
              Batch Prediction
            </Button>
            <Button
              color={predictionMode === 'api' ? 'primary' : 'gray'}
              onClick={() => setPredictionMode('api')}
            >
              API Prediction
            </Button>
          </div>
        )}

        {modelDetails.task === "Clustering" && (
          <div className="mt-4 rounded bg-blue-50 p-4">
            <p className="text-blue-700">
              This is a clustering model. It will assign your input data to one
              of the identified clusters. The model&apos;s performance is
              measured using a custom score of Silhouette score and
              Davies-Bouldin Index: {" "}
              {(modelDetails.evaluation_metric_value * 100).toFixed(2) + '%'}
            </p>
          </div>
        )}
        {modelDetails.task === "TimeSeries" && (
          <div className="mt-4 rounded bg-blue-50 p-4">
            <p className="text-blue-700">
              This is a time series forecasting model. It uses historical data
              to predict future values. The model&apos;s performance is measured
              using RMSE: {modelDetails.evaluation_metric_value.toFixed(4)}
            </p>
          </div>
        )}
      </div>

      {/* Prediction UI */}
      <div className="container mx-auto flex-1 px-4 py-8">
        {/* Only show batch UI if allowed, otherwise always show single */}
        {(!allowBatchPrediction || predictionMode === 'single') ? (
          // Existing single prediction form
          <form onSubmit={handleSubmit}>
            {modelDetails.task === "TimeSeries" ? (
              <div className="mx-auto max-w-md">
                <div className="mb-6">
                  <Label
                    htmlFor="forecastHorizon"
                    value="Number of timesteps to forecast"
                  />
                  <TextInput
                    id="forecastHorizon"
                    name="forecastHorizon"
                    type="number"
                    min="1"
                    max="100"
                    placeholder="Enter number of timesteps (e.g., 1, 5, 10)"
                    value={forecastHorizon}
                    onChange={(e) =>
                      setForecastHorizon(parseInt(e.target.value) || 1)
                    }
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter how many future timesteps you want to predict (minimum:
                    1, maximum: 100)
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-3">
                {modelDetails.list_of_features &&
                Object.keys(modelDetails.list_of_features).length > 0 ? (
                  Object.keys(modelDetails.list_of_features).map((key) => {
                    if (
                      key === modelDetails.target_variable &&
                      modelDetails.task !== "Clustering"
                    )
                      return null;

                    const type = modelDetails.list_of_features[key];
                    const placeholder = `Enter ${type} value`;

                    if (type === "int64") {
                      return (
                        <div key={key}>
                          <Label
                            htmlFor={key}
                            value={`Enter a value for ${key}`}
                          />
                          <TextInput
                            id={key}
                            name={key}
                            type="number"
                            placeholder={placeholder}
                            value={formData[key] || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                      );
                    } else if (type === "float") {
                      return (
                        <div key={key}>
                          <Label
                            htmlFor={key}
                            value={`Enter a value for ${key}`}
                          />
                          <TextInput
                            id={key}
                            name={key}
                            type="number"
                            step="any"
                            placeholder={placeholder}
                            value={formData[key] || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                      );
                    } else if (Array.isArray(type)) {
                      return (
                        <div key={key}>
                          <Label
                            htmlFor={key}
                            value={`Select a value for ${key}`}
                          />
                          <select
                            id={key}
                            name={key}
                            value={formData[key] || ""}
                            onChange={handleInputChange}
                            className="mt-1 block w-full rounded border border-gray-300 p-2"
                          >
                            <option value="">Select an option</option>
                            {type.map((option: string, i: number) => (
                              <option key={i} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    } else if (type === "datetime") {
                      return (
                        <div key={key}>
                          <Label
                            htmlFor={key}
                            value={`Enter a value for ${key}`}
                          />
                          <TextInput
                            id={key}
                            name={key}
                            type="text"
                            placeholder={placeholder}
                            value={formData[key] || ""}
                            onChange={handleInputChange}
                          />
                          {modelDetails.date_format && (
                            <p className="mt-1 text-xs text-gray-500">
                              Please enter the date in the format:{" "}
                              <b>{modelDetails.date_format}</b>
                            </p>
                          )}
                        </div>
                      );
                    } else {
                      return (
                        <div key={key}>
                          <Label
                            htmlFor={key}
                            value={`Enter a value for ${key}`}
                          />
                          <TextInput
                            id={key}
                            name={key}
                            type="text"
                            placeholder={placeholder}
                            value={formData[key] || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                      );
                    }
                  })
                ) : (
                  <p>No features available.</p>
                )}
              </div>
            )}

            <div className="mt-8 flex justify-end ">
              <Button type="submit" className="px-6 ">
                {modelDetails.task === "Clustering"
                  ? "Assign Cluster"
                  : modelDetails.task === "TimeSeries"
                  ? "Generate Forecast"
                  : "Predict"}
              </Button>
            </div>
          </form>
        ) : predictionMode === 'batch' ? (
          // Batch prediction UI
          <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
            {/* Clickable upload area */}
            <label
              htmlFor="batch-csv-upload"
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-48 cursor-pointer transition hover:border-blue-400"
            >
              <HiCloudUpload className="text-4xl text-gray-400 mb-2" />
              <span className="font-semibold text-gray-700">
                Click to upload
              </span>
              <span className="text-sm text-gray-400 mt-1">
                CSV (max 50MB)
              </span>
              <input
                id="batch-csv-upload"
                type="file"
                accept=".csv"
                onChange={handleBatchFileChange}
                className="hidden"
              />
              {batchFile && (
                <span className="mt-2 text-xs text-green-600">
                  {batchFile.name}
                </span>
              )}
            </label>
            {/* Upload button outside the upload area */}
            <div className="mt-4">
              <Button
                onClick={handleBatchPredict}
                disabled={!batchFile}
                className="w-full"
              >
                Confirm Uploaded CSV File
              </Button>
            </div>
            {batchResult && (
              <div className="mt-4">
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                  {JSON.stringify(batchResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ) : (
          // API Prediction UI
          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-900">API Prediction</h3>
            <p className="mt-1 text-sm text-gray-600">
              Use the following code snippet to make predictions with your model programmatically.
            </p>
            <div className="mt-4">
              <pre className="bg-gray-100 p-4 rounded">
                <code>
                  {`
fetch('${getAbsoluteUrl('/api/infer/')}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    id: ${modelDetails.id},
    data: {
      // Your feature data here, for example:
      // "feature1": value1,
      // "feature2": value2
    }
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
`}
                </code>
              </pre>
            </div>
            <div className="mt-4">
              <a href="/models/api" className="text-indigo-600 hover:text-indigo-900">
                Manage your API keys
              </a>
            </div>
          </div>
        )}
      </div>

      <Modal show={showModal} onClose={closeModal}>
        <Modal.Header>
          {modalMessage.toLowerCase().includes("report")
            ? "Report Generation"
            : modelDetails.task === "Clustering"
            ? "Cluster Assignment"
            : modelDetails.task === "TimeSeries"
            ? "Forecast Results"
            : "Model Response"}
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <p className="text-lg font-medium">{modalMessage}</p>
            {modelDetails.task === "TimeSeries" && plotImage && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img
                    src={`data:image/png;base64,${plotImage}`}
                    alt="Time Series Forecast Plot"
                    className="h-auto max-w-full rounded-lg border shadow-lg"
                  />
                </div>
                {predictionData && Array.isArray(predictionData.prediction) && (
                  <div className="flex justify-center">
                    <Button onClick={downloadCSV} className=" px-6">
                      Download Forecast Data (CSV)
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>

      {authError && (
        <div className="mb-4 text-red-500">
          You must be logged in to generate a dashboard.
        </div>
      )}

      {/* Share Model Modal */}
      <Modal show={showShareModal} onClose={() => setShowShareModal(false)}>
        <Modal.Header>Share Model</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <p>Enter the email of the user you want to share this model with:</p>
            <TextInput
              type="email"
              placeholder="user@example.com"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              required
            />
            <Button
              onClick={handleShareModel}
              disabled={!shareEmail}
              className="w-full"
            >
              Share
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}