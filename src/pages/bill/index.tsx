import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockDailyBill, mockMonthlyBill } from '@/data/bill';
import { BillData } from '@/types';
import { formatEnergy, formatMoney, formatCarbon } from '@/utils';

const BillPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'day' | 'month'>('day');

  const billData: BillData[] = useMemo(() => {
    return viewMode === 'day' ? mockDailyBill : mockMonthlyBill;
  }, [viewMode]);

  const currentData = billData[billData.length - 1];
  const previousData = billData[billData.length - 2];

  const totalEnergy = useMemo(() => {
    return billData.reduce((sum, item) => sum + item.energy, 0);
  }, [billData]);

  const totalCost = useMemo(() => {
    return billData.reduce((sum, item) => sum + item.cost, 0);
  }, [billData]);

  const totalCarbon = useMemo(() => {
    return billData.reduce((sum, item) => sum + item.carbon, 0);
  }, [billData]);

  const totalSaved = useMemo(() => {
    return billData.reduce((sum, item) => sum + item.savedMoney, 0);
  }, [billData]);

  const maxEnergy = useMemo(() => {
    return Math.max(...billData.map(item => item.energy));
  }, [billData]);

  const peakEnergyRatio = useMemo(() => {
    if (currentData.energy === 0) return 0;
    return (currentData.peakEnergy / currentData.energy) * 100;
  }, [currentData]);

  const valleyEnergyRatio = useMemo(() => {
    if (currentData.energy === 0) return 0;
    return (currentData.valleyEnergy / currentData.energy) * 100;
  }, [currentData]);

  const flatEnergyRatio = useMemo(() => {
    return Math.max(0, 100 - peakEnergyRatio - valleyEnergyRatio);
  }, [peakEnergyRatio, valleyEnergyRatio]);

  const compareText = useMemo(() => {
    if (!previousData) return '';
    const diff = currentData.cost - previousData.cost;
    const percent = ((diff / previousData.cost) * 100).toFixed(1);
    if (diff > 0) {
      return `较昨日增长 ${percent}%`;
    }
    return `较昨日下降 ${Math.abs(Number(percent))}%`;
  }, [currentData, previousData]);

  const handleViewModeChange = (mode: 'day' | 'month') => {
    console.log('[Bill] Switch view mode:', mode);
    setViewMode(mode);
  };

  const handleExport = () => {
    console.log('[Bill] Export bill');
    Taro.showToast({
      title: '账单导出功能开发中',
      icon: 'none',
      duration: 1500
    });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.headerCard}>
        <View className={styles.headerTop}>
          <Text className={styles.headerTitle}>
            {viewMode === 'day' ? '今日电费' : '本月电费'}
          </Text>
          <View className={styles.periodTabs}>
            <View
              className={classnames(styles.periodTab, viewMode === 'day' && styles.active)}
              onClick={() => handleViewModeChange('day')}
            >
              日
            </View>
            <View
              className={classnames(styles.periodTab, viewMode === 'month' && styles.active)}
              onClick={() => handleViewModeChange('month')}
            >
              月
            </View>
          </View>
        </View>

        <View className={styles.totalSection}>
          <Text className={styles.totalLabel}>
            {viewMode === 'day' ? '今日用电费用' : '本月用电费用'}
          </Text>
          <Text className={classnames(styles.totalValue, styles.yuan)}>
            {currentData.cost.toFixed(2)}
          </Text>
          <Text className={styles.compareText}>{compareText}</Text>
        </View>

        <View className={styles.headerStats}>
          <View className={styles.headerStat}>
            <Text className={styles.headerStatValue}>{currentData.energy.toFixed(1)}</Text>
            <Text className={styles.headerStatLabel}>电量(kWh)</Text>
          </View>
          <View className={styles.headerStat}>
            <Text className={styles.headerStatValue}>{currentData.carbon.toFixed(1)}</Text>
            <Text className={styles.headerStatLabel}>碳排(kg)</Text>
          </View>
          <View className={styles.headerStat}>
            <Text className={styles.headerStatValue}>¥{currentData.savedMoney.toFixed(1)}</Text>
            <Text className={styles.headerStatLabel}>已省钱</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            {viewMode === 'day' ? '近7天用电趋势' : '近6个月用电趋势'}
          </Text>
          <Text className={styles.sectionSubtitle} onClick={handleExport}>
            导出 ›
          </Text>
        </View>

        <View className={styles.chartContainer}>
          <View className={styles.chartBars}>
            {billData.map((item, index) => {
              const heightPercent = maxEnergy > 0 ? (item.energy / maxEnergy) * 100 : 0;
              return (
                <View key={index} className={styles.chartBarWrap}>
                  <Text className={styles.chartBarValue}>{item.energy.toFixed(1)}</Text>
                  <View
                    className={classnames(styles.chartBar)}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <Text className={styles.chartBarLabel}>{item.date}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View className={styles.peakValleySection}>
          <Text className={styles.peakValleyTitle}>峰谷电量分布</Text>
          <View className={styles.peakValleyBars}>
            <View className={styles.peakValleyItem}>
              <Text className={styles.pvLabel}>峰时</Text>
              <View className={styles.pvBarWrap}>
                <View
                  className={classnames(styles.pvBar, styles.peak)}
                  style={{ width: `${peakEnergyRatio}%` }}
                />
              </View>
              <Text className={styles.pvValue}>{currentData.peakEnergy.toFixed(1)} kWh</Text>
            </View>
            <View className={styles.peakValleyItem}>
              <Text className={styles.pvLabel}>平时</Text>
              <View className={styles.pvBarWrap}>
                <View
                  className={classnames(styles.pvBar, styles.flat)}
                  style={{ width: `${flatEnergyRatio}%` }}
                />
              </View>
              <Text className={styles.pvValue}>
                {(currentData.energy - currentData.peakEnergy - currentData.valleyEnergy).toFixed(1)} kWh
              </Text>
            </View>
            <View className={styles.peakValleyItem}>
              <Text className={styles.pvLabel}>谷时</Text>
              <View className={styles.pvBarWrap}>
                <View
                  className={classnames(styles.pvBar, styles.valley)}
                  style={{ width: `${valleyEnergyRatio}%` }}
                />
              </View>
              <Text className={styles.pvValue}>{currentData.valleyEnergy.toFixed(1)} kWh</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.savingCard}>
        <View className={styles.savingHeader}>
          <View className={styles.savingIcon}>💰</View>
          <View>
            <Text className={styles.savingTitle}>
              {viewMode === 'day' ? '今日省钱' : '累计省钱'}
            </Text>
          </View>
        </View>
        <Text className={styles.savingAmount}>¥{totalSaved.toFixed(2)}</Text>
        <Text className={styles.savingDesc}>
          通过智能调节和避峰用电策略，
          {viewMode === 'day' ? '今日' : '本月'}已为您节省 {totalSaved.toFixed(0)} 元电费。
        </Text>
        <View className={styles.savingTips}>
          <View className={styles.savingTipItem}>
            <View className={styles.tipDot} />
            <Text>储能充放电贡献 45%</Text>
          </View>
          <View className={styles.savingTipItem}>
            <View className={styles.tipDot} />
            <Text>避峰用电贡献 35%</Text>
          </View>
          <View className={styles.savingTipItem}>
            <View className={styles.tipDot} />
            <Text>温度智能调节贡献 20%</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default BillPage;
