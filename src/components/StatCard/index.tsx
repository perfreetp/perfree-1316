import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface StatCardProps {
  title: string;
  value: string;
  unit?: string;
  subText?: string;
  color?: 'primary' | 'warning' | 'error' | 'info' | 'success';
  icon?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  subText,
  color = 'primary',
  onClick
}) => {
  return (
    <View
      className={classnames(styles.statCard, styles[color])}
              onClick={onClick}
            >
      <Text className={styles.title}>{title}</Text>
      <View className={styles.valueWrap}>
        <Text className={styles.value}>{value}</Text>
        {unit && <Text className={styles.unit}>{unit}</Text>}
      </View>
      {subText && <Text className={styles.subText}>{subText}</Text>}
    </View>
  );
};

export default StatCard;
