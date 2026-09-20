import React, { useState } from 'react';
import { LARAVEL_CODEBASE, LaravelFile } from '../../data/laravelCodebase';
import {
  FileCode,
  Copy,
  Check,
  FolderTree,
  Terminal,
} from 'lucide-react';

export const LaravelCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<LaravelFile>(LARAVEL_CODEBASE[0]);
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Files' },
    { id: 'Security & RBAC', label: 'Spatie RBAC' },
    { id: 'Events & Echo', label: 'Echo & Pusher' },
    { id: 'Routes & Config', label: 'Routes & Config' },
    { id: 'Livewire', label: 'Livewire v3' },
    { id: 'Blade View', label: 'Blade Views' },
    { id: 'Migration', label: 'Migrations' },
    { id: 'Model', label: 'Models' },
    { id: 'Seeder', label: 'Seeders' },
    { id: 'Deployment', label: 'Railway & Nixpacks' },
  ];

  const filteredFiles = LARAVEL_CODEBASE.filter((f: LaravelFile) => {
    if (activeCategory === 'all') return true;
    return f.category === activeCategory;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguageTag = (path: string) => {
    if (path.endsWith('.blade.php')) return 'BLADE';
    if (path.endsWith('.php')) return 'PHP';
    if (path.endsWith('.toml')) return 'TOML';
    if (path.includes('.env')) return 'ENV';
    return 'CODE';
  };

  const getFileName = (path: string) => {
    return path.split('/').pop() || path;
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2B231F] pb-16">
      {/* Top Banner */}
      <div className="bg-[#2B231F] text-[#FDFBF7] border-b border-[#3E332D] px-4 sm:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#5C4033] text-[#FDFBF7] flex items-center justify-center shadow">
              <Terminal className="w-6 h-6 text-[#FDFBF7]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-bold text-[#FDFBF7]">
                  Laravel 11 & Railway Codebase Hub
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#5C4033] text-[#F4EFEB] font-bold">
                  Nixpacks Ready
                </span>
              </div>
              <p className="text-xs text-[#D4C5B9]">
                Complete production files: Migrations, Eloquent lock transactions, Livewire components, Blade templates, and Railway configs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-[#5C4033] hover:bg-[#4A3328] text-[#FDFBF7] text-xs font-bold rounded-full shadow flex items-center gap-2 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Active File'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 border-b border-[#EFE8E1]">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === cat.id
                  ? 'bg-[#5C4033] text-[#FDFBF7] shadow-sm'
                  : 'bg-[#F4EFEB] text-[#736357] hover:bg-[#E6DDD4]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 2-Column Code Viewer Layout */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* File Tree / List (4 cols) */}
          <div className="lg:col-span-4 bg-[#F4EFEB] rounded-3xl border border-[#E6DDD4] p-4 h-[680px] flex flex-col">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E6DDD4] text-xs font-bold text-[#5C4033]">
              <FolderTree className="w-4 h-4" />
              <span>Project Files ({filteredFiles.length})</span>
            </div>

            <div className="mt-3 flex-1 overflow-y-auto space-y-1.5 pr-1">
              {filteredFiles.map((file: LaravelFile) => {
                const isSelected = selectedFile.path === file.path;
                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left p-3 rounded-2xl transition flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-[#5C4033] text-[#FDFBF7] shadow-xs'
                        : 'bg-[#FDFBF7] hover:bg-[#EFE8E1] text-[#2B231F] border border-[#E6DDD4]'
                    }`}
                  >
                    <FileCode
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        isSelected ? 'text-[#FDFBF7]' : 'text-[#8C7A6B]'
                      }`}
                    />
                    <div className="overflow-hidden">
                      <p className="font-mono text-xs font-bold truncate">{getFileName(file.path)}</p>
                      <p
                        className={`text-[10px] truncate ${
                          isSelected ? 'text-[#EFE8E1]' : 'text-[#8C7A6B]'
                        }`}
                      >
                        {file.path}
                      </p>
                      <p
                        className={`text-[10px] line-clamp-1 mt-0.5 ${
                          isSelected ? 'text-[#D4C5B9]' : 'text-[#736357]'
                        }`}
                      >
                        {file.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer Panel (8 cols) */}
          <div className="lg:col-span-8 bg-[#1E1916] rounded-3xl border border-[#3E332D] shadow-xl overflow-hidden flex flex-col h-[680px]">
            {/* Header */}
            <div className="px-5 py-3.5 bg-[#2B231F] border-b border-[#3E332D] flex items-center justify-between text-xs text-[#D4C5B9]">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#FDFBF7]">{selectedFile.path}</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#5C4033] text-[#F4EFEB]">
                  {getLanguageTag(selectedFile.path)}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 bg-[#3E332D] hover:bg-[#5C4033] text-[#FDFBF7] rounded-full transition text-[11px] font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Description Banner */}
            <div className="px-5 py-2.5 bg-[#241D19] border-b border-[#3E332D] text-[11px] text-[#A6978A]">
              <strong>File Purpose:</strong> {selectedFile.description}
            </div>

            {/* Code Content */}
            <pre className="flex-1 p-5 overflow-auto font-mono text-xs text-[#EAE2DB] leading-relaxed select-text bg-[#1A1513]">
              <code>{selectedFile.code}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
