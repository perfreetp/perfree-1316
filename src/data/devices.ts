import { Device, DeviceGroup } from '@/types';

export const mockDevices: Device[] = [
  {
    id: 'd1',
    name: '客厅空调',
    type: 'ac',
    status: 'on',
    power: 1200,
    maxPower: 2500,
    group: '客厅',
    room: '客厅',
    targetTemp: 26,
    currentTemp: 28
  },
  {
    id: 'd2',
    name: '主卧空调',
    type: 'ac',
    status: 'off',
    power: 0,
    maxPower: 2000,
    group: '卧室',
    room: '主卧',
    targetTemp: 25,
    currentTemp: 27
  },
  {
    id: 'd3',
    name: '电热水器',
    type: 'water_heater',
    status: 'on',
    power: 2000,
    maxPower: 3000,
    group: '卫浴',
    room: '卫生间',
    timerOn: true,
    timerStartTime: '20:00',
    timerEndTime: '22:00'
  },
  {
    id: 'd4',
    name: '家用充电桩',
    type: 'charger',
    status: 'standby',
    power: 0,
    maxPower: 7000,
    group: '车库',
    room: '车库'
  },
  {
    id: 'd5',
    name: '储能柜',
    type: 'battery',
    status: 'on',
    power: -500,
    maxPower: 5000,
    group: '储能',
    room: '储物间',
    batteryLevel: 75,
    isCharging: false
  },
  {
    id: 'd6',
    name: '次卧空调',
    type: 'ac',
    status: 'offline',
    power: 0,
    maxPower: 1800,
    group: '卧室',
    room: '次卧',
    targetTemp: 26,
    currentTemp: 0
  }
];

export const mockDeviceGroups: DeviceGroup[] = [
  { id: 'g1', name: '全部设备', deviceIds: ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'] },
  { id: 'g2', name: '客厅', deviceIds: ['d1'] },
  { id: 'g3', name: '卧室', deviceIds: ['d2', 'd6'] },
  { id: 'g4', name: '卫浴', deviceIds: ['d3'] },
  { id: 'g5', name: '车库', deviceIds: ['d4'] },
  { id: 'g6', name: '储能', deviceIds: ['d5'] }
];
