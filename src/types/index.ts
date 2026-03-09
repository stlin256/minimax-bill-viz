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
    /** 平均每次调用成本 */
    avgCostPerCall: number;
  };
}

/** 图表数据点 */
export interface ChartDataPoint {
  /** 名称/标签 */
  name: string;
  /** 数值 */
  value: number;
}
