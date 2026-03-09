import { useState, useMemo, useCallback } from 'react';
import styles from './DataTable.module.css';
import { BillRecord } from '../types';

interface DataTableProps {
  records: BillRecord[];
  models: string[];
  apiNames: string[];
  selectedModel: string | null;
  selectedApi: string | null;
  searchKeyword: string;
  onModelChange: (model: string | null) => void;
  onApiChange: (api: string | null) => void;
  onSearchChange: (keyword: string) => void;
}

const PAGE_SIZE = 20;

export function DataTable({
  records,
  models,
  apiNames,
  selectedModel,
  selectedApi,
  searchKeyword,
  onModelChange,
  onApiChange,
  onSearchChange,
}: DataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // 过滤后的记录
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      if (selectedModel && record.model !== selectedModel) return false;
      if (selectedApi && record.apiName !== selectedApi) return false;
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        if (
          !record.apiName.toLowerCase().includes(keyword) &&
          !record.model.toLowerCase().includes(keyword) &&
          !record.apiKeyName.toLowerCase().includes(keyword)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [records, selectedModel, selectedApi, searchKeyword]);

  // 分页
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredRecords.slice(start, start + PAGE_SIZE);
  }, [filteredRecords, currentPage]);

  const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE);

  const handleExport = useCallback(() => {
    // CSV 导出
    const headers = ['时间', '接口', '模型', '金额', '输入Token', '输出Token', '总Token', '结果'];
    const rows = filteredRecords.map(record => [
      record.timestamp,
      record.apiName,
      record.model,
      record.amount.toFixed(4),
      record.inputTokens,
      record.outputTokens,
      record.totalTokens,
      record.result,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `minimax_bill_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [filteredRecords]);

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatTime = (timestamp: string) => {
    // "2026-03-08 23:00-24:00" -> "03-08 23:00"
    const match = timestamp.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}:\d{2})/);
    if (match) {
      return `${match[2]}-${match[3]} ${match[4]}`;
    }
    return timestamp;
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>消费明细</h3>
        <div className={styles.controls}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="搜索接口、模型..."
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <select
            className={styles.select}
            value={selectedModel || ''}
            onChange={(e) => onModelChange(e.target.value || null)}
          >
            <option value="">全部模型</option>
            {models.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
          <select
            className={styles.select}
            value={selectedApi || ''}
            onChange={(e) => onApiChange(e.target.value || null)}
          >
            <option value="">全部接口</option>
            {apiNames.map(api => (
              <option key={api} value={api}>{api}</option>
            ))}
          </select>
          <button className={styles.exportBtn} onClick={handleExport}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7,10 12,15 17,10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            导出
          </button>
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className={styles.empty}>暂无数据</div>
      ) : (
        <>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>时间</th>
                  <th>接口</th>
                  <th>模型</th>
                  <th>金额</th>
                  <th>输入</th>
                  <th>输出</th>
                  <th>总计</th>
                  <th>结果</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.map((record, index) => (
                  <tr key={index}>
                    <td className={styles.mono}>{formatTime(record.timestamp)}</td>
                    <td>{record.apiName}</td>
                    <td>{record.model}</td>
                    <td className={styles.mono}>¥{record.amount.toFixed(4)}</td>
                    <td className={styles.mono}>{formatNumber(record.inputTokens)}</td>
                    <td className={styles.mono}>{formatNumber(record.outputTokens)}</td>
                    <td className={styles.mono}>{formatNumber(record.totalTokens)}</td>
                    <td className={record.result === 'SUCCESS' ? styles.success : styles.fail}>
                      {record.result}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <div className={styles.pageInfo}>
              共 {filteredRecords.length} 条记录，第 {currentPage}/{totalPages} 页
            </div>
            <div className={styles.pageButtons}>
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                首页
              </button>
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                上一页
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    className={`${styles.pageBtn} ${currentPage === pageNum ? styles.pageBtnActive : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                下一页
              </button>
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                末页
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
