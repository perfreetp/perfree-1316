import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import DeviceCard from '@/components/DeviceCard';
import { mockDevices, mockDeviceGroups } from '@/data/devices';
import { Device, DeviceGroup } from '@/types';
import { formatPower } from '@/utils';

const DevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>(mockDevices);
  const [groups, setGroups] = useState<DeviceGroup[]>(mockDeviceGroups);
  const [activeGroupId, setActiveGroupId] = useState<string>('g1');

  const activeGroup = groups.find(g => g.id === activeGroupId);
  
  const filteredDevices = useMemo(() => {
    if (!activeGroup || activeGroupId === 'g1') {
      return devices;
    }
    return devices.filter(d => activeGroup.deviceIds.includes(d.id));
  }, [devices, activeGroup, activeGroupId]);

  const totalPower = useMemo(() => {
    return devices
      .filter(d => d.status === 'on' && d.power > 0)
      .reduce((sum, d) => sum + d.power, 0);
  }, [devices]);

  const onCount = useMemo(() => {
    return devices.filter(d => d.status === 'on').length;
  }, [devices]);

  const offlineCount = useMemo(() => {
    return devices.filter(d => d.status === 'offline').length;
  }, [devices]);

  const handleDeviceToggle = (device: Device) => {
    console.log('[Devices] Toggle device:', device.name, 'current status:', device.status);
    
    setDevices(prevDevices => 
      prevDevices.map(d => {
        if (d.id === device.id) {
          const newStatus = d.status === 'on' ? 'off' : 'on';
          return {
            ...d,
            status: newStatus as any,
            power: newStatus === 'on' ? d.maxPower * 0.5 : 0
          };
        }
        return d;
      })
    );

    Taro.showToast({
      title: device.status === 'on' ? '已关闭设备' : '已开启设备',
      icon: 'success',
      duration: 1500
    });
  };

  const handleDeviceClick = (device: Device) => {
    console.log('[Devices] Click device:', device.name);
    Taro.showActionSheet({
      itemList: ['设备详情', '定时设置', '功率上限设置', '分组管理'],
      success: (res) => {
        console.log('[Devices] Action sheet selected:', res.tapIndex);
        Taro.showToast({
          title: '功能开发中',
          icon: 'none',
          duration: 1500
        });
      }
    });
  };

  const handleGroupChange = (groupId: string) => {
    console.log('[Devices] Switch group:', groupId);
    setActiveGroupId(groupId);
  };

  const handleAddDevice = () => {
    console.log('[Devices] Add device');
    Taro.showToast({
      title: '添加设备功能开发中',
      icon: 'none',
      duration: 1500
    });
  };

  const handleAllOff = () => {
    console.log('[Devices] Turn all off');
    Taro.showModal({
      title: '确认关闭所有设备？',
      content: '将关闭当前分组内所有正在运行的设备',
      success: (res) => {
        if (res.confirm) {
          setDevices(prevDevices =>
            prevDevices.map(d => {
              if (activeGroupId === 'g1' || activeGroup?.deviceIds.includes(d.id)) {
                if (d.status === 'on') {
                  return { ...d, status: 'off' as const, power: 0 };
                }
              }
              return d;
            })
          );
          Taro.showToast({
            title: '已全部关闭',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.summaryCard}>
        <View className={styles.summaryTop}>
          <Text className={styles.summaryTitle}>当前总功率</Text>
          <Text className={styles.deviceCount}>共 {devices.length} 台设备</Text>
        </View>
        
        <View className={styles.powerDisplay}>
          <Text className={styles.powerValue}>
            {(totalPower / 1000).toFixed(2)}
            <Text className={styles.powerUnit}>kW</Text>
          </Text>
          <Text className={styles.powerLabel}>
            运行中 {onCount} 台 · 离线 {offlineCount} 台
          </Text>
        </View>

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{onCount}</Text>
            <Text className={styles.statLabel}>运行中</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{devices.length - onCount - offlineCount}</Text>
            <Text className={styles.statLabel}>已关闭</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{offlineCount}</Text>
            <Text className={styles.statLabel}>离线</Text>
          </View>
        </View>
      </View>

      <ScrollView className={styles.groupTabs} scrollX>
        {groups.map(group => (
          <View
            key={group.id}
            className={classnames(styles.groupTab, activeGroupId === group.id && styles.active)}
            onClick={() => handleGroupChange(group.id)}
          >
            {group.name}
          </View>
        ))}
      </ScrollView>

      <View className={styles.deviceGrid}>
        {filteredDevices.map(device => (
          <View key={device.id} className={styles.deviceCard}>
            <DeviceCard
              device={device}
              onToggle={handleDeviceToggle}
              onClick={handleDeviceClick}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default DevicesPage;
