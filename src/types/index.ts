// 设备类型
export type DeviceType = 'ac' | 'water_heater' | 'charger' | 'battery';

// 设备状态
export type DeviceStatus = 'on' | 'off' | 'standby' | 'offline';

// 设备信息
export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  power: number;
  maxPower: number;
  group?: string;
  room?: string;
  timerOn?: boolean;
  timerStartTime?: string;
  timerEndTime?: string;
  targetTemp?: number;
  currentTemp?: number;
  batteryLevel?: number;
  isCharging?: boolean;
}

// 设备分组
export interface DeviceGroup {
  id: string;
  name: string;
  deviceIds: string[];
}

// 峰谷时段类型
export type TimePeriodType = 'peak' | 'valley' | 'flat';

// 峰谷时段
export interface TimePeriod {
  type: TimePeriodType;
  startTime: string;
  endTime: string;
  price: number;
}

// 实时数据
export interface RealtimeData {
  currentPower: number;
  todayEnergy: number;
  todayCost: number;
  todayCarbon: number;
  peakPower: number;
  valleyPower: number;
  currentPeriod: TimePeriodType;
  savedMoney: number;
}

// 账单数据
export interface BillData {
  date: string;
  energy: number;
  cost: number;
  carbon: number;
  peakEnergy: number;
  valleyEnergy: number;
  savedMoney: number;
}

// 告警类型
export type AlertType = 'overload' | 'standby' | 'offline' | 'high_consumption';

// 告警级别
export type AlertLevel = 'warning' | 'error' | 'info';

// 告警信息
export interface Alert {
  id: string;
  type: AlertType;
  level: AlertLevel;
  title: string;
  description: string;
  deviceId?: string;
  deviceName?: string;
  time: string;
  handled: boolean;
}

// 策略类型
export interface Strategy {
  id: string;
  name: string;
  type: 'peak_shaving' | 'battery_charge' | 'away_mode' | 'comfort_temp';
  enabled: boolean;
  description: string;
  config?: Record<string, any>;
}

// 家庭成员
export interface FamilyMember {
  id: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
  avatar?: string;
  energyGoal?: number;
}

// 节能建议
export interface EnergySuggestion {
  id: string;
  title: string;
  description: string;
  type: 'device' | 'behavior' | 'strategy';
  savingPotential: number;
  implemented: boolean;
}

// 执行记录
export interface ExecutionRecord {
  id: string;
  action: string;
  time: string;
  result: string;
  savedEnergy?: number;
  savedMoney?: number;
}
