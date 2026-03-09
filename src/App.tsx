import { useBillData } from './hooks/useBillData';
import { DropZone, StatsCard, Icons, ChartCard, DataTable, RangeSelector } from './components';
import styles from './App.module.css';

function App() {
  const {
    summary,
    rangeSummary,
    isLoading,
    error,
    selectedModel,
    selectedApi,
    searchKeyword,
    trendData,
    apiDistribution,
    modelDistribution,
    inputOutputTrendData,
    hourlyDistribution,
    handleFileUpload,
    setSelectedModel,
    setSelectedApi,
    setSearchKeyword,
    reset,
    records,
    granularity,
    setGranularity,
    timelineData,
    setDateRange,
  } = useBillData();

  const formatCurrency = (value: number) => {
    return `¥${value.toFixed(2)}`;
  };

  const formatTokens = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const hasData = summary && summary.totalCalls > 0;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className={styles.logoText}>MiniMax 账单</span>
        </div>
        {hasData && (
          <button className={styles.resetBtn} onClick={reset}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            重新上传
          </button>
        )}
      </header>

      <main className={styles.main}>
        {error && (
          <div className={styles.error}>
            <svg className={styles.errorIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {!hasData ? (
          <section className={styles.dropSection}>
            <DropZone onFileSelect={handleFileUpload} isLoading={isLoading} />
          </section>
        ) : (
          <>
            {/* 时间区间选择器 */}
            <RangeSelector
              data={timelineData}
              onRangeChange={(start, end) => setDateRange({ start, end })}
            />

            {/* 统计卡片 */}
            <section className={styles.statsGrid}>
              <StatsCard
                icon={Icons.money}
                label="总消费金额"
                value={formatCurrency(rangeSummary?.totalAmount ?? 0)}
                subValue={`${rangeSummary?.dateRange.start ?? ''} - ${rangeSummary?.dateRange.end ?? ''}`}
              />
              <StatsCard
                icon={Icons.token}
                label="Token 消耗"
                value={formatTokens(rangeSummary?.totalTokens ?? 0)}
                tokenBreakdown={[
                  { label: '输入', value: formatTokens(rangeSummary?.totalInputTokens ?? 0) },
                  { label: '输出', value: formatTokens(rangeSummary?.totalOutputTokens ?? 0) },
                ]}
              />
              <StatsCard
                icon={Icons.call}
                label="调用次数"
                value={(rangeSummary?.totalCalls ?? 0).toLocaleString()}
              />
              <StatsCard
                icon={Icons.success}
                label="成功率"
                value={`${rangeSummary && rangeSummary.totalCalls > 0 ? ((rangeSummary.successCalls / rangeSummary.totalCalls) * 100).toFixed(1) : 0}%`}
                subValue={`成功: ${rangeSummary?.successCalls ?? 0} | 失败: ${rangeSummary?.failedCalls ?? 0}`}
              />
              <StatsCard
                icon={Icons.money}
                label="单次调用成本"
                value={formatCurrency(rangeSummary?.avgCostPerCall ?? 0)}
                subValue="平均每次 API 调用费用"
              />
            </section>

            {/* 区间切换器 */}
            <div className={styles.granularityWrapper}>
              <div className={styles.granularitySelector}>
                <button
                  className={`${styles.granularityBtn} ${granularity === 'day' ? styles.active : ''}`}
                  onClick={() => setGranularity('day')}
                >
                  <span className={styles.granularityDot} />
                  按天
                </button>
                <button
                  className={`${styles.granularityBtn} ${granularity === 'hour' ? styles.active : ''}`}
                  onClick={() => setGranularity('hour')}
                >
                  <span className={styles.granularityDot} />
                  按小时
                </button>
                <div
                  className={styles.granularityIndicator}
                  style={{ transform: granularity === 'hour' ? 'translateX(100%)' : 'translateX(0)' }}
                />
              </div>
            </div>

            {/* 图表 */}
            <section className={styles.chartsGrid}>
              <ChartCard
                title="消费趋势 (Token)"
                data={trendData}
                type="line"
              />
              <ChartCard
                title="接口分布"
                data={apiDistribution}
                type="pie"
              />
              <ChartCard
                title="模型分布"
                data={modelDistribution}
                type="bar"
              />
              <ChartCard
                title="Input vs Output Token"
                data={inputOutputTrendData}
                type="inputOutput"
              />
              <ChartCard
                title="24小时调用分布"
                data={hourlyDistribution}
                type="hourly"
              />
              <ChartCard
                title="消费趋势 (金额)"
                data={trendData.map(d => ({
                  name: d.name,
                  value: d.value * 0.0001, // 假设 token 单价
                }))}
                type="bar"
              />
            </section>

            {/* 数据表格 */}
            <section className={styles.tableSection}>
              <DataTable
                records={records}
                models={summary.models}
                apiNames={summary.apiNames}
                selectedModel={selectedModel}
                selectedApi={selectedApi}
                searchKeyword={searchKeyword}
                onModelChange={setSelectedModel}
                onApiChange={setSelectedApi}
                onSearchChange={setSearchKeyword}
              />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
