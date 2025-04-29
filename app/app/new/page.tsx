"use client";

import React, { useState } from "react";
import {
  FileInput,
  Select,
  TextInput,
  Textarea,
  Button,
  Modal,
  Label,
} from "flowbite-react";
import { AnimatePresence, motion } from "motion/react";
import ProtectedPage from "@/app/components/ProtectedPage";
import { useRouter } from "next/navigation";

export default function MultiStepWizard() {
  const [currentStep, setCurrentStep] = useState(1);

  const router = useRouter();
  // File upload states
  const [file, setFile] = useState<File | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const [modelName, setModelName] = useState("");
  const [taskType, setTaskType] = useState("");
  const [description, setDescription] = useState("");

  // Success & error modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [id, setId] = useState("");

  // Example data states for Steps 2 & 3
  const [targetVariable, setTargetVariable] = useState("");
  const [targetVariables, setTargetVariables] = useState<string[]>([]);
  const [analysisColumns, setAnalysisColumns] = useState<string[]>([]);

  // --- STEP NAVIGATION ---
  const nextStep = () => {
    if (currentStep === 1) {
      // Validate required fields before proceeding
      if (!taskType) {
        setErrorMessage("Please select a task type");
        setShowErrorModal(true);
        return;
      }
      if (!modelName) {
        setErrorMessage("Please enter a model name");
        setShowErrorModal(true);
        return;
      }
    }

    if (currentStep < 3) setCurrentStep((prev) => prev + 1);
  };
  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((prev) => prev - 1);
  };

  // --- ANIMATION VARIANTS ---
  const stepVariants = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  };

  const handleFileUpload = async () => {
    if (!file) return;
    setIsLocked(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("modelName", modelName);
      formData.append("taskType", taskType);
      formData.append("description", description);

      const uploadUrl = "http://localhost:8000/loadData/";

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        setShowErrorModal(true);
      } else {
        let res = await response.json();
        setTargetVariables(res.data);
        setId(res.id);

        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setShowErrorModal(true);
    } finally {
      setIsLocked(false);
    }
  };

  const handleSubmitJob = async () => {
    const trainUrl = "http://localhost:8000/trainModel/";
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("id", id);
    formData.append("name", modelName);
    formData.append("target_variable", targetVariable);
    formData.append("description", description);
    formData.append("task", taskType);

    const response = await fetch(trainUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      setShowErrorModal(true);
    } else {
      setShowSuccessModal(true);
      router.push("/app");
    }
  };

  return (
    <ProtectedPage>
      <div className="mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">
            {currentStep === 1 && "Let's Get Started!"}
            {currentStep === 2 && "Getting close..."}
            {currentStep === 3 && "Let's confirm!"}
          </h1>
        </div>

        <div className="relative size-full min-h-[450px] overflow-hidden rounded-lg shadow-md">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="w-full rounded-md"
              >
                <div className="mb-8 p-4">
                  <h1 className="p-4 text-2xl font-bold">
                    Step 1: Setup & Task Definition
                  </h1>
                  <h2 className="mb-4 text-xl font-semibold">
                    Upload Your Data & Define Model
                  </h2>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="flex w-full items-center justify-center">
                        <Label
                          htmlFor="dropzone-file"
                          className={`flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed ${
                            file
                              ? "border-green-300 bg-green-50"
                              : "border-gray-300 bg-gray-50"
                          } hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600`}
                        >
                          <div className="flex flex-col items-center justify-center pb-6 pt-5">
                            {file ? (
                              <>
                                <svg
                                  className="mb-4 size-8 text-green-500"
                                  aria-hidden="true"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                  File uploaded:{" "}
                                  <span className="font-semibold">
                                    {file.name}
                                  </span>
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Click to change file
                                </p>
                              </>
                            ) : (
                              <>
                                <svg
                                  className="mb-4 size-8 text-gray-500 dark:text-gray-400"
                                  aria-hidden="true"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 20 16"
                                >
                                  <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                                  />
                                </svg>
                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                  <span className="font-semibold">
                                    Click to upload
                                  </span>{" "}
                                  or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  CSV (max 50MB)
                                </p>
                              </>
                            )}
                          </div>
                          <FileInput
                            id="dropzone-file"
                            accept=".csv"
                            onChange={(e) =>
                              setFile(e.target.files?.[0] || null)
                            }
                            className="hidden"
                          />
                        </Label>
                      </div>
                      <Button
                        onClick={handleFileUpload}
                        disabled={!file || isLocked}
                      >
                        {isLocked ? "Uploading..." : "Upload CSV"}
                      </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <TextInput
                        id="modelName"
                        type="text"
                        placeholder="Model Name"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        disabled={isLocked}
                        required
                      />

                      <Select
                        id="taskType"
                        value={taskType}
                        onChange={(e) => setTaskType(e.target.value)}
                        disabled={isLocked}
                      >
                        <option value="">Choose ML Task</option>
                        <option value="Regression">Regression</option>
                        <option value="Classification">Classification</option>
                      </Select>

                      <Textarea
                        id="description"
                        placeholder="Enter a brief description (optional)..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="col-span-2"
                        disabled={isLocked}
                        rows={5}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="w-full"
              >
                <h1 className="p-4 text-2xl font-bold">
                  Step 2: Column Selection
                </h1>
                <div className="mb-8 p-4">
                  <h2 className="mb-4 text-xl font-semibold">Choose Columns</h2>
                  <p className="mb-2">
                    For example, select your target variable and analysis
                    columns.
                  </p>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Target Variable
                  </label>
                  <Select
                    id="targetVariable"
                    value={targetVariable}
                    onChange={(e) => setTargetVariable(e.target.value)}
                    disabled={isLocked}
                  >
                    {targetVariables.map((variable) => (
                      <option key={variable} value={variable}>
                        {variable}
                      </option>
                    ))}
                  </Select>

                  <label className="mb-2 mt-4 block text-sm font-medium text-gray-700">
                    Analysis Columns
                  </label>
                  <TextInput
                    id="analysisColumns"
                    type="text"
                    placeholder="e.g. Region, Product, Month"
                    value={analysisColumns.join(",")}
                    onChange={(e) =>
                      setAnalysisColumns(e.target.value.split(","))
                    }
                    disabled={isLocked}
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4 }}
                className="w-full"
              >
                <h1 className="p-4 text-2xl font-bold">Step 3: Summary</h1>
                <div className="mb-8 p-4">
                  <h2 className="mb-4 text-xl font-semibold">
                    Review & Submit
                  </h2>
                  <p className="mb-2">
                    <strong>Model Name:</strong> {modelName || "N/A"}
                  </p>
                  <p className="mb-2">
                    <strong>Task Type:</strong> {taskType}
                  </p>
                  <p className="mb-2">
                    <strong>Description:</strong> {description || "N/A"}
                  </p>
                  <p className="mb-2">
                    <strong>Target Variable:</strong> {targetVariable || "N/A"}
                  </p>
                  <p className="mb-2">
                    <strong>Analysis Columns:</strong>{" "}
                    {analysisColumns.length > 0
                      ? analysisColumns.join(", ")
                      : "N/A"}
                  </p>
                  <p className="mb-4 text-gray-500">
                    Estimated Completion Time: ~5 minutes (example).
                  </p>
                  <Button
                    color="success"
                    onClick={handleSubmitJob}
                    disabled={isLocked}
                  >
                    Submit Job
                  </Button>
                </div>
              </motion.div>
            )}
            <div className="mt-4 flex justify-end space-x-6 p-4">
              <Button
                onClick={prevStep}
                disabled={currentStep === 1 || isLocked}
                color="light"
              >
                Previous
              </Button>
              <Button
                onClick={nextStep}
                disabled={currentStep === 3 || isLocked}
              >
                Next
              </Button>
            </div>
          </AnimatePresence>
        </div>

        <Modal
          show={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
        >
          <Modal.Header>Upload Successful</Modal.Header>
          <Modal.Body>
            <p className="text-sm text-gray-500">
              Your CSV has been uploaded successfully. You can proceed to the
              next step.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => setShowSuccessModal(false)}>Close</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showErrorModal} onClose={() => setShowErrorModal(false)}>
          <Modal.Header>Error</Modal.Header>
          <Modal.Body>
            <p className="text-sm text-gray-500">
              {errorMessage ||
                "Something went wrong during the upload. Please try again or check your file."}
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button color="failure" onClick={() => setShowErrorModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </ProtectedPage>
  );
}
