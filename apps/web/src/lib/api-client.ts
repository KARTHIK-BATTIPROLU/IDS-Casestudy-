import { AnalyzeResponse, ColumnMapping, AnalysisWeights } from "@/types";

export async function submitForAnalysis(
  csvText: string,
  columnMapping: ColumnMapping,
  weights: AnalysisWeights
): Promise<AnalyzeResponse> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      csv_text: csvText,
      column_mapping: columnMapping,
      weights,
    }),
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(
      errorJson.error || `Analysis engine responded with status ${response.status}`
    );
  }

  return response.json();
}
