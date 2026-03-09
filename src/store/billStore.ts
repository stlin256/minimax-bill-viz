import { create } from 'zustand';
import { BillRecord, ParsedData } from '../types';

interface BillStore {
  // 数据状态
  records: BillRecord[];
  summary: ParsedData['summary'] | null;
  isLoading: boolean;
  error: string | null;

  // 筛选状态
  selectedModel: string | null;
  selectedApi: string | null;
  searchKeyword: string;

  // Actions
  setData: (data: ParsedData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedModel: (model: string | null) => void;
  setSelectedApi: (api: string | null) => void;
  setSearchKeyword: (keyword: string) => void;
  reset: () => void;

  // 派生数据
  getFilteredRecords: () => BillRecord[];
}

export const useBillStore = create<BillStore>((set, get) => ({
  // 初始状态
  records: [],
  summary: null,
  isLoading: false,
  error: null,

  // 筛选状态
  selectedModel: null,
  selectedApi: null,
  searchKeyword: '',

  // Actions
  setData: (data: ParsedData) => set({
    records: data.records,
    summary: data.summary,
    error: null,
  }),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error: string | null) => set({ error }),

  setSelectedModel: (selectedModel: string | null) => set({ selectedModel }),

  setSelectedApi: (selectedApi: string | null) => set({ selectedApi }),

  setSearchKeyword: (searchKeyword: string) => set({ searchKeyword }),

  reset: () => set({
    records: [],
    summary: null,
    isLoading: false,
    error: null,
    selectedModel: null,
    selectedApi: null,
    searchKeyword: '',
  }),

  // 派生数据
  getFilteredRecords: () => {
    const { records, selectedModel, selectedApi, searchKeyword } = get();

    return records.filter(record => {
      // 模型筛选
      if (selectedModel && record.model !== selectedModel) {
        return false;
      }

      // API 筛选
      if (selectedApi && record.apiName !== selectedApi) {
        return false;
      }

      // 关键词搜索
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        return (
          record.apiName.toLowerCase().includes(keyword) ||
          record.model.toLowerCase().includes(keyword) ||
          record.apiKeyName.toLowerCase().includes(keyword)
        );
      }

      return true;
    });
  },
}));
