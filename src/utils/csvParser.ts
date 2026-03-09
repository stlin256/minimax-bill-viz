/**
 * 账单记录类型定义
 */

export interface BillRecord {
  /** 消费账号 */
  account: string;
  /** 接口密钥名称 */
  apiKeyName: string;
  /** 消费接口 */
  apiName: string;
  /** 消费模型 */
  model: string;
  /** 消费金额 (元) */
  amount: number;
  /** 代金券后消费金额 (元) */
  amountAfterCoupon: number;
  /** 输入 token 数 */
  inputTokens: number;
  /** 输出 token 数 */
  outputTokens: number;
  /** 总 token 数 */
  totalTokens: number;
  /** 消费时间 (格式: YYYY-MM-DD HH:00-HH:MM) */
  timestamp: string;
  /** 消费结果 */
  result: 'SUCCESS' | 'FAIL';
}

/** 解析后的完整数据 */
export interface ParsedData {
  /** 账单记录列表 */
  records: BillRecord[];
  /** 统计摘要 */
  summary: {
    /** 总消费金额 */
    totalAmount: number;
    /** 总 token 数 */
    totalTokens: number;
    /** 总输入 token 数 */
    totalInputTokens: number;
    /** 总输出 token 数 */
    totalOutputTokens: number;
    /** 总调用次数 */
    totalCalls: number;
    /** 成功调用次数 */
    successCalls: number;
    /** 失败调用次数 */
    failedCalls: number;
    /** 日期范围 */
    dateRange: { start: string; end: string };
    /** 模型列表 */
    models: string[];
    /** API 密钥列表 */
    apiKeys: string[];
    /** 接口列表 */
    apiNames: string[];
  };
}

/** 图表数据点 */
export interface ChartDataPoint {
  /** 名称/标签 */
  name: string;
  /** 数值 */
  value: number;
}

/** CSV 原始行数据 */
interface RawCSVRow {
  [key: string]: string;
}

/** 字段映射配置 */
const FIELD_MAPPING: Record<string, keyof BillRecord> = {
  '消费账号': 'account',
  '接口密钥名称': 'apiKeyName',
  '消费接口': 'apiName',
  '消费模型': 'model',
  '消费金额': 'amount',
  '代金券后消费金额': 'amountAfterCoupon',
  '输入消费数': 'inputTokens',
  '输出消费数': 'outputTokens',
  '总消费数': 'totalTokens',
  '消费时间': 'timestamp',
  '消费结果': 'result',
};

/** 必需字段列表 */
const REQUIRED_FIELDS = [
  '消费账号',
  '接口密钥名称',
  '消费接口',
  '消费模型',
  '消费金额',
  '代金券后消费金额',
  '输入消费数',
  '输出消费数',
  '总消费数',
  '消费时间',
  '消费结果',
];

/**
 * 解析 CSV 文件
 * @param file CSV 文件对象
 * @returns 解析后的数据
 */
export async function parseCSV(file: File): Promise<ParsedData> {
  // 动态导入 papaparse
  const Papa = await import('papaparse');

  return new Promise((resolve, reject) => {
    Papa.default.parse(file, {
      header: true,
      skipEmptyLines: true,
      transform: (value: string) => {
        // 处理 CSV 中的 <nil> 字符串
        if (value === '<nil>' || value === 'nil' || value === 'NULL') {
          return '';
        }
        return value;
      },
      complete: (results) => {
        try {
          const records = processRecords(results.data as RawCSVRow[]);
          const summary = calculateSummary(records);
          resolve({ records, summary });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`CSV 解析失败: ${error.message}`));
      },
    });
  });
}

/**
 * 处理 CSV 原始数据
 */
function processRecords(data: RawCSVRow[]): BillRecord[] {
  if (!data || data.length === 0) {
    throw new Error('CSV 文件为空');
  }

  // 检查必需字段
  const headers = Object.keys(data[0]);
  const missingFields = REQUIRED_FIELDS.filter(field => !headers.includes(field));
  if (missingFields.length > 0) {
    throw new Error(`缺少必需字段: ${missingFields.join(', ')}`);
  }

  const records: BillRecord[] = [];

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const record = mapRowToRecord(row, i + 2); // +2 跳过表头和考虑 0 索引
    records.push(record);
  }

  return records;
}

/**
 * 将 CSV 行映射为 BillRecord
 */
