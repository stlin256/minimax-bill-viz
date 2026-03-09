import { useCallback, useState, useMemo } from 'react';
import { parseCSV, aggregateByApi, aggregateByModel, getTrendData, getInputOutputTrendData, getHourlyDistribution } from '../utils/csvParser';
import { useBillStore } from '../store/billStore';
import { ChartDataPoint } from '../types';

export function useBillData() {
  const {
    records,
    summary,
    isLoading,
    error,
    selectedModel,
    selectedApi,
    searchKeyword,
    setData,
    setLoading,
    setError,
    setSelectedModel,
    setSelectedApi,
    setSearchKeyword,
    getFilteredRecords,
    reset,
  } = useBillStore();

  const [granularity, setGranularity] = useState<'hour' | 'day'>('day');
  const [dateRange, setDateRange] = useState<{ start: number; end: number } | null>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    // 验证文件类型
    if (!file.name.endsWith('.csv')) {
      setError('请上传 CSV 格式的文件');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await parseCSV(file);
      setData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '文件解析失败');
    } finally {
      setLoading(false);
    }
  }, [setData, setLoading, setError]);

  const filteredRecords = getFilteredRecords();

  // 获取趋势数据（按天）
  const dailyTrendData: ChartDataPoint[] = getTrendData(records, 'day');

  // 时间轴数据
  const timelineData = useMemo(() => {
    return dailyTrendData.map((item, index) => ({
      date: item.name,
      value: item.value,
      index,
    }));
  }, [dailyTrendData]);

  // 根据时间范围过滤记录
  const rangeFilteredRecords = useMemo(() => {
    if (!dateRange) return filteredRecords;
    const startDate = dailyTrendData[dateRange.start]?.name;
    const endDate = dailyTrendData[dateRange.end]?.name;
    if (!startDate || !endDate) return filteredRecords;

    return filteredRecords.filter(record => {
      const recordDate = record.timestamp.split(' ')[0];
      return recordDate >= startDate && recordDate <= endDate;
    });
  }, [filteredRecords, dateRange, dailyTrendData]);

  // 获取趋势数据（根据 granularity 和选中的时间范围）
  const trendData: ChartDataPoint[] = getTrendData(rangeFilteredRecords, granularity);

  // 获取接口分布数据（基于范围过滤后的数据）
  const apiDistribution: ChartDataPoint[] = aggregateByApi(rangeFilteredRecords);

  // 获取模型分布数据
  const modelDistribution: ChartDataPoint[] = aggregateByModel(rangeFilteredRecords);

  // 输入/输出 Token 趋势数据
  const inputOutputTrendData = useMemo(() => {
    return getInputOutputTrendData(rangeFilteredRecords);
  }, [rangeFilteredRecords]);

  // 24小时分布数据
  const hourlyDistribution = useMemo(() => {
    return getHourlyDistribution(rangeFilteredRecords);
  }, [rangeFilteredRecords]);

  // 计算基于区间的统计摘要
  const rangeSummary = useMemo(() => {
    if (!rangeFilteredRecords || rangeFilteredRecords.length === 0) {
      return summary;
    }

    const totalAmount = rangeFilteredRecords.reduce((sum, r) => sum + r.amount, 0);
    const totalTokens = rangeFilteredRecords.reduce((sum, r) => sum + r.totalTokens, 0);
    const totalInputTokens = rangeFilteredRecords.reduce((sum, r) => sum + r.inputTokens, 0);
    const totalOutputTokens = rangeFilteredRecords.reduce((sum, r) => sum + r.outputTokens, 0);
    const successCalls = rangeFilteredRecords.filter(r => r.result === 'SUCCESS').length;
    const failedCalls = rangeFilteredRecords.filter(r => r.result === 'FAIL').length;

    // 获取日期范围
    const timestamps = rangeFilteredRecords.map(r => r.timestamp.split(' ')[0]).filter(Boolean);
    const uniqueDates = [...new Set(timestamps)].sort();
    const dateRange = uniqueDates.length > 0
      ? { start: uniqueDates[0], end: uniqueDates[uniqueDates.length - 1] }
      : { start: '', end: '' };

    return {
      totalAmount,
      totalTokens,
      totalInputTokens,
      totalOutputTokens,
      totalCalls: rangeFilteredRecords.length,
      successCalls,
      failedCalls,
      dateRange,
      models: [...new Set(rangeFilteredRecords.map(r => r.model))],
      apiKeys: [...new Set(rangeFilteredRecords.map(r => r.apiKeyName))],
      apiNames: [...new Set(rangeFilteredRecords.map(r => r.apiName))],
      avgCostPerCall: rangeFilteredRecords.length > 0 ? totalAmount / rangeFilteredRecords.length : 0,
    };
  }, [rangeFilteredRecords, summary]);

  return {
    // 数据
    records,
    summary,
    rangeSummary,
    filteredRecords,

    // 状态
    isLoading,
    error,

    // 筛选
    selectedModel,
    selectedApi,
    searchKeyword,
    setSelectedModel,
    setSelectedApi,
    setSearchKeyword,

    // 图表数据
    trendData,
    apiDistribution,
    modelDistribution,
    inputOutputTrendData,
    hourlyDistribution,

    // 区间选择器数据
    timelineData,
    setDateRange,
    dateRange,

    // 区间
    granularity,
    setGranularity,

    // 方法
    handleFileUpload,
    reset,
  };
}
