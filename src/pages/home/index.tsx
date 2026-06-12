import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import StatCard from '@/components/StatCard';
import { mockRealtimeData, mockTimePeriods } from '@/data/bill';
import { mockAlerts } from '@/data/alerts';
import { mockSuggestions } from '@/data/strategy';
import { mockDevices } from '@/data/devices';
import { formatPower, formatEnergy, formatMoney, formatCarbon, getPeriodTypeName, getDeviceStatusName } from '@/utils';
import { Device } from '@/types';

const HomePage: React.FC = () => {
  const [realtimeData, setRealtimeData] = useState(mockRealtimeData);
  const [unhandledAlerts, setUnhandledAlerts] = useState(mockAlerts.filter(a => !a.handled));
  const [quickDevices, setQuickDevices] = useState<Device[]>(mockDevices.slice(0, 4));
  const [currentSuggestion, setCurrentSuggestion] = useState(mockSuggestions.find(s => !s.implemented));
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  const updateTime = () => {
    const now = new Date();
    setCurrentTime(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`);
  };

  const getCurrentPeriod = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    for (const period of mockTimePeriods) {
      const [startH, startM] = period.startTime.split(':').map(Number);
      const [endH, endM] = period.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH === 24 ? 1440 : endH * 60 + endM;
      
      if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        return period;
      }
    }
    return mockTimePeriods[0];
  };

  const currentPeriod = getCurrentPeriod();
  const hasErrorAlert = unhandledAlerts.some(a => a.level === 'error');

  const handleDeviceToggle = (device: Device) => {
    console.log('[Home] Toggle device:', device.name);
    const updatedDevices = quickDevices.map(d => {
      if (d.id === device.id) {
        const newStatus = d.status === 'on' ? 'off' : 'on';
        return {
          ...d,
          status: newStatus as any,
          power: newStatus === 'on' ? d.maxPower * 0.5 : 0
        };
      }
      return d;
    });
    setQuickDevices(updatedDevices);
    
    Taro.showToast({
      title: device.status === 'on' ? '已关闭' : '已开启',
      icon: 'success',
      duration: 1500
    });
  };

  const goToAlerts = () => {
    console.log('[Home] Navigate to alerts');
    Taro.navigateTo({ url: '/pages/alerts/index' });
  };

  const goToDevices = () => {
    console.log('[Home] Navigate to devices');
    Taro.switchTab({ url: '/pages/devices/index' });
  };

  const getDeviceIcon = (type: string) => {
    const icons: Record<string, string> = {
      ac: '❄️',
      water_heater: '🔥',
      charger: '⚡',
      battery: '🔋'
    };
    return icons[type] || '💡';
  };

  const calculatePeriodWidths = () => {
    const totalMinutes = 1440;
    return mockTimePeriods.map(period => {
      const [startH, startM] = period.startTime.split(':').map(Number);
      const [endH, endM] = period.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH === 24 ? 1440 : endH * 60 + endM;
      const duration = endMinutes - startMinutes;
      return {
        ...period,
        width: (duration / totalMinutes) * 100
      };
    });
  };

  const periodWidths = calculatePeriodWidths();

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.heroCard}>
        <View className={styles.heroTop}>
          <View className={classnames(styles.periodBadge, styles[`periodBadge${currentPeriod.type.charAt(0).toUpperCase() + currentPeriod.type.slice(1)}`])}>
            {getPeriodTypeName(currentPeriod.type)} · ¥{currentPeriod.price}/度
          </View>
          <Text className={styles.currentTime}>{currentTime}</Text>
        </View>

        <View className={styles.powerSection}>
          <Text className={styles.powerLabel}>当前功率</Text>
          <Text className={styles.powerValue}>
            {(realtimeData.currentPower / 1000).toFixed(2)}
            <Text className={styles.powerUnit}>kW</Text>
          </Text>
        </View>

        <View className={styles.heroStats}>
          <View className={styles.heroStatItem}>
            <Text className={styles.heroStatValue}>{realtimeData.todayEnergy.toFixed(1)}</Text>
            <Text className={styles.heroStatLabel}>今日电量(kWh)</Text>
          </View>
          <View className={styles.heroStatItem}>
            <Text className={styles.heroStatValue}>¥{realtimeData.todayCost.toFixed(2)}</Text>
            <Text className={styles.heroStatLabel}>今日电费</Text>
          </View>
          <View className={styles.heroStatItem}>
            <Text className={styles.heroStatValue}>¥{realtimeData.savedMoney.toFixed(1)}</Text>
            <Text className={styles.heroStatLabel}>已省金额</Text>
          </View>
        </View>
      </View>

      <View className={styles.sectionWrap}>
        <View className={styles.statsGrid}>
          <View className={styles.statItem}>
            <StatCard
              title="今日电量"
              value={realtimeData.todayEnergy.toFixed(1)}
              unit="kWh"
              color="primary"
              subText={`峰 ${realtimeData.peakPower / 1000}kW / 谷 ${realtimeData.valleyPower / 1000}kW`}
            />
          </View>
          <View className={styles.statItem}>
            <StatCard
              title="今日电费"
              value={realtimeData.todayCost.toFixed(2)}
              unit="元"
              color="warning"
              subText="峰谷计价"
            />
          </View>
          <View className={styles.statItem}>
            <StatCard
              title="碳排放"
              value={realtimeData.todayCarbon.toFixed(1)}
              unit="kg"
              color="info"
              subText="约等于种树0.3棵"
            />
          </View>
          <View className={styles.statItem}>
            <StatCard
              title="已省金额"
              value={realtimeData.savedMoney.toFixed(2)}
              unit="元"
              color="success"
              subText="环比昨日 +12%"
            />
          </View>
        </View>
      </View>

      <View className={styles.sectionWrap}>
        <View className={styles.sectionCard}>
          <View className={styles.periodSection}>
            <Text className={styles.periodTitle}>今日电价时段</Text>
            <View className={styles.periodTimeline}>
              {periodWidths.map((period, index) => (
                <View
                  key={index}
                  className={classnames(styles.periodSegment, styles[period.type])}
                  style={{ width: `${period.width}%` }}
                />
              ))}
            </View>
            <View className={styles.periodLabels}>
              <Text>00:00</Text>
              <Text>12:00</Text>
              <Text>24:00</Text>
            </View>
          </View>

          <View className={styles.periodLegend}>
            <View className={styles.legendItem}>
              <View className={classnames(styles.legendDot, styles.peak)} />
              <Text>峰时 ¥0.85</Text>
            </View>
            <View className={styles.legendItem}>
              <View className={classnames(styles.legendDot, styles.flat)} />
              <Text>平时 ¥0.58</Text>
            </View>
            <View className={styles.legendItem}>
              <View className={classnames(styles.legendDot, styles.valley)} />
              <Text>谷时 ¥0.35</Text>
            </View>
          </View>
        </View>
      </View>

      {unhandledAlerts.length > 0 && (
        <View className={styles.sectionWrap}>
          <View
            className={classnames(styles.alertCard, hasErrorAlert && styles.hasError)}
            onClick={goToAlerts}
          >
            <View className={styles.alertIcon}>
              {hasErrorAlert ? '🔴' : '⚠️'}
            </View>
            <View className={styles.alertContent}>
              <Text className={styles.alertTitle}>
                {unhandledAlerts.length} 条待处理告警
              </Text>
              <Text className={styles.alertDesc}>
                {unhandledAlerts[0].title}
              </Text>
            </View>
            <Text className={styles.alertArrow}>›</Text>
          </View>
        </View>
      )}

      <View className={styles.sectionWrap}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>快捷控制</Text>
          <Text className={styles.sectionMore} onClick={goToDevices}>全部设备 ›</Text>
        </View>
        <ScrollView className={styles.quickDevices} scrollX>
          {quickDevices.map(device => (
            <View
              key={device.id}
              className={styles.quickDeviceItem}
              onClick={() => handleDeviceToggle(device)}
            >
              <Text className={styles.deviceIcon}>{getDeviceIcon(device.type)}</Text>
              <Text className={styles.deviceName}>{device.name}</Text>
              <Text className={classnames(styles.deviceStatus, device.status === 'on' && styles.on, device.status === 'offline' && styles.offline)}>
                {getDeviceStatusName(device.status)}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {currentSuggestion && (
        <View className={styles.sectionWrap}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>节能小贴士</Text>
          </View>
          <View className={styles.suggestionCard}>
            <View className={styles.suggestionIcon}>💡</View>
            <View className={styles.suggestionContent}>
              <Text className={styles.suggestionTitle}>{currentSuggestion.title}</Text>
              <Text className={styles.suggestionDesc}>{currentSuggestion.description}</Text>
              <Text className={styles.savingTag}>预计月省 ¥{currentSuggestion.savingPotential}</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default HomePage;
