import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockSuggestions, mockExecutionRecords } from '@/data/strategy';
import { EnergySuggestion, ExecutionRecord } from '@/types';

const ReportsPage: React.FC = () => {
  const [suggestions, setSuggestions] = useState<EnergySuggestion[]>(mockSuggestions);
  const [records] = useState<ExecutionRecord[]>(mockExecutionRecords);

  const implementedCount = suggestions.filter(s => s.implemented).length;
  const totalSavingPotential = suggestions.reduce((sum, s) => sum + s.savingPotential, 0);
  const implementedSaving = suggestions.filter(s => s.implemented).reduce((sum, s) => sum + s.savingPotential, 0);

  const totalSavedEnergy = records.reduce((sum, r) => sum + (r.savedEnergy || 0), 0);
  const totalSavedMoney = records.reduce((sum, r) => sum + (r.savedMoney || 0), 0);

  const handleImplement = (suggestion: EnergySuggestion, e) => {
    e.stopPropagation();
    console.log('[Reports] Implement suggestion:', suggestion.title);
    
    if (suggestion.implemented) return;

    Taro.showModal({
      title: '确认执行',
      content: `确定要执行"${suggestion.title}"吗？`,
      success: (res) => {
        if (res.confirm) {
          setSuggestions(prev =>
            prev.map(s => {
              if (s.id === suggestion.id) {
                return { ...s, implemented: true };
              }
              return s;
            })
          );
          Taro.showToast({
            title: '已加入执行计划',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  };

  const handleExport = () => {
    console.log('[Reports] Export report');
    Taro.showToast({
      title: '报表导出功能开发中',
      icon: 'none',
      duration: 1500
    });
  };

  const handleShare = () => {
    console.log('[Reports] Share report');
    Taro.showToast({
      title: '分享功能开发中',
      icon: 'none',
      duration: 1500
    });
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      device: '💡',
      behavior: '🧘',
      strategy: '⚙️'
    };
    return icons[type] || '📋';
  };

  const getTypeName = (type: string) => {
    const names: Record<string, string> = {
      device: '设备升级',
      behavior: '行为习惯',
      strategy: '智能策略'
    };
    return names[type] || type;
  };

  const getRecordIcon = (action: string) => {
    if (action.includes('避峰')) return '⚡';
    if (action.includes('储能')) return '🔋';
    if (action.includes('温度')) return '🌡️';
    if (action.includes('离家')) return '🏠';
    return '✅';
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.summaryCard}>
        <Text className={styles.summaryTitle}>本月节能概览</Text>
        
        <View className={styles.summaryStats}>
          <View className={styles.summaryStat}>
            <Text className={styles.statValue}>
              {totalSavedEnergy.toFixed(1)}
              <Text className={styles.statUnit}>kWh</Text>
            </Text>
            <Text className={styles.statLabel}>已节省电量</Text>
          </View>
          <View className={styles.summaryStat}>
            <Text className={styles.statValue}>
              ¥{totalSavedMoney.toFixed(0)}
            </Text>
            <Text className={styles.statLabel}>已节省电费</Text>
          </View>
          <View className={styles.summaryStat}>
            <Text className={styles.statValue}>
              {implementedCount}/{suggestions.length}
            </Text>
            <Text className={styles.statLabel}>已采纳建议</Text>
          </View>
        </View>

        <Text className={styles.summaryDesc}>
          您已采纳 {implementedCount} 条节能建议，预计每月可节省 ¥{implementedSaving.toFixed(0)} 元电费。
          还有 {suggestions.length - implementedCount} 条建议等待您的采纳。
        </Text>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>节能建议</Text>
          <Text className={styles.sectionMore}>可省 ¥{totalSavingPotential.toFixed(0)}/月</Text>
        </View>

        <View className={styles.suggestionList}>
          {suggestions.map(suggestion => (
            <View
              key={suggestion.id}
              className={classnames(styles.suggestionCard, suggestion.implemented && styles.implemented)}
            >
              <View className={styles.suggestionHeader}>
                <View className={classnames(styles.suggestionIcon, styles[suggestion.type])}>
                  {getTypeIcon(suggestion.type)}
                </View>
                <View className={styles.suggestionInfo}>
                  <Text className={styles.suggestionTitle}>{suggestion.title}</Text>
                  <Text className={styles.suggestionType}>{getTypeName(suggestion.type)}</Text>
                </View>
              </View>

              <Text className={styles.suggestionDesc}>{suggestion.description}</Text>

              <View className={styles.suggestionFooter}>
                <Text className={styles.savingPotential}>
                  预计月省 ¥{suggestion.savingPotential}
                </Text>
                <View
                  className={classnames(styles.implementBtn, suggestion.implemented && styles.implemented)}
                  onClick={(e) => handleImplement(suggestion, e)}
                >
                  {suggestion.implemented ? '已采纳' : '立即采纳'}
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>执行记录</Text>
          <Text className={styles.sectionMore}>查看全部 ›</Text>
        </View>

        <View className={styles.recordList}>
          {records.map(record => (
            <View key={record.id} className={styles.recordItem}>
              <View className={styles.recordIcon}>
                {getRecordIcon(record.action)}
              </View>
              <View className={styles.recordContent}>
                <Text className={styles.recordAction}>{record.action}</Text>
                <Text className={styles.recordResult}>{record.result}</Text>
                <Text className={styles.recordTime}>{record.time}</Text>
              </View>
              <View className={styles.recordSaving}>
                <Text className={styles.savedEnergy}>
                  +{(record.savedEnergy || 0).toFixed(1)} kWh
                </Text>
                <Text className={styles.savedMoney}>
                  省¥{(record.savedMoney || 0).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default ReportsPage;
