import { Alert } from '@/types';

export const mockAlerts: Alert[] = [
  {
    id: 'a1',
    type: 'overload',
    level: 'warning',
    title: '用电负荷预警',
    description: '当前总功率已达5.2kW，接近入户容量上限，请注意用电安全',
    time: '10分钟前',
    handled: false
  },
  {
    id: 'a2',
    type: 'standby',
    level: 'info',
    title: '待机耗电提醒',
    description: '客厅空调待机已超过48小时，建议关闭以节约电能',
    deviceId: 'd1',
    deviceName: '客厅空调',
    time: '1小时前',
    handled: false
  },
  {
    id: 'a3',
    type: 'offline',
    level: 'error',
    title: '设备离线告警',
    description: '次卧空调已离线超过2小时，请检查设备连接',
    deviceId: 'd6',
    deviceName: '次卧空调',
    time: '2小时前',
    handled: false
  },
  {
    id: 'a4',
    type: 'high_consumption',
    level: 'info',
    title: '今日用电偏高',
    description: '今日用电量已超过上周同期20%，请注意节约用电',
    time: '3小时前',
    handled: true
  },
  {
    id: 'a5',
    type: 'overload',
    level: 'error',
    title: '过载保护触发',
    description: '电热水器功率超过上限，系统已自动降低功率',
    deviceId: 'd3',
    deviceName: '电热水器',
    time: '昨天',
    handled: true
  },
  {
    id: 'a6',
    type: 'standby',
    level: 'info',
    title: '充电桩待机提醒',
    description: '充电桩已待机超过24小时，建议开启节能模式',
    deviceId: 'd4',
    deviceName: '家用充电桩',
    time: '昨天',
    handled: true
  }
];
