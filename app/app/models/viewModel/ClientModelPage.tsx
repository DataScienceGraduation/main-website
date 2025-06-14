"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Label, TextInput, Button, Modal } from "flowbite-react";

export default function ClientModelPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [modelDetails, setModelDetails] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [forecastHorizon, setForecastHorizon] = useState<number>(1);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [plotImage, setPlotImage] = useState<string | null>(null);
  const [predictionData, setPredictionData] = useState<any>(null);

  useEffect(() => {
    const fetchModel = async () => {
      try {
        if (!id) {
          throw new Error(
            "No model ID specified in the query parameters."
          );
        }
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error(
            "No authentication token found. Please log in again."
          );
        }

        const res = await fetch(`http://localhost:8000/getModel?id=${id}`, {
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
              result.data.list_of_features
            );
            throw new Error(
              "Failed to parse model features - please check console for details"
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
            : "Error fetching model details"
        );
      }
    };

    fetchModel();
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

      const response = await fetch("http://localhost:8000/infer/", {
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
            `Data point assigned to Cluster ${result.prediction}`
          );
        } else if (modelDetails.task === "TimeSeries") {
          if (Array.isArray(result.prediction)) {
            setModalMessage(
              `Forecast generated for next ${forecastHorizon} timesteps`
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

  const downloadCSV = () => {
    if (!predictionData || !Array.isArray(predictionData.prediction)) return;

    const csvContent = [
      ['Timestep', 'Predicted Value'],
      ...predictionData.prediction.map((value: number, index: number) => [
        index + 1,
        value
      ])
    ];

    const csvString = csvContent
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `forecast_${modelDetails.name}_${forecastHorizon}_timesteps.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (!modelDetails) return <p>Loading...</p>;

  return (
    <div className="flex flex-col bg-white">
      {/* header & details */}
      <div className="bg-gray-50 p-8">
        <h1 className="mb-4 text-4xl font-bold">{modelDetails.name}</h1>
        <p className="text-gray-500">{modelDetails.description}</p>
        {modelDetails.task === "Clustering" && (
          <div className="mt-4 rounded bg-blue-50 p-4">
            <p className="text-blue-700">
              This is a clustering model. It will assign your input data to one
              of the identified clusters. The model&apos;s performance is
              measured using a custom score of Silhouette score and Davies-Bouldin Index:{" "}
              {modelDetails.evaluation_metric_value.toFixed(4)}
            </p>
          </div>
        )}
        {modelDetails.task === "TimeSeries" && (
          <div className="mt-4 rounded bg-green-50 p-4">
            <p className="text-green-700">
              This is a time series forecasting model. It uses historical data
              to predict future values. The model&apos;s performance is
              measured using RMSE:{" "}
              {modelDetails.evaluation_metric_value.toFixed(4)}
            </p>
          </div>
        )}
      </div>

      {/* form */}
      <div className="container mx-auto px-4 flex-1 py-8">
        <form onSubmit={handleSubmit}>
          {modelDetails.task === "TimeSeries" ? (
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <Label htmlFor="forecastHorizon" value="Number of timesteps to forecast" />
                <TextInput
                  id="forecastHorizon"
                  name="forecastHorizon"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="Enter number of timesteps (e.g., 1, 5, 10)"
                  value={forecastHorizon}
                  onChange={(e) => setForecastHorizon(parseInt(e.target.value) || 1)}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter how many future timesteps you want to predict (minimum: 1, maximum: 100)
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-3">
              {modelDetails.list_of_features && Object.keys(modelDetails.list_of_features).length > 0 ? (
                Object.keys(modelDetails.list_of_features).map((key) => {
                  if (key === modelDetails.target_variable && modelDetails.task !== "Clustering") return null;

                  const type = modelDetails.list_of_features[key];
                  const placeholder = `Enter ${type} value`;

                  if (type === "int64") {
                    return (
                      <div key={key}>
                        <Label htmlFor={key} value={`Enter a value for ${key}`} />
                        <TextInput id={key} name={key} type="number" placeholder={placeholder} value={formData[key] || ""} onChange={handleInputChange} />
                      </div>
                    );
                  } else if (type === "float") {
                    return (
                      <div key={key}>
                        <Label htmlFor={key} value={`Enter a value for ${key}`} />
                        <TextInput id={key} name={key} type="number" step="any" placeholder={placeholder} value={formData[key] || ""} onChange={handleInputChange} />
                      </div>
                    );
                  } else if (Array.isArray(type)) {
                    return (
                      <div key={key}>
                        <Label htmlFor={key} value={`Select a value for ${key}`} />
                        <select id={key} name={key} value={formData[key] || ""} onChange={handleInputChange} className="mt-1 block w-full rounded border border-gray-300 p-2">
                          <option value="">Select an option</option>
                          {type.map((option: string, i: number) => (<option key={i} value={option}>{option}</option>))}
                        </select>
                      </div>
                    );
                  } else if (type === "datetime") {
                    return (
                      <div key={key}>
                        <Label htmlFor={key} value={`Enter a value for ${key}`} />
                        <TextInput id={key} name={key} type="text" placeholder={placeholder} value={formData[key] || ""} onChange={handleInputChange} />
                        {modelDetails.date_format && (<p className="text-xs text-gray-500 mt-1">Please enter the date in the format: <b>{modelDetails.date_format}</b></p>)}
                      </div>
                    );
                  } else {
                    return (
                      <div key={key}>
                        <Label htmlFor={key} value={`Enter a value for ${key}`} />
                        <TextInput id={key} name={key} type="text" placeholder={placeholder} value={formData[key]||""} onChange={handleInputChange} />
                      </div>
                    );
                  }
                })
              ) : (
                <p>No features available.</p>
              )}
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <Button type="submit" className="px-6">
              {modelDetails.task === "Clustering" ? "Assign Cluster" : modelDetails.task === "TimeSeries" ? "Generate Forecast" : "Predict"}
            </Button>
          </div>
        </form>
      </div>

      <Modal show={showModal} onClose={closeModal}>
        <Modal.Header>{modelDetails.task === "Clustering" ? "Cluster Assignment" : modelDetails.task === "TimeSeries" ? "Forecast Results" : "Model Response"}</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <p className="text-lg font-medium">{modalMessage}</p>
            {modelDetails.task === "TimeSeries" && plotImage && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img src={`data:image/png;base64,${plotImage}`} alt="Time Series Forecast Plot" className="max-w-full h-auto rounded-lg shadow-lg border" />
                </div>
                {predictionData && Array.isArray(predictionData.prediction) && (
                  <div className="flex justify-center">
                    <Button onClick={downloadCSV} className="bg-green-600 hover:bg-green-700">Download Forecast Data (CSV)</Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}