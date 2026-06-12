// 格式化功率（W -> kW）
export const formatPower = (power: number): string => {
  if (power >= 1000) {
    return (power / 1000).toFixed(2) + ' kW';
  }
  return power.toFixed(0) + ' W';
};

// 格式化电量（kWh）
export const formatEnergy = (energy: number): string => {
  return energy.toFixed(2) + ' kWh';
};

// 格式化金额
export const formatMoney = (money: number): string => {
  return '¥' + money.toFixed(2);
};

// 格式化碳排（kg）
export const formatCarbon = (carbon: number): string => {
  if (carbon >= 1000) {
    return (carbon / 1000).toFixed(2) + ' t';
  }
  return carbon.toFixed(1) + ' kg';
};

// 获取设备类型名称
export const getDeviceTypeName = (type: string): string => {
  const map: Record<string, string> = {
    ac: '空调',
    water_heater: '热水器',
    charger: '充电桩',
    battery: '储能柜'
  };
  return map[type] || type;
};

// 获取设备状态名称
export const getDeviceStatusName = (status: string): string => {
  const map: Record<string, string> = {
    on: '运行中',
    off: '已关闭',
    standby: '待机',
    offline: '离线'
  };
  return map[status] || status;
};

// 获取时段类型名称
export const getPeriodTypeName = (type: string): string => {
  const map: Record<string, string> = {
    peak: '峰时',
    valley: '谷时',
    flat: '平时'
  };
  return map[type] || type;
};

// 获取告警类型名称
export const getAlertTypeName = (type: string): string => {
  const map: Record<string, string> = {
    overload: '超负荷',
    standby: '待机耗电',
    offline: '设备离线',
    high_consumption: '高能耗'
  };
  return map[type] || type;
};

// 格式化时间（HH:mm）
export const formatTime = (timeStr: string): string => {
  return timeStr;
};

// 格式化日期
export const formatDate = (dateStr: string): string => {
  return dateStr;
};

// 计算百分比
export const calcPercent = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.min(Math.round((value / total) * 100), 100);
};
