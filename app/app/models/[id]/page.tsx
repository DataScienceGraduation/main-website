"use client";
import { useState, useEffect } from "react";
import { Label, TextInput, Button, Modal } from "flowbite-react";

export default function ModelPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const [modelDetails, setModelDetails] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    const fetchModel = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error(
            "No authentication token found. Please log in again.",
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
              // Clean the string from Python-specific syntax
              const cleanedString = result.data.list_of_features
                .replace(/'/g, '"') // Replace single quotes with double quotes
                .replace(/None/g, "null") // Replace Python None with JSON null
                .replace(/True/g, "true") // Replace Python True with JSON true
                .replace(/False/g, "false") // Replace Python False with JSON false
                .replace(/np\.True_/g, "true") // Replace NumPy True_ with JSON true
                .replace(/np\.False_/g, "false") // Replace NumPy False_ with JSON false
                .replace(/\[np\..*?\]/g, '["true","false"]'); // Replace NumPy boolean array with string array

              console.log("Cleaned string:", cleanedString);
              parsedFeatures = JSON.parse(cleanedString);
            } else {
              // If it's already an object, use it as is
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

    if (id) {
      fetchModel();
    }
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
      data.append("data", JSON.stringify(formData));
      data.append("id", id);

      const response = await fetch("http://localhost:8000/infer/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: data,
      });

      const result = await response.json();
      if (result.success) {
        if (modelDetails.task === "Clustering") {
          setModalMessage(
            `Data point assigned to Cluster ${result.prediction}`,
          );
        } else {
          setModalMessage("Prediction Result: " + result.prediction);
        }
      } else {
        setModalMessage("Prediction failed: " + result.message);
      }
    } catch (error) {
      console.error("Error during prediction:", error);
      setModalMessage("Error during prediction");
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  if (!modelDetails) return <p>Loading...</p>;

  return (
    <div className="flex flex-col bg-white">
      <div className="bg-gray-50 p-8">
        <h1 className="mb-4 text-4xl font-bold">{modelDetails.name}</h1>
        <p className="text-gray-500">{modelDetails.description}</p>
        {modelDetails.task === "Clustering" && (
          <div className="mt-4 rounded bg-blue-50 p-4">
            <p className="text-blue-700">
              This is a clustering model. It will assign your input data to one
              of the identified clusters. The model&apos;s performance is
              measured using the silhouette score:{" "}
              {modelDetails.evaluation_metric_value.toFixed(4)}
            </p>
          </div>
        )}
      </div>

      <div className="container mx-auto flex-1 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 sm:grid-cols-3">
            {modelDetails.list_of_features &&
            Object.keys(modelDetails.list_of_features).length > 0 ? (
              Object.keys(modelDetails.list_of_features).map((key) => {
                if (
                  key === modelDetails.target_variable &&
                  modelDetails.task !== "Clustering"
                ) {
                  return null;
                }

                const type = modelDetails.list_of_features[key];
                const placeholder = `Enter ${type} value`;

                if (type === "int64") {
                  return (
                    <div key={key}>
                      <Label htmlFor={key} value={`Enter a value for ${key}`} />
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
                      <Label htmlFor={key} value={`Enter a value for ${key}`} />
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
                        {type.map((option: string, index: number) => (
                          <option key={index} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                } else {
                  return (
                    <div key={key}>
                      <Label htmlFor={key} value={`Enter a value for ${key}`} />
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

          <div className="mt-8 flex justify-end">
            <Button type="submit" className="px-6">
              {modelDetails.task === "Clustering"
                ? "Assign Cluster"
                : "Predict"}
            </Button>
          </div>
        </form>
      </div>

      <Modal show={showModal} onClose={closeModal}>
        <Modal.Header>
          {modelDetails.task === "Clustering"
            ? "Cluster Assignment"
            : "Model Response"}
        </Modal.Header>
        <Modal.Body>
          <p>{modalMessage}</p>
        </Modal.Body>
      </Modal>
    </div>
  );
}
