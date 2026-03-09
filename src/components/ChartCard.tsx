import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import styles from './ChartCard.module.css';
import { ChartDataPoint } from '../types';

interface ChartCardProps {
  title: string;
  data: ChartDataPoint[];
  type: 'line' | 'bar' | 'pie';
  options?: {
   GranularitySelect?: boolean;
    granularity?: 'hour' | 'day';
    onGranularityChange?: (value: 'hour' | 'day') => void;
  };
}

// 深色主题颜色
const CHART_COLORS = ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

export function ChartCard({ title, data, type, options }: ChartCardProps) {
  const chartOption = useMemo(() => {
    if (type === 'pie') {
      return {
        tooltip: {
          trigger: 'item',
          backgroundColor: '#232328',
          borderColor: 'rgba(255,255,255,0.1)',
          textStyle: { color: '#fafafa' },
          formatter: '{b}: {c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          right: 10,
          top: 'center',
          textStyle: { color: '#8b8b8d', fontSize: 12 },
          itemWidth: 12,
          itemHeight: 12,
          itemGap: 8,
        },
        series: [
          {
            type: 'pie',
            radius: ['45%', '70%'],
            center: ['35%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 6,
              borderColor: '#141416',
              borderWidth: 2,
            },
            label: {
              show: false,
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 14,
                fontWeight: 'bold',
                color: '#fafafa',
              },
            },
            data: data.map((item, index) => ({
              value: item.value,
              name: item.name,
              itemStyle: { color: CHART_COLORS[index % CHART_COLORS.length] },
            })),
          },
        ],
      };
    }

    // Line or Bar chart
    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#232328',
        borderColor: 'rgba(255,255,255,0.1)',
        textStyle: { color: '#fafafa' },
        axisPointer: {
          type: 'cross',
          crossStyle: { color: '#8b8b8d' },
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.name),
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        axisLabel: {
          color: '#8b8b8d',
          fontSize: 11,
          interval: type === 'line' ? 'auto' : 0,
        },
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: {
          color: '#8b8b8d',
          fontSize: 11,
          formatter: (value: number) => {
            if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
            return value.toString();
          },
        },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } },
      },
      series: [
        {
          data: data.map(item => item.value),
          type: type === 'bar' ? 'bar' : 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          lineStyle: {
            color: '#ec4899',
            width: 2,
          },
          itemStyle: {
            color: '#ec4899',
          },
          areaStyle: type === 'line' ? {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(236, 72, 153, 0.3)' },
                { offset: 1, color: 'rgba(236, 72, 153, 0)' },
              ],
            },
          } : undefined,
        },
      ],
    };
  }, [data, type]);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {options?.GranularitySelect && (
          <div className={styles.controls}>
            <select
              className={styles.select}
              value={options.granularity}
              onChange={(e) => options.onGranularityChange?.(e.target.value as 'hour' | 'day')}
            >
              <option value="day">按天</option>
              <option value="hour">按小时</option>
            </select>
          </div>
        )}
      </div>
      <div className={styles.chartContainer}>
        <ReactECharts
          option={chartOption}
          style={{ height: '100%', width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </div>
    </div>
  );
}
