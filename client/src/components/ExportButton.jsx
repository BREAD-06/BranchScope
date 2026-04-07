import { useState } from "react";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

export default function ExportButton({ snapshotTargetId, exportData, filename }) {
  const [exporting, setExporting] = useState(false);

  const handleExportPNG = async () => {
    const target = document.getElementById(snapshotTargetId);
    if (!target) return;

    setExporting(true);
    try {
      const canvas = await html2canvas(target, {
        backgroundColor: "#0a0a0a",
        scale: 2,
        useCORS: true,
        logging: false,
      });
      canvas.toBlob((blob) => {
        if (blob) saveAs(blob, `${filename || "branchscope"}_snapshot.png`);
      });
    } catch (err) {
      console.error("Export PNG failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const handleExportJSON = () => {
    if (!exportData) return;
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, `${filename || "branchscope"}_data.json`);
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={handleExportPNG}
        disabled={exporting}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
          bg-gray-900 dark:bg-gray-800 border border-gray-700 dark:border-gray-600
          text-gray-300 hover:border-green-500/50 hover:text-green-400
          transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Export as PNG image"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {exporting ? "Exporting…" : "PNG"}
      </button>
      <button
        onClick={handleExportJSON}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
          bg-gray-900 dark:bg-gray-800 border border-gray-700 dark:border-gray-600
          text-gray-300 hover:border-green-500/50 hover:text-green-400
          transition-all duration-200"
        title="Export raw data as JSON"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        JSON
      </button>
    </div>
  );
}
