import { useState, useCallback, useRef, useEffect } from 'react';
import styles from './DropZone.module.css';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export function DropZone({ onFileSelect, isLoading }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMousePosition({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    };

    const container = containerRef.current;
    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const handleClick = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    };
    input.click();
  }, [onFileSelect]);

  if (isLoading) {
    return (
      <div className={styles.dropZone} ref={containerRef}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingGlow} />
          <div className={styles.loadingOrb}>
            <div className={styles.orbInner} />
            <div className={styles.orbRing} />
            <div className={styles.orbRing} />
          </div>
          <div className={styles.loadingContent}>
            <span className={styles.loadingTitle}>正在解析</span>
            <span className={styles.loadingSubtitle}>正在处理您的账单数据...</span>
            <div className={styles.loadingDots}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      style={{
        '--mouse-x': `${mousePosition.x}%`,
        '--mouse-y': `${mousePosition.y}%`,
      } as React.CSSProperties}
    >
      {/* 背景网格 */}
      <div className={styles.gridPattern} />

      {/* 渐变光晕 */}
      <div className={styles.gradientOrb} />
      <div className={styles.gradientOrb2} />

      {/* 浮动粒子 */}
      <div className={styles.particles}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className={styles.particle} style={{ '--delay': `${i * 0.5}s`, '--x': `${Math.random() * 100}%` } as React.CSSProperties} />
        ))}
      </div>

      {/* 主内容 */}
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <div className={styles.iconGlow} />
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 16.5V3.5M12 3.5L7 8.5M12 3.5L17 8.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.iconPath}
            />
            <path
              d="M3 15.5V18.5C3 19.8807 4.11929 21 5.5 21H18.5C19.8807 21 21 19.8807 21 18.5V15.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={styles.iconPath2}
            />
          </svg>
        </div>

        <div className={styles.textContent}>
          <h2 className={styles.title}>
            {isDragging ? '释放以导入' : '拖拽文件到此处'}
          </h2>
          <p className={styles.subtitle}>
            或 <span className={styles.link}>点击选择文件</span>
          </p>
        </div>

        <div className={styles.formats}>
          <span className={styles.formatBadge}>CSV</span>
          <span className={styles.formatText}>
            支持 <a
              href="https://platform.minimaxi.com/user-center/payment/billing-history"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.formatLink}
            >MiniMax 账单导出格式</a>
          </span>
        </div>
      </div>

      {/* 边框光效 */}
      <div className={styles.borderGlow} />
    </div>
  );
}
