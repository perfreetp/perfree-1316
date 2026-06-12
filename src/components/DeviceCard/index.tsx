import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';
import { Device } from '@/types';
import { getDeviceStatusName, formatPower, getDeviceTypeName } from '@/utils';

interface DeviceCardProps {
  device: Device;
  onToggle?: (device: Device) => void;
  onClick?: (device: Device) => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onToggle, onClick }) => {
  const isOn = device.status === 'on';
  const isOffline = device.status === 'offline';

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!isOffline && onToggle) {
      onToggle(device);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      ac: '❄️',
      water_heater: '🔥',
      charger: '⚡',
      battery: '🔋'
    };
    return icons[type] || '💡';
  };

  const getSummaryInfo = () => {
    const items: { label: string; value: string }[] = [];
    
    if (device.timerOn && device.timerStartTime && device.timerEndTime) {
      items.push({
        label: '⏰',
        value: `${device.timerStartTime}-${device.timerEndTime}`
      });
    }
    
    if (device.maxPower) {
      items.push({
        label: '⚡',
        value: `上限 ${formatPower(device.maxPower)}`
      });
    }
    
    if (device.group && device.group !== '未分组') {
      items.push({
        label: '📁',
        value: device.group
      });
    }
    
    return items;
  };

  const summaryItems = getSummaryInfo();

  return (
    <View
      className={classnames(styles.deviceCard, isOn && styles.active, isOffline && styles.offline)}
      onClick={() => onClick && onClick(device)}
            >
      <View className={styles.cardHeader}>
        <Text className={styles.icon}>{getTypeIcon(device.type)}</Text>
        <View
          className={classnames(styles.switchBtn, isOn && styles.switchOn, isOffline && styles.switchDisabled)}
          onClick={handleToggle}
                >
          <View className={styles.switchDot} />
        </View>
      </View>

      <Text className={styles.deviceName}>{device.name}</Text>
      <Text className={styles.deviceType}>{getDeviceTypeName(device.type)}</Text>

      <View className={styles.statusRow}>
        <Text className={classnames(styles.statusText, isOn && styles.statusOn, isOffline && styles.statusOffline)}>
          {getDeviceStatusName(device.status)}
        </Text>
      </View>

      <View className={styles.powerRow}>
        <Text className={styles.powerValue}>
          {isOffline ? '--' : formatPower(Math.abs(device.power))}
        </Text>
        {device.batteryLevel !== undefined && (
          <Text className={styles.batteryLevel}>🔋 {device.batteryLevel}%</Text>
        )}
      </View>

      {summaryItems.length > 0 && (
        <View className={styles.summaryRow}>
          {summaryItems.map((item, index) => (
            <View key={index} className={styles.summaryItem}>
              <Text className={styles.summaryLabel}>{item.label}</Text>
              <Text className={styles.summaryValue}>{item.value}</Text>
            </View>
          ))}
        </View>
      )}

      {device.targetTemp !== undefined && isOn && (
        <View className={styles.tempRow}>
          <Text className={styles.tempText}>目标 {device.targetTemp}°C</Text>
        </View>
      )}
    </View>
  );
};

export default DeviceCard;
