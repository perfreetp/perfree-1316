import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import DeviceCard from '@/components/DeviceCard';
import { mockDevices, mockDeviceGroups } from '@/data/devices';
import { Device, DeviceGroup } from '@/types';
import { formatPower } from '@/utils';

type EditType = 'timer' | 'power' | 'group' | null;

const DevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>(mockDevices);
  const [groups, setGroups] = useState<DeviceGroup[]>(mockDeviceGroups);
  const [activeGroupId, setActiveGroupId] = useState<string>('g1');
  
  const [showModal, setShowModal] = useState(false);
  const [editType, setEditType] = useState<EditType>(null);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerStart, setTimerStart] = useState('20:00');
  const [timerEnd, setTimerEnd] = useState('22:00');
  const [maxPower, setMaxPower] = useState('3000');
  const [selectedGroupId, setSelectedGroupId] = useState('');

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
        if (res.tapIndex === 0) {
          showDeviceDetail(device);
        } else if (res.tapIndex === 1) {
          openTimerModal(device);
        } else if (res.tapIndex === 2) {
          openPowerModal(device);
        } else if (res.tapIndex === 3) {
          openGroupModal(device);
        }
      }
    });
  };

  const showDeviceDetail = (device: Device) => {
    const detailText = 
      `设备名称：${device.name}\n` +
      `设备类型：${{ ac: '空调', water_heater: '热水器', charger: '充电桩', battery: '储能柜' }[device.type]}\n` +
      `当前状态：${{ on: '运行中', off: '已关闭', standby: '待机', offline: '离线' }[device.status]}\n` +
      `当前功率：${formatPower(Math.abs(device.power))}\n` +
      `功率上限：${formatPower(device.maxPower)}\n` +
      `所在房间：${device.room || '-'}\n` +
      `定时开关：${device.timerOn ? `开启 (${device.timerStartTime}-${device.timerEndTime})` : '未开启'}`;
    
    Taro.showModal({
      title: '设备详情',
      content: detailText,
      showCancel: false,
      confirmText: '知道了'
    });
  };

  const openTimerModal = (device: Device) => {
    setEditingDevice(device);
    setEditType('timer');
    setTimerEnabled(!!device.timerOn);
    setTimerStart(device.timerStartTime || '20:00');
    setTimerEnd(device.timerEndTime || '22:00');
    setShowModal(true);
  };

  const openPowerModal = (device: Device) => {
    setEditingDevice(device);
    setEditType('power');
    setMaxPower(String(device.maxPower));
    setShowModal(true);
  };

  const openGroupModal = (device: Device) => {
    setEditingDevice(device);
    setEditType('group');
    const deviceGroup = groups.find(g => g.name === device.group);
    setSelectedGroupId(deviceGroup?.id || 'g2');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditType(null);
    setEditingDevice(null);
  };

  const handleSave = () => {
    if (!editingDevice) return;
    console.log('[Devices] Save settings for:', editingDevice.name, 'type:', editType);

    if (editType === 'timer') {
      setDevices(prev =>
        prev.map(d => {
          if (d.id === editingDevice.id) {
            return {
              ...d,
              timerOn: timerEnabled,
              timerStartTime: timerStart,
              timerEndTime: timerEnd
            };
          }
          return d;
        })
      );
      Taro.showToast({
        title: timerEnabled ? `定时已设置 ${timerStart}-${timerEnd}` : '定时已关闭',
        icon: 'success',
        duration: 1500
      });
    } else if (editType === 'power') {
      const power = parseInt(maxPower) || 3000;
      setDevices(prev =>
        prev.map(d => {
          if (d.id === editingDevice.id) {
            return {
              ...d,
              maxPower: power,
              power: d.status === 'on' ? Math.min(d.power, power) : d.power
            };
          }
          return d;
        })
      );
      Taro.showToast({
        title: `功率上限已设为 ${power}W`,
        icon: 'success',
        duration: 1500
      });
    } else if (editType === 'group') {
      const newGroup = groups.find(g => g.id === selectedGroupId);
      if (newGroup) {
        setDevices(prev =>
          prev.map(d => {
            if (d.id === editingDevice.id) {
              return {
                ...d,
                group: newGroup.name === '全部设备' ? d.group : newGroup.name
              };
            }
            return d;
          })
        );
        
        setGroups(prevGroups =>
          prevGroups.map(g => {
            let newDeviceIds = g.deviceIds.filter(id => id !== editingDevice.id);
            if (g.id === selectedGroupId && g.id !== 'g1') {
              newDeviceIds = [...newDeviceIds, editingDevice.id];
            }
            if (g.id === 'g1') {
              newDeviceIds = devices.map(d => d.id);
            }
            return { ...g, deviceIds: newDeviceIds };
          })
        );
        
        Taro.showToast({
          title: `已移至「${newGroup.name}」分组`,
          icon: 'success',
          duration: 1500
        });
      }
    }

    closeModal();
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

  const handleStartTimeClick = () => {
    const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    Taro.showActionSheet({
      itemList: hours,
      success: (res) => {
        setTimerStart(hours[res.tapIndex]);
      }
    });
  };

  const handleEndTimeClick = () => {
    const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    Taro.showActionSheet({
      itemList: hours,
      success: (res) => {
        setTimerEnd(hours[res.tapIndex]);
      }
    });
  };

  return (
    <View className={styles.page}>
      <ScrollView scrollY>
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

        <View style={{ height: '120rpx' }} />
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.addAction} onClick={handleAddDevice}>
          + 添加设备
        </View>
        <View className={styles.addAllOff} onClick={handleAllOff}>
          一键全关
        </View>
      </View>

      {showModal && editingDevice && (
        <View className={styles.modalMask} onClick={closeModal}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>
              {editType === 'timer' && '定时设置'}
              {editType === 'power' && '功率上限设置'}
              {editType === 'group' && '分组管理'}
            </Text>

            {editType === 'timer' && (
              <View>
                <View className={styles.formRow}>
                  <Text className={styles.formLabel}>设备名称</Text>
                  <Text className={styles.formValue}>{editingDevice.name}</Text>
                </View>
                <View className={styles.formRow}>
                  <Text className={styles.formLabel}>启用定时</Text>
                  <Switch
                    checked={timerEnabled}
                    onChange={(e) => setTimerEnabled(e.detail.value)}
                    color='#00B578'
                  />
                </View>
                {timerEnabled && (
                  <>
                    <View className={styles.formRow} onClick={handleStartTimeClick}>
                      <Text className={styles.formLabel}>开启时间</Text>
                      <View className={styles.formValueRow}>
                        <Text className={styles.formValueLink}>{timerStart}</Text>
                        <Text className={styles.formArrow}>›</Text>
                      </View>
                    </View>
                    <View className={styles.formRow} onClick={handleEndTimeClick}>
                      <Text className={styles.formLabel}>关闭时间</Text>
                      <View className={styles.formValueRow}>
                        <Text className={styles.formValueLink}>{timerEnd}</Text>
                        <Text className={styles.formArrow}>›</Text>
                      </View>
                    </View>
                  </>
                )}
              </View>
            )}

            {editType === 'power' && (
              <View>
                <View className={styles.formRow}>
                  <Text className={styles.formLabel}>设备名称</Text>
                  <Text className={styles.formValue}>{editingDevice.name}</Text>
                </View>
                <View className={styles.formRow}>
                  <Text className={styles.formLabel}>当前功率上限</Text>
                  <Text className={styles.formValue}>{formatPower(editingDevice.maxPower)}</Text>
                </View>
                <View style={{ marginTop: '24rpx' }}>
                  <Text className={styles.formLabel}>设置功率上限 (W)</Text>
                  <View className={styles.powerSlider}>
                    <Text className={styles.powerMin}>500W</Text>
                    <Input
                      className={styles.powerInput}
                      type='number'
                      value={maxPower}
                      onInput={(e) => setMaxPower(e.detail.value)}
                    />
                    <Text className={styles.powerMax}>
                      {editingDevice.type === 'charger' ? '7000W' : '5000W'}
                    </Text>
                  </View>
                  <View style={{ marginTop: '16rpx' }}>
                    {[1000, 2000, 3000, 5000].map(p => (
                      <Text
                        key={p}
                        className={classnames(styles.powerTag, parseInt(maxPower) === p && styles.powerTagActive)}
                        onClick={() => setMaxPower(String(p))}
                      >
                        {p}W
                      </Text>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {editType === 'group' && (
              <View>
                <View className={styles.formRow}>
                  <Text className={styles.formLabel}>设备名称</Text>
                  <Text className={styles.formValue}>{editingDevice.name}</Text>
                </View>
                <View className={styles.formRow}>
                  <Text className={styles.formLabel}>当前分组</Text>
                  <Text className={styles.formValue}>{editingDevice.group || '未分组'}</Text>
                </View>
                <Text className={styles.formLabel} style={{ marginTop: '16rpx' }}>选择分组</Text>
                <View className={styles.groupList}>
                  {groups.filter(g => g.id !== 'g1').map(group => (
                    <View
                      key={group.id}
                      className={classnames(styles.groupOption, selectedGroupId === group.id && styles.groupOptionActive)}
                      onClick={() => setSelectedGroupId(group.id)}
                    >
                      <Text className={styles.groupOptionName}>{group.name}</Text>
                      <Text className={styles.groupOptionCount}>{group.deviceIds.length} 台设备</Text>
                      {selectedGroupId === group.id && (
                        <Text className={styles.groupCheck}>✓</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View className={styles.modalActions}>
              <View className={classnames(styles.modalBtn, styles.cancelBtn)} onClick={closeModal}>
                取消
              </View>
              <View className={classnames(styles.modalBtn, styles.confirmBtn)} onClick={handleSave}>
                保存
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default DevicesPage;
