import styles from './StatsCard.module.css';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    text: string;
  };
  tokenBreakdown?: {
    label: string;
    value: string;
  }[];
}

export function StatsCard({
  icon,
  label,
  value,
  subValue,
  trend,
  tokenBreakdown,
}: StatsCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>{icon}</div>
        <span className={styles.label}>{label}</span>
      </div>
      <div className={styles.value}>{value}</div>
      {subValue && <div className={styles.subValue}>{subValue}</div>}
      {trend && (
        <div
          className={`${styles.trend} ${
            trend.direction === 'up'
              ? styles.trendUp
              : trend.direction === 'down'
              ? styles.trendDown
              : styles.trendNeutral
          }`}
        >
          {trend.direction === 'up' ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="18,15 12,9 6,15" />
            </svg>
          ) : trend.direction === 'down' ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6,9 12,15 18,9" />
            </svg>
          ) : null}
          <span>{trend.text}</span>
        </div>
      )}
      {tokenBreakdown && (
        <div className={styles.tokenBreakdown}>
          {tokenBreakdown.map((item, index) => (
            <div key={index} className={styles.tokenItem}>
              <span className={styles.tokenLabel}>{item.label}:</span>
              <span className={styles.tokenValue}>{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 预设图标
export const Icons = {
  money: (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  token: (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  call: (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  success: (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22,4 12,14.01 9,11.01" />
    </svg>
  ),
};