function mapRowToRecord(row: RawCSVRow, rowNum: number): BillRecord {
  const record: Partial<BillRecord> = {};

  for (const [csvField, typeField] of Object.entries(FIELD_MAPPING)) {
    let value = row[csvField];

    // 处理特殊值：nil、null、空字符串
    if (value === undefined || value === null || value === '' || (typeof value === 'string' && value.toLowerCase() === 'nil')) {
      // 数值字段默认为 0，其他字段默认为空字符串
      if (['amount', 'amountAfterCoupon', 'inputTokens', 'outputTokens', 'totalTokens'].includes(typeField)) {
        (record as Record<string, unknown>)[typeField] = 0;
        continue;
      }
      if (typeField === 'result') {
        (record as Record<string, unknown>).result = 'SUCCESS';
        continue;
      }
      (record as Record<string, unknown>)[typeField] = '';
      continue;
    }

    switch (typeField) {
      case 'amount':
      case 'amountAfterCoupon':
        record[typeField] = parseFloat(value);
        if (isNaN(record[typeField]!)) {
          throw new Error(`第 ${rowNum} 行 ${csvField} 格式错误: ${value}`);
        }
        break;

      case 'inputTokens':
      case 'outputTokens':
      case 'totalTokens':
        record[typeField] = parseInt(value, 10);
        if (isNaN(record[typeField]!)) {
          throw new Error(`第 ${rowNum} 行 ${csvField} 格式错误: ${value}`);
        }
        break;

      case 'result':
        const result = value.toUpperCase();
        if (result !== 'SUCCESS' && result !== 'FAIL') {
          throw new Error(`第 ${rowNum} 行消费结果格式错误: ${value}`);
        }
        record.result = result as 'SUCCESS' | 'FAIL';
        break;

      default:
        record[typeField] = value;
    }
  }

  return record as BillRecord;
}

/**
 * 计算统计摘要
 */
function calculateSummary(records: BillRecord[]): ParsedData['summary'] {
  if (records.length === 0) {
    return {
      totalAmount: 0,
      totalTokens: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCalls: 0,
      successCalls: 0,
      failedCalls: 0,
      dateRange: { start: '', end: '' },
      models: [],
      apiKeys: [],
      apiNames: [],
    };
  }

  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);
  const totalTokens = records.reduce((sum, r) => sum + r.totalTokens, 0);
  const totalInputTokens = records.reduce((sum, r) => sum + r.inputTokens, 0);
  const totalOutputTokens = records.reduce((sum, r) => sum + r.outputTokens, 0);
  const successCalls = records.filter(r => r.result === 'SUCCESS').length;
  const failedCalls = records.filter(r => r.result === 'FAIL').length;

  // 提取唯一值
  const models = [...new Set(records.map(r => r.model))];
  const apiKeys = [...new Set(records.map(r => r.apiKeyName))];
  const apiNames = [...new Set(records.map(r => r.apiName))];

  // 解析时间范围
  const timestamps = records.map(r => parseTimestamp(r.timestamp)).filter(Boolean) as Date[];
  timestamps.sort((a, b) => a.getTime() - b.getTime());

  const dateRange = {
    start: timestamps.length > 0 ? formatDate(timestamps[0]) : '',
    end: timestamps.length > 0 ? formatDate(timestamps[timestamps.length - 1]) : '',
  };

  return {
    totalAmount,
    totalTokens,
    totalInputTokens,
    totalOutputTokens,
    totalCalls: records.length,
    successCalls,
    failedCalls,
    dateRange,
    models,
    apiKeys,
    apiNames,
  };
}

/**
 * 解析时间戳字符串
 * 格式: "YYYY-MM-DD HH:00-HH:MM"
 */
function parseTimestamp(timestamp: string): Date | null {
  // 提取日期部分 "YYYY-MM-DD"
  const match = timestamp.match(/^(\d{4}-\d{2}-\d{2})/);
  if (!match) return null;

  return new Date(match[1]);
}

/**
 * 格式化日期
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 按小时聚合数据
 */
export function aggregateByHour(records: BillRecord[]): ChartDataPoint[] {
  const map = new Map<string, number>();

  for (const record of records) {
    // 提取小时: "2026-03-08 23:00-24:00" -> "23:00"
    const match = record.timestamp.match(/(\d{2}:\d{2})-\d{2}:\d{2}/);
    if (!match) continue;

    const hour = match[1];
    map.set(hour, (map.get(hour) || 0) + record.totalTokens);
  }

  // 按小时排序
  const result: ChartDataPoint[] = [];
  for (let i = 0; i < 24; i++) {
    const hour = String(i).padStart(2, '0') + ':00';
    result.push({
      name: hour,
      value: map.get(hour) || 0,
    });
  }

  return result;
}

/**
 * 按接口聚合数据
 */
export function aggregateByApi(records: BillRecord[]): ChartDataPoint[] {
  const map = new Map<string, number>();

  for (const record of records) {
    const current = map.get(record.apiName) || 0;
    map.set(record.apiName, current + record.totalTokens);
  }

  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

/**
 * 按模型聚合数据
 */
export function aggregateByModel(records: BillRecord[]): ChartDataPoint[] {
  const map = new Map<string, number>();

  for (const record of records) {
    const current = map.get(record.model) || 0;
    map.set(record.model, current + record.totalTokens);
  }

  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

/**
 * 计算趋势数据
 */
export function getTrendData(
  records: BillRecord[],
  groupBy: 'hour' | 'day'
): ChartDataPoint[] {
  if (groupBy === 'hour') {
    return aggregateByHour(records);
  }

  // 按天聚合
  const map = new Map<string, number>();

  for (const record of records) {
    const date = parseTimestamp(record.timestamp);
    if (!date) continue;

    const dayKey = formatDate(date);
    map.set(dayKey, (map.get(dayKey) || 0) + record.totalTokens);
  }

  // 按日期排序
  const sortedDays = Array.from(map.keys()).sort();

  return sortedDays.map(day => ({
    name: day,
    value: map.get(day) || 0,
  }));
}
