import { Strategy, FamilyMember, EnergySuggestion, ExecutionRecord } from '@/types';

export const mockStrategies: Strategy[] = [
  {
    id: 's1',
    name: '避峰用电',
    type: 'peak_shaving',
    enabled: true,
    description: '在电价高峰时段自动调整高耗能设备运行，降低用电成本',
    config: {
      maxPeakPower: 3000,
      autoAdjust: true
    }
  },
  {
    id: 's2',
    name: '储能充放电',
    type: 'battery_charge',
    enabled: true,
    description: '谷时充电、峰时放电，利用峰谷电价差节省电费',
    config: {
      chargeStartTime: '00:00',
      chargeEndTime: '06:00',
      dischargeStartTime: '08:00',
      dischargeEndTime: '11:00',
      minBatteryLevel: 20,
      maxBatteryLevel: 90
    }
  },
  {
    id: 's3',
    name: '离家模式',
    type: 'away_mode',
    enabled: false,
    description: '离家时自动关闭非必要设备，降低待机功耗',
    config: {
      autoDetect: false,
      turnOffDevices: ['ac', 'water_heater'],
      keepBattery: true
    }
  },
  {
    id: 's4',
    name: '舒适温度',
    type: 'comfort_temp',
    enabled: true,
    description: '智能调节空调温度，在保证舒适度的同时节约电能',
    config: {
      summerTemp: 26,
      winterTemp: 22,
      autoAdjust: true,
      humidityControl: false
    }
  }
];

export const mockFamilyMembers: FamilyMember[] = [
  {
    id: 'm1',
    name: '爸爸',
    role: 'owner',
    energyGoal: 200
  },
  {
    id: 'm2',
    name: '妈妈',
    role: 'admin',
    energyGoal: 200
  },
  {
    id: 'm3',
    name: '小明',
    role: 'member',
    energyGoal: 100
  },
  {
    id: 'm4',
    name: '小红',
    role: 'member',
    energyGoal: 100
  }
];

export const mockSuggestions: EnergySuggestion[] = [
  {
    id: 'sg1',
    title: '将空调温度调高1°C',
    description: '夏季将空调温度从25°C调高至26°C，可节省约10%的空调用电',
    type: 'behavior',
    savingPotential: 8.5,
    implemented: true
  },
  {
    id: 'sg2',
    title: '启用谷时充电模式',
    description: '将热水器、充电桩等设备的使用时间调整至谷电价时段',
    type: 'strategy',
    savingPotential: 15.2,
    implemented: true
  },
  {
    id: 'sg3',
    title: '更换节能灯泡',
    description: '将家中传统灯泡更换为LED节能灯，可节省约80%的照明用电',
    type: 'device',
    savingPotential: 5.8,
    implemented: false
  },
  {
    id: 'sg4',
    title: '关闭待机设备',
    description: '长时间不使用的设备应彻底关闭电源，避免待机耗电',
    type: 'behavior',
    savingPotential: 3.2,
    implemented: false
  },
  {
    id: 'sg5',
    title: '优化储能策略',
    description: '根据天气预报和用电习惯优化储能充放电时间',
    type: 'strategy',
    savingPotential: 12.0,
    implemented: false
  },
  {
    id: 'sg6',
    title: '安装智能插座',
    description: '为常用家电添加智能插座，实现远程控制和定时开关',
    type: 'device',
    savingPotential: 6.5,
    implemented: false
  }
];

export const mockExecutionRecords: ExecutionRecord[] = [
  {
    id: 'r1',
    action: '避峰用电 - 降低空调功率',
    time: '今天 10:30',
    result: '成功执行',
    savedEnergy: 0.5,
    savedMoney: 0.42
  },
  {
    id: 'r2',
    action: '储能柜放电',
    time: '今天 09:15',
    result: '放电2小时，输出电量3.5kWh',
    savedEnergy: 3.5,
    savedMoney: 2.98
  },
  {
    id: 'r3',
    action: '舒适温度调节',
    time: '今天 08:00',
    result: '自动将客厅空调调至26°C',
    savedEnergy: 0.3,
    savedMoney: 0.25
  },
  {
    id: 'r4',
    action: '储能柜充电',
    time: '今天 03:00',
    result: '谷时充电完成，充电量5.2kWh',
    savedEnergy: 0,
    savedMoney: 1.20
  },
  {
    id: 'r5',
    action: '避峰用电 - 暂停热水器加热',
    time: '昨天 20:30',
    result: '峰时段暂停加热1小时',
    savedEnergy: 1.2,
    savedMoney: 1.02
  },
  {
    id: 'r6',
    action: '离家模式启动',
    time: '昨天 14:00',
    result: '关闭3台设备，进入节能模式',
    savedEnergy: 2.8,
    savedMoney: 2.18
  }
];
