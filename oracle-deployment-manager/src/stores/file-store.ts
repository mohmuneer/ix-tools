import { create } from 'zustand';
import type { FileItem } from '@/types';

interface FileState {
  currentPath: string;
  files: FileItem[];
  selectedFiles: string[];
  clipboardFiles: { action: 'copy' | 'cut'; files: string[] } | null;
  searchQuery: string;
  viewMode: 'grid' | 'list';
  setCurrentPath: (path: string) => void;
  setFiles: (files: FileItem[]) => void;
  toggleSelectFile: (path: string) => void;
  selectAllFiles: () => void;
  clearSelection: () => void;
  setClipboard: (clipboard: { action: 'copy' | 'cut'; files: string[] } | null) => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
}

export const useFileStore = create<FileState>((set, get) => ({
  currentPath: 'C:\\',
  files: [],
  selectedFiles: [],
  clipboardFiles: null,
  searchQuery: '',
  viewMode: 'list',
  setCurrentPath: (path) => set({ currentPath: path, selectedFiles: [] }),
  setFiles: (files) => set({ files }),
  toggleSelectFile: (path) =>
    set((state) => ({
      selectedFiles: state.selectedFiles.includes(path)
        ? state.selectedFiles.filter((p) => p !== path)
        : [...state.selectedFiles, path],
    })),
  selectAllFiles: () =>
    set((state) => ({
      selectedFiles: state.files.map((f) => f.path),
    })),
  clearSelection: () => set({ selectedFiles: [] }),
  setClipboard: (clipboard) => set({ clipboardFiles: clipboard }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setViewMode: (mode) => set({ viewMode: mode }),
}));
