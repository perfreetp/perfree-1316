import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface SectionTitleProps {
  title: string;
  extra?: string;
  onExtraClick?: () => void;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, extra, onExtraClick }) => {
  return (
    <View className={styles.sectionTitle}>
      <Text className={styles.titleText}>{title}</Text>
      {extra && (
        <Text className={styles.extraText} onClick={onExtraClick}>
          {extra}
        </Text>
      )}
    </View>
  );
};

export default SectionTitle;
