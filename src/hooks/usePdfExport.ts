"use client";

import { useState } from "react";
import type { AccessoryRecommendation } from "@/types/recommendation";

export interface PdfData {
  title: string;
  decoStyle: string;
  budgetLevel: string;
  totalFcfa: number;
  accessories: AccessoryRecommendation[];
  date?: string;
}

export function usePdfExport() {
  const [exporting, setExporting] = useState(false);

  const exportPdf = async (data: PdfData) => {
    setExporting(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { default: SimulationPDF } = await import("@/components/SimulationPDF");
      const { createElement } = await import("react");

      const element = createElement(SimulationPDF, data);
      const blob = await pdf(element).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `decoapp-${data.decoStyle}-${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return { exportPdf, exporting };
}
