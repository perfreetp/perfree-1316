import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface ProgressBarProps {
  percent: number;
  color?: 'primary' | 'warning' | 'error' | 'success';
  showText?: boolean;
  height?: number;
  label?: string;
  value?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percent,
  color = 'primary',
  showText = false,
  height = 12,
  label,
  value
}) => {
  const safePercent = Math.min(Math.max(percent, 0), 100);

  return (
    <View className={styles.progressWrap}>
      {(label || value) && (
        <View className={styles.progressHeader}>
          {label && <Text className={styles.label}>{label}</Text>}
          {value && <Text className={styles.value}>{value}</Text>}
        </View>
      )}
      <View className={styles.progressBar} style={{ height: `${height}rpx` }}>
        <View
          className={classnames(styles.progressFill, styles[color])}
          style={{ width: `${safePercent}%` }}
                />
      </View>
      {showText && (
        <Text className={styles.percentText}>{safePercent}%</Text>
      )}
    </View>
  );
};

export default ProgressBar;
