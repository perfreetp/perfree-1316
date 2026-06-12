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

      {device.targetTemp !== undefined && isOn && (
        <View className={styles.tempRow}>
          <Text className={styles.tempText}>目标 {device.targetTemp}°C</Text>
        </View>
      )}
    </View>
  );
};

export default DeviceCard;
