import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockStrategies } from '@/data/strategy';
import { Strategy } from '@/types';
import { formatMoney } from '@/utils';

const StrategyPage: React.FC = () => {
  const [strategies, setStrategies] = useState<Strategy[]>(mockStrategies);

  const enabledCount = strategies.filter(s => s.enabled).length;
  const estimatedMonthlySaving = strategies
    .filter(s => s.enabled)
    .reduce((sum, s) => {
      const savings: Record<string, number> = {
        peak_shaving: 25,
        battery_charge: 50,
        away_mode: 15,
        comfort_temp: 20
      };
      return sum + (savings[s.type] || 0);
    }, 0);

  const handleToggle = (strategy: Strategy) => {
    console.log('[Strategy] Toggle strategy:', strategy.name, 'current enabled:', strategy.enabled);
    
    setStrategies(prev =>
      prev.map(s => {
        if (s.id === strategy.id) {
          return { ...s, enabled: !s.enabled };
        }
        return s;
      })
    );

    Taro.showToast({
      title: strategy.enabled ? '已关闭策略' : '已开启策略',
      icon: 'success',
      duration: 1500
    });
  };

  const handleStrategyClick = (strategy: Strategy) => {
    console.log('[Strategy] Click strategy:', strategy.name);
    Taro.showActionSheet({
      itemList: ['策略设置', '查看效果', '使用说明'],
      success: (res) => {
        console.log('[Strategy] Selected option:', res.tapIndex);
        Taro.showToast({
          title: '功能开发中',
          icon: 'none',
          duration: 1500
        });
      }
    });
  };

  const getStrategyIcon = (type: string) => {
    const icons: Record<string, string> = {
      peak_shaving: '⚡',
      battery_charge: '🔋',
      away_mode: '🏠',
      comfort_temp: '🌡️'
    };
    return icons[type] || '💡';
  };

  const getStrategyTypeClass = (type: string) => {
    const map: Record<string, string> = {
      peak_shaving: 'peakShaving',
      battery_charge: 'battery',
      away_mode: 'away',
      comfort_temp: 'comfort'
    };
    return map[type] || '';
  };

  const getConfigDisplay = (strategy: Strategy) => {
    const configs: { label: string; value: string }[] = [];
    
    switch (strategy.type) {
      case 'peak_shaving':
        configs.push({ 
          label: '峰时最大功率', 
          value: strategy.config?.maxPeakPower ? `${strategy.config.maxPeakPower}W` : '--' 
        });
        configs.push({ 
          label: '自动调节', 
          value: strategy.config?.autoAdjust ? '开启' : '关闭' 
        });
        break;
      case 'battery_charge':
        configs.push({ 
          label: '充电时段', 
          value: `${strategy.config?.chargeStartTime || '--'} - ${strategy.config?.chargeEndTime || '--'}` 
        });
        configs.push({ 
          label: '放电时段', 
          value: `${strategy.config?.dischargeStartTime || '--'} - ${strategy.config?.dischargeEndTime || '--'}` 
        });
        break;
      case 'away_mode':
        configs.push({ 
          label: '自动检测', 
          value: strategy.config?.autoDetect ? '开启' : '手动' 
        });
        configs.push({ 
          label: '关闭设备', 
          value: strategy.config?.turnOffDevices?.length ? `${strategy.config.turnOffDevices.length}类` : '--' 
        });
        break;
      case 'comfort_temp':
        configs.push({ 
          label: '夏季温度', 
          value: strategy.config?.summerTemp ? `${strategy.config.summerTemp}°C` : '--' 
        });
        configs.push({ 
          label: '冬季温度', 
          value: strategy.config?.winterTemp ? `${strategy.config.winterTemp}°C` : '--' 
        });
        break;
    }
    
    return configs;
  };

  const getSavingText = (type: string) => {
    const savings: Record<string, string> = {
      peak_shaving: '月省约 ¥25',
      battery_charge: '月省约 ¥50',
      away_mode: '月省约 ¥15',
      comfort_temp: '月省约 ¥20'
    };
    return savings[type] || '';
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.headerCard}>
        <Text className={styles.headerTitle}>智能节能策略</Text>
        <Text className={styles.headerDesc}>
          开启智能策略，系统将根据您的用电习惯和电价时段，自动优化设备运行，帮您节省电费。
        </Text>
        <View className={styles.headerStats}>
          <View className={styles.headerStat}>
            <Text className={styles.statValue}>{enabledCount}/{strategies.length}</Text>
            <Text className={styles.statLabel}>已开启策略</Text>
          </View>
          <View className={styles.headerStat}>
            <Text className={styles.statValue}>¥{estimatedMonthlySaving}</Text>
            <Text className={styles.statLabel}>预计月省</Text>
          </View>
        </View>
      </View>

      <Text className={styles.sectionTitle}>策略列表</Text>

      <View className={styles.strategyList}>
        {strategies.map(strategy => (
          <View
            key={strategy.id}
            className={classnames(styles.strategyCard, !strategy.enabled && styles.disabled)}
            onClick={() => handleStrategyClick(strategy)}
          >
            <View className={styles.strategyHeader}>
              <View className={classnames(styles.strategyIcon, styles[getStrategyTypeClass(strategy.type)])}>
                {getStrategyIcon(strategy.type)}
              </View>
              <View className={styles.strategyInfo}>
                <Text className={styles.strategyName}>{strategy.name}</Text>
                <Text className={styles.strategyDesc}>{strategy.description}</Text>
                {strategy.enabled && (
                  <Text className={styles.effectTag}>{getSavingText(strategy.type)}</Text>
                )}
              </View>
              <View
                className={classnames(styles.switchBtn, strategy.enabled && styles.active)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle(strategy);
                }}
              >
                <View className={styles.switchDot} />
              </View>
            </View>

            {strategy.enabled && (
              <View className={styles.strategyConfig}>
                {getConfigDisplay(strategy).map((config, index) => (
                  <View key={index} className={styles.configRow}>
                    <Text className={styles.configLabel}>{config.label}</Text>
                    <View style={{ display: 'flex', alignItems: 'center' }}>
                      <Text className={styles.configValue}>{config.value}</Text>
                      <Text className={styles.configArrow}>›</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default StrategyPage;
