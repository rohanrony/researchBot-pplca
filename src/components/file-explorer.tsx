import React, { useState, useRef } from 'react';
import {
  FolderOpen,
  Upload,
  FileText,
  Folder,
  ChevronDown,
  ChevronRight,
  Terminal as TerminalIcon,
  Database,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';

import { SidebarLink } from './ui/sidebar_new';

import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from '@/components/magicui/terminal';

// File tree structure
const DATASET_ELEMENTS: FileNode[] = [
  {
    id: '1',
    isSelectable: false,
    name: 'datasets',
    type: 'folder',
    children: [
      {
        id: '2',
        isSelectable: false,
        name: 'sales',
        type: 'folder',
        children: [
          {
            id: '3',
            isSelectable: true,
            name: 'quarterly_sales.csv',
            type: 'file',
            size: '2.4 MB',
          },
          {
            id: '4',
            isSelectable: true,
            name: 'annual_report.csv',
            type: 'file',
            size: '1.8 MB',
          },
          {
            id: '5',
            isSelectable: true,
            name: 'customer_data.csv',
            type: 'file',
            size: '5.2 MB',
          },
        ],
      },
      {
        id: '6',
        isSelectable: false,
        name: 'marketing',
        type: 'folder',
        children: [
          {
            id: '7',
            isSelectable: true,
            name: 'campaign_metrics.csv',
            type: 'file',
            size: '3.1 MB',
          },
          {
            id: '8',
            isSelectable: true,
            name: 'user_engagement.csv',
            type: 'file',
            size: '4.7 MB',
          },
        ],
      },
      {
        id: '9',
        isSelectable: false,
        name: 'finance',
        type: 'folder',
        children: [
          {
            id: '10',
            isSelectable: true,
            name: 'budget_analysis.csv',
            type: 'file',
            size: '1.2 MB',
          },
          {
            id: '11',
            isSelectable: true,
            name: 'expense_tracking.csv',
            type: 'file',
            size: '2.9 MB',
          },
          {
            id: '12',
            isSelectable: true,
            name: 'mockdataset.csv',
            type: 'file',
            size: '6.3 MB',
          },
        ],
      },
    ],
  },
];

// Sample logs data
const SAMPLE_LOGS: Log[] = [
  {
    id: 1,
    type: 'info',
    message: 'Dataset loaded successfully: mockdataset.csv',
    timestamp: '14:32:15',
  },
  {
    id: 2,
    type: 'success',
    message: 'File upload completed',
    timestamp: '14:31:42',
  },
  {
    id: 3,
    type: 'warning',
    message: 'Large file detected (>5MB)',
    timestamp: '14:30:18',
  },
  {
    id: 4,
    type: 'info',
    message: 'Processing 15,234 rows',
    timestamp: '14:29:55',
  },
  {
    id: 5,
    type: 'success',
    message: 'Data validation passed',
    timestamp: '14:29:12',
  },
];

// Define a Log type
interface Log {
  id: number;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

// Define interface for file tree element
interface FileNode {
  id: string;
  isSelectable: boolean;
  name: string;
  type: 'folder' | 'file';
  size?: string;
  children?: FileNode[];
}

// Tree Item Component Props
interface TreeItemProps {
  element: FileNode;
  level?: number;
  onSelect: (element: FileNode) => void;
  selectedId: string;
  expandedItems: string[];
  onToggle: (id: string) => void;
}

// Log Item Component
interface LogItemProps {
  log: {
    id: number;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    timestamp: string;
  };
}

// Tree Item Component
const TreeItem: React.FC<TreeItemProps> = ({
  element,
  level = 0,
  onSelect,
  selectedId,
  expandedItems,
  onToggle,
}) => {
  const isExpanded = expandedItems.includes(element.id);
  const isSelected = selectedId === element.id;
  const hasChildren = element.children && element.children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      onToggle(element.id);
    }
    if (element.isSelectable) {
      onSelect(element);
    }
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1 px-2 cursor-pointer rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700 ${
          isSelected
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
            : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
      >
        {hasChildren && (
          <span className="flex-shrink-0">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </span>
        )}
        {!hasChildren && <span className="w-4" />}

        {element.type === 'folder' ? (
          <Folder className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        ) : (
          <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        )}

        <div className="flex flex-col">
          <span className="truncate">{element.name}</span>
          {element.size && (
            <span className="text-xs text-gray-500">{element.size}</span>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {element.children?.map((child) => (
            <TreeItem
              key={child.id}
              element={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
              expandedItems={expandedItems}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Collapsible Section Component
const CollapsibleSection = ({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}): React.JSX.Element => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-lg">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
    >
      <span className="font-medium text-sm">{title}</span>
      {isOpen ? (
        <ChevronDown className="w-4 h-4" />
      ) : (
        <ChevronRight className="w-4 h-4" />
      )}
    </button>
    {isOpen && (
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        {children}
      </div>
    )}
  </div>
);

const LogItem: React.FC<LogItemProps> = ({ log }) => {
  const getIcon = () => {
    switch (log.type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="flex items-start gap-2 py-2 text-xs">
      {getIcon()}
      <div className="flex-1 min-w-0">
        <div className="text-gray-700 dark:text-gray-300 break-words">
          {log.message}
        </div>
        <div className="text-gray-500 dark:text-gray-400 mt-1">
          {log.timestamp}
        </div>
      </div>
    </div>
  );
};

// Main File Explorer Component
export default function FileExplorer() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState({
    id: '12',
    name: 'mockdataset.csv',
    type: 'file',
  });
  const [expandedItems, setExpandedItems] = useState(['1', '9']); // Initially expand root and finance folder
  const [contextOpen, setContextOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [logsOpen, setLogsOpen] = useState(false);
  const [datasetOpen, setDatasetOpen] = useState(false);
  const [fileExplorerOpen, setFileExplorerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: {
    preventDefault: () => void;
    stopPropagation: () => void;
    type: string;
  }) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: {
    preventDefault: () => void;
    stopPropagation: () => void;
    dataTransfer: { files: any };
  }) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = [...e.dataTransfer.files];
    handleFiles(files);
  };

  const handleFiles = (files: any[]) => {
    files.forEach((file) => {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        if (file.size <= 200 * 1024 * 1024) {
          // 200MB limit
          uploadFile(file);
        } else {
          alert('File size exceeds 200MB limit');
        }
      } else {
        alert('Only CSV files are allowed');
      }
    });
  };

  const uploadFile = (file: { name: any }) => {
    // This function will be implemented later
    console.log('Uploading file:', file.name);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileInput = (e: { target: { files: any } }) => {
    const files = [...e.target.files];
    handleFiles(files);
  };

  const handleTreeSelect = (element: FileNode) => {
    if (element.type === 'file') {
      setSelectedFile(element);
    }
  };

  const handleToggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <div className="flex flex-col h-full space-y-4 pr-4 pt-6">
      <SidebarLink
        link={{
          href: '#',
          label: 'File Explorer',
          icon: (
            <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          ),
        }}
        className="text-sm font-medium text-gray-700 dark:text-gray-300"
      />

      {/* File Upload Section */}
      <div className="space-y-3">
        <SidebarLink
          onClick={() => setFileExplorerOpen(!fileExplorerOpen)}
          link={{
            href: '#',
            label: 'File Explorer',
            icon: (
              <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            ),
          }}
          className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
        />

        {fileExplorerOpen && (
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300">
              File Upload
            </h3>
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Drag and drop CSV files here, or
              </p>
              <button
                onClick={handleFileSelect}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Browse Files
              </button>
              <p className="text-xs text-gray-500 mt-2">
                CSV files only, max 200MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                multiple
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          </div>
        )}
      </div>

      {/* Available Datasets Section */}
      <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
        <SidebarLink
          onClick={() => setDatasetOpen(!datasetOpen)}
          link={{
            href: '#',
            label: 'Available Datasets',
            icon: (
              <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
            ),
          }}
          className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
        />

        {datasetOpen && (
          <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
            {/* Current Selected Dataset */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
              <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                Current Dataset:
              </div>
              <div className="text-sm text-blue-800 dark:text-blue-200">
                {selectedFile.name}
              </div>
            </div>

            {/* File Tree */}
            <div className="flex-1 overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
              {DATASET_ELEMENTS.map((element) => (
                <TreeItem
                  key={element.id}
                  element={element}
                  onSelect={handleTreeSelect}
                  selectedId={selectedFile.id}
                  expandedItems={expandedItems}
                  onToggle={handleToggleExpand}
                />
              ))}
            </div>

            {/* Dataset Context and Preview - Only show when file is selected */}
            {selectedFile.type === 'file' && (
              <div className="space-y-2">
                <CollapsibleSection
                  title="Dataset Context"
                  isOpen={contextOpen}
                  onToggle={() => setContextOpen(!contextOpen)}
                >
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <p>
                      <strong>Dataset:</strong> {selectedFile.name}
                    </p>
                    <p>
                      <strong>Description:</strong> This dataset contains
                      comprehensive business metrics and performance indicators
                      collected over the past fiscal year.
                    </p>
                    <p>
                      <strong>Columns:</strong> 15 columns including
                      customer_id, transaction_date, amount, category, region
                    </p>
                    <p>
                      <strong>Rows:</strong> Approximately 15,234 records
                    </p>
                    <p>
                      <strong>Last Updated:</strong> March 15, 2024
                    </p>
                  </div>
                </CollapsibleSection>

                <CollapsibleSection
                  title="Dataset Preview"
                  isOpen={previewOpen}
                  onToggle={() => setPreviewOpen(!previewOpen)}
                >
                  <div className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                    <div className="whitespace-nowrap">
                      customer_id,transaction_date,amount,category,region
                      <br />
                      1001,2024-01-15,299.99,electronics,north
                      <br />
                      1002,2024-01-15,45.50,grocery,south
                      <br />
                      1003,2024-01-16,1250.00,furniture,east
                      <br />
                      1004,2024-01-16,89.99,clothing,west
                      <br />
                      ...
                    </div>
                  </div>
                </CollapsibleSection>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Logs Section */}
      <div className="space-y-3">
        <SidebarLink
          onClick={() => setLogsOpen(!logsOpen)}
          link={{
            href: '#',
            label: 'Logs',
            icon: (
              <TerminalIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            ),
          }}
          className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
        />

        {logsOpen && (
          <div className="space-y-3">
            <Terminal>
              <TypingAnimation>
                &gt; pnpm dlx shadcn@latest init
              </TypingAnimation>

              <AnimatedSpan delay={1500} className="text-green-500">
                <span>✔ Preflight checks.</span>
              </AnimatedSpan>

              <AnimatedSpan delay={2000} className="text-green-500">
                <span>✔ Verifying framework. Found Next.js.</span>
              </AnimatedSpan>

              <AnimatedSpan delay={2500} className="text-green-500">
                <span>✔ Validating Tailwind CSS.</span>
              </AnimatedSpan>

              <AnimatedSpan delay={3000} className="text-green-500">
                <span>✔ Validating import alias.</span>
              </AnimatedSpan>

              <AnimatedSpan delay={3500} className="text-green-500">
                <span>✔ Writing components.json.</span>
              </AnimatedSpan>

              <AnimatedSpan delay={4000} className="text-green-500">
                <span>✔ Checking registry.</span>
              </AnimatedSpan>

              <AnimatedSpan delay={4500} className="text-green-500">
                <span>✔ Updating tailwind.config.ts</span>
              </AnimatedSpan>

              <AnimatedSpan delay={5000} className="text-green-500">
                <span>✔ Updating app/globals.css</span>
              </AnimatedSpan>

              <AnimatedSpan delay={5500} className="text-green-500">
                <span>✔ Installing dependencies.</span>
              </AnimatedSpan>

              <AnimatedSpan delay={6000} className="text-blue-500">
                <span>ℹ Updated 1 file:</span>
                <span className="pl-2">- lib/utils.ts</span>
              </AnimatedSpan>
            </Terminal>
          </div>
        )}
      </div>
    </div>
  );
}
