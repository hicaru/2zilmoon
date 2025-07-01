import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height = '1rem',
  borderRadius = '4px',
  count = 1,
}) => {
  const skeletonStyle = {
    width,
    height,
    borderRadius,
  };

  if (count === 1) {
    return (
      <div 
        className={`${styles.skeleton} ${className}`}
        style={skeletonStyle}
      />
    );
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${styles.skeleton} ${className}`}
          style={skeletonStyle}
        />
      ))}
    </>
  );
};

export const SkeletonCard: React.FC = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.cardHeader}>
      <Skeleton height="24px" width="60%" />
      <Skeleton height="20px" width="80px" borderRadius="20px" />
    </div>
    <div className={styles.cardInfo}>
      <div className={styles.infoRow}>
        <Skeleton height="16px" width="40%" />
        <Skeleton height="16px" width="50%" />
      </div>
      <div className={styles.infoRow}>
        <Skeleton height="16px" width="35%" />
        <Skeleton height="16px" width="45%" />
      </div>
    </div>
    <div className={styles.cardMetrics}>
      <div className={styles.metric}>
        <Skeleton height="14px" width="60px" />
        <Skeleton height="20px" width="80px" />
      </div>
      <div className={styles.metric}>
        <Skeleton height="14px" width="60px" />
        <Skeleton height="20px" width="80px" />
      </div>
    </div>
    <Skeleton height="40px" width="100%" borderRadius="8px" />
  </div>
);

export const SkeletonSummary: React.FC = () => (
  <div className={styles.skeletonSummary}>
    <Skeleton height="32px" width="300px" className={styles.title} />
    <div className={styles.statsGrid}>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className={styles.statCard}>
          <Skeleton height="16px" width="80px" />
          <Skeleton height="28px" width="120px" />
        </div>
      ))}
    </div>
  </div>
);

