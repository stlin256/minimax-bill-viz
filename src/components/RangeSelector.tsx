import { useState, useRef, useCallback, useEffect } from 'react';
import styles from './RangeSelector.module.css';

interface RangeSelectorProps {
  data: { date: string; value: number }[];
  onRangeChange: (startIndex: number, endIndex: number) => void;
}

export function RangeSelector({ data, onRangeChange }: RangeSelectorProps) {
  const [range, setRange] = useState({ start: 0, end: data.length - 1 });
  const [displayRange, setDisplayRange] = useState({ start: 0, end: data.length - 1 });
  const [isDragging, setIsDragging] = useState<'start' | 'end' | 'both' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const dragStartRange = useRef({ start: 0, end: 0 });

  const maxValue = Math.max(...data.map(d => d.value), 1);

  const handleMouseDown = useCallback((type: 'start' | 'end' | 'both', e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(type);
    dragStartX.current = e.clientX;
    dragStartRange.current = { ...range };
  }, [range]);

  // 双击选择某一天
  const handleBarDoubleClick = useCallback((index: number) => {
    const newRange = { start: index, end: index };
    setRange(newRange);
    setDisplayRange(newRange);
    onRangeChange(index, index);
  }, [onRangeChange]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));

    setRange(prev => {
      let newRange = { ...prev };
      if (isDragging === 'start') {
        newRange.start = Math.min(Math.round(percentage * (data.length - 1)), prev.end);
      } else if (isDragging === 'end') {
        newRange.end = Math.max(Math.round(percentage * (data.length - 1)), prev.start);
      } else if (isDragging === 'both') {
        const diff = dragStartRange.current.end - dragStartRange.current.start;
        const startPercentage = percentage - (diff / (data.length - 1)) / 2;
        const newStart = Math.max(0, Math.round(startPercentage * (data.length - 1)));
        newRange.start = newStart;
        newRange.end = Math.min(data.length - 1, newStart + diff);
      }

      // 拖拽时直接更新 displayRange 实现实时跟手
      setDisplayRange(newRange);
      return newRange;
    });
  }, [isDragging, data.length]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      onRangeChange(range.start, range.end);
    }
    setIsDragging(null);
  }, [isDragging, range, onRangeChange]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    setRange({ start: 0, end: data.length - 1 });
    setDisplayRange({ start: 0, end: data.length - 1 });
  }, [data.length]);

  if (data.length === 0) return null;

  const leftPercent = (displayRange.start / (data.length - 1)) * 100;
  const rightPercent = (displayRange.end / (data.length - 1)) * 100;
  const rangeWidth = rightPercent - leftPercent;

  const formatDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length >= 3) {
      return `${parseInt(parts[1])}/${parseInt(parts[2])}`;
    }
    return dateStr;
  };

  const dayCount = displayRange.end - displayRange.start + 1;
  const isSingleDay = displayRange.start === displayRange.end;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>时间区间筛选</span>
        <span className={styles.dateRange}>
          {isSingleDay
            ? formatDate(data[displayRange.start]?.date || '')
            : `${formatDate(data[displayRange.start]?.date || '')} - ${formatDate(data[displayRange.end]?.date || '')}`
          }
          <span className={styles.dayCount}>（{dayCount} 天）</span>
        </span>
      </div>

      <div className={styles.timelineWrapper}>
        <div className={styles.timeline} ref={containerRef}>
          {/* 背景柱状图 */}
          <div className={styles.bars}>
            {data.map((item, i) => (
              <div
                key={i}
                className={`${styles.bar} ${i >= displayRange.start && i <= displayRange.end ? styles.barActive : ''}`}
                style={{ height: `${(item.value / maxValue) * 100}%` }}
                onDoubleClick={() => handleBarDoubleClick(i)}
              />
            ))}
          </div>

          {/* 选中区域遮罩 */}
          <div
            className={styles.selectionOverlay}
            style={{
              left: `${leftPercent}%`,
              width: `${rangeWidth}%`,
            }}
          />

          {/* 左侧把手 */}
          <div
            className={`${styles.handle} ${styles.handleLeft} ${isDragging === 'start' || isDragging === 'both' ? styles.handleDragging : ''}`}
            style={{ left: `${leftPercent}%` }}
            onMouseDown={(e) => handleMouseDown('start', e)}
          >
            <div className={styles.handleBar} />
            <div className={styles.handleArrow}>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* 右侧把手 */}
          <div
            className={`${styles.handle} ${styles.handleRight} ${isDragging === 'end' || isDragging === 'both' ? styles.handleDragging : ''}`}
            style={{ left: `${rightPercent}%` }}
            onMouseDown={(e) => handleMouseDown('end', e)}
          >
            <div className={styles.handleBar} />
            <div className={styles.handleArrow}>
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* 中间区域可拖动 */}
          <div
            className={styles.middleHandle}
            style={{
              left: `${leftPercent}%`,
              width: `${rangeWidth}%`,
            }}
            onMouseDown={(e) => handleMouseDown('both', e)}
          />
        </div>

        {/* 日期标签 */}
        <div className={styles.dateLabels}>
          <span>{formatDate(data[0]?.date || '')}</span>
          <span>{formatDate(data[Math.floor(data.length / 2)]?.date || '')}</span>
          <span>{formatDate(data[data.length - 1]?.date || '')}</span>
        </div>
      </div>
    </div>
  );
}
