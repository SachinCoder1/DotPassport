import { useState } from 'react';
import {
  X,
  Download,
  FileText,
  FileJson,
  Calendar,
  CheckSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ExportLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (config: ExportConfig) => Promise<void>;
}

export interface ExportConfig {
  format: 'csv' | 'json';
  dateFrom?: string;
  dateTo?: string;
  fields: string[];
}

const AVAILABLE_FIELDS = [
  { id: 'timestamp', label: 'Timestamp', description: 'When the request occurred' },
  { id: 'method', label: 'HTTP Method', description: 'GET, POST, PUT, DELETE, etc.' },
  { id: 'endpoint', label: 'Endpoint', description: 'API endpoint path' },
  { id: 'statusCode', label: 'Status Code', description: 'HTTP response status' },
  { id: 'responseTime', label: 'Response Time', description: 'Time in milliseconds' },
  { id: 'requestHeaders', label: 'Request Headers', description: 'Full request headers' },
  { id: 'requestBody', label: 'Request Body', description: 'Request payload' },
  { id: 'responseHeaders', label: 'Response Headers', description: 'Full response headers' },
  { id: 'responseBody', label: 'Response Body', description: 'Response payload' },
  { id: 'ipAddress', label: 'IP Address', description: 'Client IP address' },
  { id: 'userAgent', label: 'User Agent', description: 'Client user agent string' },
];

export function ExportLogsModal({
  isOpen,
  onClose,
  onExport,
}: ExportLogsModalProps) {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([
    'timestamp',
    'method',
    'endpoint',
    'statusCode',
    'responseTime',
  ]);
  const [isExporting, setIsExporting] = useState(false);

  const handleToggleField = (fieldId: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldId)
        ? prev.filter((f) => f !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleSelectAll = () => {
    setSelectedFields(AVAILABLE_FIELDS.map((f) => f.id));
  };

  const handleSelectNone = () => {
    setSelectedFields([]);
  };

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      toast.error('Please select at least one field to export');
      return;
    }

    setIsExporting(true);
    try {
      await onExport({
        format,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        fields: selectedFields,
      });
      toast.success(`Logs exported successfully as ${format.toUpperCase()}`);
      onClose();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to export logs';
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  const getPreviewCount = () => {
    // This would normally come from the backend based on filters
    return selectedFields.length > 5 ? '~500' : '~1000';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Download className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Export Logs
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Download your request logs
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Export Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFormat('csv')}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                      format === 'csv'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700'
                    }`}
                  >
                    <FileText
                      className={`w-6 h-6 ${
                        format === 'csv'
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    />
                    <div className="text-left">
                      <div
                        className={`font-semibold ${
                          format === 'csv'
                            ? 'text-purple-900 dark:text-purple-100'
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        CSV
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Spreadsheet format
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setFormat('json')}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                      format === 'json'
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700'
                    }`}
                  >
                    <FileJson
                      className={`w-6 h-6 ${
                        format === 'json'
                          ? 'text-purple-600 dark:text-purple-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    />
                    <div className="text-left">
                      <div
                        className={`font-semibold ${
                          format === 'json'
                            ? 'text-purple-900 dark:text-purple-100'
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        JSON
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Developer format
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                  Date Range (Optional)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      From
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      To
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fields Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white">
                    Fields to Include
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSelectAll}
                      className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <button
                      onClick={handleSelectNone}
                      className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      None
                    </button>
                  </div>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  {AVAILABLE_FIELDS.map((field) => (
                    <label
                      key={field.id}
                      className="flex items-start gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFields.includes(field.id)}
                        onChange={() => handleToggleField(field.id)}
                        className="mt-0.5 w-4 h-4 text-purple-600 rounded border-gray-300 dark:border-gray-600 focus:ring-purple-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {field.label}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {field.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  {selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''} selected
                </p>
              </div>

              {/* Preview */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Export Preview
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Approximately <strong>{getPreviewCount()} logs</strong> will be exported with{' '}
                      <strong>
                        {selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''}
                      </strong>{' '}
                      in <strong>{format.toUpperCase()}</strong> format.
                    </p>
                    {(dateFrom || dateTo) && (
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Date range: {dateFrom || 'Beginning'} to {dateTo || 'Now'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <button
                onClick={onClose}
                disabled={isExporting}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting || selectedFields.length === 0}
                className="px-6 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export {format.toUpperCase()}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
