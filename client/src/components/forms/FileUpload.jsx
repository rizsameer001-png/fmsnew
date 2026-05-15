import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';

const FileUpload = ({ label, files, onChange, maxFiles = 5, maxSize = 5242880, accept = 'image/*,application/pdf' }) => {
  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
    onChange(newFiles);
  }, [files, maxFiles, onChange]);

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: accept.split(',').reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
  });

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
          isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive ? 'Drop the files here...' : 'Drag & drop files here, or click to select'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Max {maxFiles} files, up to {formatFileSize(maxSize)} each
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>
              <button onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;