"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Spinner, Card, Alert, Button } from "flowbite-react";
import { HiInformationCircle, HiDownload } from "react-icons/hi";
import ProtectedPage from "@/app/components/ProtectedPage";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ReactMarkdown from "react-markdown";
import { getAbsoluteUrl } from "../../utils/url";

// Define TypeScript interfaces for the report data
interface ModelEntry {
  id: number;
  name: string;
  task: string;
  target_variable: string;
}

interface Chart {
  id: number;
  chart_type: string;
  title: string;
  description: string;
  chart_image_base64: string;
  chart_code: string;
  llm_reasoning: string;
}

interface Insight {
  id: number;
  title: string;
  description: string;
}

interface ReportData {
  report: {
    id: number;
    title: string;
    description: string;
    ai_insights: string;
    model_entry: ModelEntry;
  };
  charts: Chart[];
  insights: Insight[];
}

function ReportComponent() {
  const params = useParams();
  const reportId = params.id;
  const reportContentRef = useRef<HTMLDivElement>(null);

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleDownloadPdf = async () => {
    const content = reportContentRef.current;
    if (!content) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(content, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "p",
        unit: "px",
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`report_${reportId}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      setError("Failed to generate PDF. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRegenerateReport = async () => {
    setIsRegenerating(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        getAbsoluteUrl(`/aiapp/regenerate/?report_id=${reportId}`),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to regenerate report: ${response.statusText}`,
        );
      }

      const data = await response.json();
      if (data.success) {
        // Refetch the report data to show the updated report
        fetchReportData();
      } else {
        throw new Error(data.message || "Failed to regenerate report.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        getAbsoluteUrl(`/aiapp/get/?report_id=${reportId}`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Failed to fetch report: ${response.statusText}`,
        );
      }

      const data = await response.json();
      if (data.success) {
        setReportData(data);
      } else {
        throw new Error(data.message || "Failed to load report data.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportId) {
      fetchReportData();
    }
  }, [reportId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="xl" />
        <p className="ml-4 text-lg">
          Your AI Data Analyst is generating the report, please wait...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert color="failure" icon={HiInformationCircle}>
          <span className="font-medium">Error!</span> {error}
        </Alert>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-8 text-center">
        <p>No report data found.</p>
      </div>
    );
  }

  const formatInsightSection = (text: string) => {
    if (!text) return "";
    let content = text.replace(/^\d+\.\s.*?\n/, "");
    content = content.replace(/-\s/g, '</li><li class="mb-2">');
    return `<ul class="list-disc list-inside">${content}</ul>`;
  };

  const aiInsightsSections = reportData.report.ai_insights
    .split("## ")
    .filter((section) => section.trim() !== "");

  const getSection = (title: string) => {
    return aiInsightsSections.find((sec) => sec.trim().startsWith(title));
  };

  const businessImpact = getSection("6. Business Impact Analysis");

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-800">
              Analysis of {reportData.report.model_entry.name}
            </h1>
            <p className="mt-2 text-lg text-gray-500">
              A comprehensive report generated by our AI Data Analyst.
            </p>
          </div>
          <div className="flex space-x-4">
            <Button
              onClick={handleRegenerateReport}
              disabled={isRegenerating || isDownloading}
            >
              {isRegenerating ? "Regenerating..." : "Regenerate Report"}
            </Button>
            <Button onClick={handleDownloadPdf} disabled={isDownloading}>
              <HiDownload className="mr-2 size-5" />
              {isDownloading ? "Downloading..." : "Download as PDF"}
            </Button>
          </div>
        </header>

        <div ref={reportContentRef}>
          <div className="space-y-12">
            {reportData.charts.map((chart, index) => (
              <Card
                key={chart.id}
                className="w-full overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-xl"
              >
                <div className="p-4 sm:p-6">
                  <h3 className="mb-4 text-2xl font-bold text-gray-800">
                    {index + 1}. {chart.title}
                  </h3>
                  <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
                    <div className="flex h-[450px] items-center justify-center rounded-lg border border-gray-200 bg-white p-4">
                      {chart.chart_image_base64 ? (
                        <img
                          src={`data:image/png;base64,${chart.chart_image_base64}`}
                          alt={chart.title}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="text-center text-gray-500">
                          Chart image is not available.
                        </div>
                      )}
                    </div>
                    <div className="flex h-full flex-col">
                      <h4 className="mb-2 text-xl font-semibold text-gray-700">
                        Chart Explanation
                      </h4>
                      <div className="grow rounded-lg bg-gray-50 p-4 text-gray-600">
                        <ReactMarkdown>{chart.description}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-12 w-full shadow-lg">
            <h2 className="mb-4 text-2xl font-semibold text-gray-700">
              AI Business Summary
            </h2>
            <div className="prose prose-lg max-w-none">
              <h3 className="text-xl font-semibold text-gray-800">
                Business Impact Analysis
              </h3>
              {businessImpact ? (
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown>{businessImpact}</ReactMarkdown>
                </div>
              ) : (
                <p>No business impact analysis available.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <ProtectedPage>
      <ReportComponent />
    </ProtectedPage>
  );
}
