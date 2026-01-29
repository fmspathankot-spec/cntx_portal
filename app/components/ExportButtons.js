"use client";

import { FaFileCsv, FaFilePdf, FaDownload } from "react-icons/fa";

export default function ExportButtons({ 
  onExportCSV, 
  onExportPDF, 
  disabled = false,
  isExporting = false 
}) {
  return (
    <div className="flex items-center space-x-3">
      <button
        onClick={onExportCSV}
        disabled={disabled || isExporting}
        className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
      >
        <FaFileCsv className="mr-2" />
        Export CSV
      </button>
      
      <button
        onClick={onExportPDF}
        disabled={disabled || isExporting}
        className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            Generating...
          </>
        ) : (
          <>
            <FaFilePdf className="mr-2" />
            Export PDF
          </>
        )}
      </button>
    </div>
  );
}
