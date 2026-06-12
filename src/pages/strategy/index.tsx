import React, { useState } from 'react';
import { View, Text, ScrollView, Input, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockStrategies } from '@/data/strategy';
import { Strategy } from '@/types';
import { formatMoney } from '@/utils';

type ConfigField = 'maxPeakPower' | 'autoAdjust' | 
  'chargeStartTime' | 'chargeEndTime' | 'dischargeStartTime' | 'dischargeEndTime' | 'minBattery' | 'maxBattery' |
  'autoDetect' | 'turnOffAc' | 'turnOffWater' | 'keepBattery' |
  'summerTemp' | 'winterTemp' | 'tempAutoAdjust' | 'humidityControl';

const StrategyPage: React.FC = () => {
  const [strategies, setStrategies] = useState<Strategy[]>(mockStrategies);
  const [showModal, setShowModal] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
  
  const [formData, setFormData] = useState<Record<string, any>>({});

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
    openConfigModal(strategy);
  };

  const openConfigModal = (strategy: Strategy) => {
    setEditingStrategy(strategy);
    
    const config = strategy.config || {};
    const defaults: Record<string, any> = {};
    
    switch (strategy.type) {
      case 'peak_shaving':
        defaults.maxPeakPower = config.maxPeakPower || 3000;
        defaults.autoAdjust = config.autoAdjust !== false;
        break;
      case 'battery_charge':
        defaults.chargeStartTime = config.chargeStartTime || '00:00';
        defaults.chargeEndTime = config.chargeEndTime || '06:00';
        defaults.dischargeStartTime = config.dischargeStartTime || '08:00';
        defaults.dischargeEndTime = config.dischargeEndTime || '11:00';
        defaults.minBattery = config.minBatteryLevel || 20;
        defaults.maxBattery = config.maxBatteryLevel || 90;
        break;
      case 'away_mode':
        defaults.autoDetect = config.autoDetect || false;
        const devices = config.turnOffDevices || [];
        defaults.turnOffAc = devices.includes('ac');
        defaults.turnOffWater = devices.includes('water_heater');
        defaults.keepBattery = config.keepBattery !== false;
        break;
      case 'comfort_temp':
        defaults.summerTemp = config.summerTemp || 26;
        defaults.winterTemp = config.winterTemp || 22;
        defaults.tempAutoAdjust = config.autoAdjust !== false;
        defaults.humidityControl = config.humidityControl || false;
        break;
    }
    
    setFormData(defaults);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStrategy(null);
    setFormData({});
  };

  const validateConfig = (): { valid: boolean; message?: string } => {
    if (!editingStrategy) return { valid: false };
    
    const type = editingStrategy.type;
    
    if (type === 'peak_shaving') {
      const raw = formData.maxPeakPower;
      const val = String(raw ?? '').trim();
      if (val === '') {
        return { valid: false, message: '请输入最大功率阈值' };
      }
      const num = Number(val);
      if (isNaN(num) || !Number.isFinite(num)) {
        return { valid: false, message: '请输入有效的数字' };
      }
      if (num < 500) {
        return { valid: false, message: '阈值不能小于500W' };
      }
      if (num > 10000) {
        return { valid: false, message: '阈值不能超过10000W' };
      }
    }
    
    if (type === 'battery_charge') {
      const chargeStart = formData.chargeStartTime;
      const chargeEnd = formData.chargeEndTime;
      const dischargeStart = formData.dischargeStartTime;
      const dischargeEnd = formData.dischargeEndTime;
      
      if (!chargeStart || !chargeEnd) {
        return { valid: false, message: '请选择充电时段' };
      }
      if (!dischargeStart || !dischargeEnd) {
        return { valid: false, message: '请选择放电时段' };
      }
      if (chargeStart === chargeEnd) {
        return { valid: false, message: '充电开始和结束时间不能相同' };
      }
      if (dischargeStart === dischargeEnd) {
        return { valid: false, message: '放电开始和结束时间不能相同' };
      }
      
      const minBatt = Number(formData.minBattery);
      const maxBatt = Number(formData.maxBattery);
      if (isNaN(minBatt) || isNaN(maxBatt)) {
        return { valid: false, message: '请输入有效的电量值' };
      }
      if (minBatt < 5 || minBatt > 50) {
        return { valid: false, message: '最小电量需在5%-50%之间' };
      }
      if (maxBatt < 50 || maxBatt > 100) {
        return { valid: false, message: '最大电量需在50%-100%之间' };
      }
      if (minBatt >= maxBatt) {
        return { valid: false, message: '最小电量需小于最大电量' };
      }
    }
    
    if (type === 'away_mode') {
      if (!formData.turnOffAc && !formData.turnOffWater) {
        return { valid: false, message: '请至少选择一类要关闭的设备' };
      }
    }
    
    if (type === 'comfort_temp') {
      const summer = Number(formData.summerTemp);
      const winter = Number(formData.winterTemp);
      if (isNaN(summer) || isNaN(winter)) {
        return { valid: false, message: '请输入有效的温度值' };
      }
      if (summer < 20 || summer > 30) {
        return { valid: false, message: '夏季温度需在20-30°C之间' };
      }
      if (winter < 16 || winter > 26) {
        return { valid: false, message: '冬季温度需在16-26°C之间' };
      }
    }
    
    return { valid: true };
  };

  const handleSave = () => {
    if (!editingStrategy) return;
    console.log('[Strategy] Save config for:', editingStrategy.name, formData);

    const validation = validateConfig();
    if (!validation.valid) {
      Taro.showToast({
        title: validation.message || '配置无效',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    let newConfig: Record<string, any> = {};
    
    switch (editingStrategy.type) {
      case 'peak_shaving':
        newConfig = {
          maxPeakPower: Math.round(Number(formData.maxPeakPower)),
          autoAdjust: !!formData.autoAdjust
        };
        break;
      case 'battery_charge':
        newConfig = {
          chargeStartTime: formData.chargeStartTime,
          chargeEndTime: formData.chargeEndTime,
          dischargeStartTime: formData.dischargeStartTime,
          dischargeEndTime: formData.dischargeEndTime,
          minBatteryLevel: Math.round(Number(formData.minBattery)),
          maxBatteryLevel: Math.round(Number(formData.maxBattery))
        };
        break;
      case 'away_mode':
        const devices: string[] = [];
        if (formData.turnOffAc) devices.push('ac');
        if (formData.turnOffWater) devices.push('water_heater');
        newConfig = {
          autoDetect: !!formData.autoDetect,
          turnOffDevices: devices,
          keepBattery: !!formData.keepBattery
        };
        break;
      case 'comfort_temp':
        newConfig = {
          summerTemp: Math.round(Number(formData.summerTemp)),
          winterTemp: Math.round(Number(formData.winterTemp)),
          autoAdjust: !!formData.tempAutoAdjust,
          humidityControl: !!formData.humidityControl
        };
        break;
    }

    setStrategies(prev =>
      prev.map(s => {
        if (s.id === editingStrategy.id) {
          return { ...s, config: newConfig };
        }
        return s;
      })
    );

    Taro.showToast({
      title: '配置已保存',
      icon: 'success',
      duration: 1500
    });

    closeModal();
  };

  const handleSwitchChange = (key: string, value: boolean) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleTimeSelect = (key: string) => {
    const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    Taro.showActionSheet({
      itemList: hours,
      success: (res) => {
        handleInputChange(key, hours[res.tapIndex]);
      }
    });
  };

  const handleTempSelect = (key: string, options: number[]) => {
    const labels = options.map(t => `${t}°C`);
    Taro.showActionSheet({
      itemList: labels,
      success: (res) => {
        handleInputChange(key, String(options[res.tapIndex]));
      }
    });
  };

  const handleBatterySelect = (key: string, options: number[]) => {
    const labels = options.map(t => `${t}%`);
    Taro.showActionSheet({
      itemList: labels,
      success: (res) => {
        handleInputChange(key, String(options[res.tapIndex]));
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
        configs.push({
          label: '电池范围',
          value: `${strategy.config?.minBatteryLevel || 20}% - ${strategy.config?.maxBatteryLevel || 90}%`
        });
        break;
      case 'away_mode':
        configs.push({ 
          label: '自动检测', 
          value: strategy.config?.autoDetect ? '开启' : '手动' 
        });
        const deviceNames: Record<string, string> = { ac: '空调', water_heater: '热水器' };
        const turnOffNames = (strategy.config?.turnOffDevices || [])
          .map((d: string) => deviceNames[d] || d)
          .filter(Boolean);
        configs.push({ 
          label: '关闭设备', 
          value: turnOffNames.length > 0 ? turnOffNames.join('、') : '--' 
        });
        configs.push({
          label: '保留储能',
          value: strategy.config?.keepBattery !== false ? '是' : '否'
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
        configs.push({
          label: '智能调节',
          value: strategy.config?.autoAdjust !== false ? '开启' : '关闭'
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

  const renderConfigForm = () => {
    if (!editingStrategy) return null;
    const type = editingStrategy.type;

    return (
      <View>
        {type === 'peak_shaving' && (
          <>
            <View className={styles.formRow}>
              <Text className={styles.formLabel}>峰时最大功率 (W)</Text>
              <Input
                className={styles.formInput}
                type='number'
                value={String(formData.maxPeakPower || '')}
                onInput={(e) => handleInputChange('maxPeakPower', e.detail.value)}
                style={{ width: '180rpx', textAlign: 'right' }}
              />
            </View>
            <View style={{ marginTop: '8rpx' }}>
              {[2000, 3000, 4000, 5000].map(p => (
                <Text
                  key={p}
                  className={classnames(styles.tagBtn, parseInt(formData.maxPeakPower) === p && styles.tagBtnActive)}
                  onClick={() => handleInputChange('maxPeakPower', String(p))}
                >
                  {p}W
                </Text>
              ))}
            </View>
            <View className={styles.formRow}>
              <Text className={styles.formLabel}>自动调节设备</Text>
              <Switch
                checked={!!formData.autoAdjust}
                onChange={(e) => handleSwitchChange('autoAdjust', e.detail.value)}
                color='#00B578'
              />
            </View>
          </>
        )}

        {type === 'battery_charge' && (
          <>
            <View className={styles.formRow} onClick={() => handleTimeSelect('chargeStartTime')}>
              <Text className={styles.formLabel}>充电开始时间</Text>
              <View style={styles.formLinkRow}>
                <Text className={styles.formLink}>{formData.chargeStartTime}</Text>
                <Text className={styles.formArrow}>›</Text>
              </View>
            </View>
            <View className={styles.formRow} onClick={() => handleTimeSelect('chargeEndTime')}>
              <Text className={styles.formLabel}>充电结束时间</Text>
              <View style={styles.formLinkRow}>
                <Text className={styles.formLink}>{formData.chargeEndTime}</Text>
                <Text className={styles.formArrow}>›</Text>
              </View>
            </View>
            <View className={styles.formRow} onClick={() => handleTimeSelect('dischargeStartTime')}>
              <Text className={styles.formLabel}>放电开始时间</Text>
              <View style={styles.formLinkRow}>
                <Text className={styles.formLink}>{formData.dischargeStartTime}</Text>
                <Text className={styles.formArrow}>›</Text>
              </View>
            </View>
            <View className={styles.formRow} onClick={() => handleTimeSelect('dischargeEndTime')}>
              <Text className={styles.formLabel}>放电结束时间</Text>
              <View style={styles.formLinkRow}>
                <Text className={styles.formLink}>{formData.dischargeEndTime}</Text>
                <Text className={styles.formArrow}>›</Text>
              </View>
            </View>
            <View className={styles.formRow} onClick={() => handleBatterySelect('minBattery', [10, 15, 20, 25, 30])}>
              <Text className={styles.formLabel}>最小电量</Text>
              <View style={styles.formLinkRow}>
                <Text className={styles.formLink}>{formData.minBattery}%</Text>
                <Text className={styles.formArrow}>›</Text>
              </View>
            </View>
            <View className={styles.formRow} onClick={() => handleBatterySelect('maxBattery', [80, 85, 90, 95, 100])}>
              <Text className={styles.formLabel}>最大电量</Text>
              <View style={styles.formLinkRow}>
                <Text className={styles.formLink}>{formData.maxBattery}%</Text>
                <Text className={styles.formArrow}>›</Text>
              </View>
            </View>
          </>
        )}

        {type === 'away_mode' && (
          <>
            <View className={styles.formRow}>
              <Text className={styles.formLabel}>自动离家检测</Text>
              <Switch
                checked={!!formData.autoDetect}
                onChange={(e) => handleSwitchChange('autoDetect', e.detail.value)}
                color='#00B578'
              />
            </View>
            <View className={styles.formRow}>
              <Text className={styles.formLabel}>关闭空调类</Text>
              <Switch
                checked={!!formData.turnOffAc}
                onChange={(e) => handleSwitchChange('turnOffAc', e.detail.value)}
                color='#00B578'
              />
            </View>
            <View className={styles.formRow}>
              <Text className={styles.formLabel}>关闭热水器</Text>
              <Switch
                checked={!!formData.turnOffWater}
                onChange={(e) => handleSwitchChange('turnOffWater', e.detail.value)}
                color='#00B578'
              />
            </View>
            <View className={styles.formRow}>
              <Text className={styles.formLabel}>保留储能供电</Text>
              <Switch
                checked={!!formData.keepBattery}
                onChange={(e) => handleSwitchChange('keepBattery', e.detail.value)}
                color='#00B578'
              />
            </View>
          </>
        )}

        {type === 'comfort_temp' && (
          <>
            <View className={styles.formRow} onClick={() => handleTempSelect('summerTemp', [24, 25, 26, 27, 28])}>
              <Text className={styles.formLabel}>夏季目标温度</Text>
              <View style={styles.formLinkRow}>
                <Text className={styles.formLink}>{formData.summerTemp}°C</Text>
                <Text className={styles.formArrow}>›</Text>
              </View>
            </View>
            <View className={styles.formRow} onClick={() => handleTempSelect('winterTemp', [18, 20, 22, 24, 26])}>
              <Text className={styles.formLabel}>冬季目标温度</Text>
              <View style={styles.formLinkRow}>
                <Text className={styles.formLink}>{formData.winterTemp}°C</Text>
                <Text className={styles.formArrow}>›</Text>
              </View>
            </View>
            <View className={styles.formRow}>
              <Text className={styles.formLabel}>智能自动调节</Text>
              <Switch
                checked={!!formData.tempAutoAdjust}
                onChange={(e) => handleSwitchChange('tempAutoAdjust', e.detail.value)}
                color='#00B578'
              />
            </View>
            <View className={styles.formRow}>
              <Text className={styles.formLabel}>湿度控制联动</Text>
              <Switch
                checked={!!formData.humidityControl}
                onChange={(e) => handleSwitchChange('humidityControl', e.detail.value)}
                color='#00B578'
              />
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <View className={styles.page}>
      <ScrollView scrollY>
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

              <View className={classnames(styles.strategyConfig, !strategy.enabled && styles.configDisabled)}>
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
            </View>
          ))}
        </View>
      </ScrollView>

      {showModal && editingStrategy && (
        <View className={styles.modalMask} onClick={closeModal}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <View className={classnames(styles.strategyIcon, styles[getStrategyTypeClass(editingStrategy.type)])}>
                {getStrategyIcon(editingStrategy.type)}
              </View>
              <Text className={styles.modalTitle}>{editingStrategy.name}配置</Text>
            </View>

            {renderConfigForm()}

            <View className={styles.modalActions}>
              <View className={classnames(styles.modalBtn, styles.cancelBtn)} onClick={closeModal}>
                取消
              </View>
              <View className={classnames(styles.modalBtn, styles.confirmBtn)} onClick={handleSave}>
                保存配置
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default StrategyPage;
