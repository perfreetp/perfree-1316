import { BillData, TimePeriod, RealtimeData } from '@/types';

// 峰谷电价时段
export const mockTimePeriods: TimePeriod[] = [
  { type: 'valley', startTime: '00:00', endTime: '06:00', price: 0.35 },
  { type: 'flat', startTime: '06:00', endTime: '08:00', price: 0.58 },
  { type: 'peak', startTime: '08:00', endTime: '11:00', price: 0.85 },
  { type: 'flat', startTime: '11:00', endTime: '14:00', price: 0.58 },
  { type: 'peak', startTime: '14:00', endTime: '17:00', price: 0.85 },
  { type: 'flat', startTime: '17:00', endTime: '19:00', price: 0.58 },
  { type: 'peak', startTime: '19:00', endTime: '22:00', price: 0.85 },
  { type: 'valley', startTime: '22:00', endTime: '24:00', price: 0.35 }
];

// 实时数据
export const mockRealtimeData: RealtimeData = {
  currentPower: 2700,
  todayEnergy: 15.6,
  todayCost: 9.85,
  todayCarbon: 8.2,
  peakPower: 3200,
  valleyPower: 1500,
  currentPeriod: 'peak',
  savedMoney: 3.2
};

// 日账单数据
export const mockDailyBill: BillData[] = [
  { date: '06-07', energy: 12.5, cost: 7.5, carbon: 6.5, peakEnergy: 5.2, valleyEnergy: 4.8, savedMoney: 2.1 },
  { date: '06-08', energy: 14.2, cost: 8.9, carbon: 7.4, peakEnergy: 6.1, valleyEnergy: 5.2, savedMoney: 2.5 },
  { date: '06-09', energy: 13.8, cost: 8.5, carbon: 7.2, peakEnergy: 5.8, valleyEnergy: 5.0, savedMoney: 2.3 },
  { date: '06-10', energy: 16.3, cost: 10.2, carbon: 8.5, peakEnergy: 7.2, valleyEnergy: 5.8, savedMoney: 2.8 },
  { date: '06-11', energy: 15.1, cost: 9.6, carbon: 7.9, peakEnergy: 6.5, valleyEnergy: 5.5, savedMoney: 2.6 },
  { date: '06-12', energy: 17.2, cost: 10.8, carbon: 9.0, peakEnergy: 7.8, valleyEnergy: 6.0, savedMoney: 3.0 },
  { date: '06-13', energy: 15.6, cost: 9.85, carbon: 8.2, peakEnergy: 6.8, valleyEnergy: 5.6, savedMoney: 3.2 }
];

// 月账单数据
export const mockMonthlyBill: BillData[] = [
  { date: '1月', energy: 380, cost: 245, carbon: 198, peakEnergy: 165, valleyEnergy: 140, savedMoney: 58 },
  { date: '2月', energy: 356, cost: 228, carbon: 186, peakEnergy: 152, valleyEnergy: 132, savedMoney: 52 },
  { date: '3月', energy: 420, cost: 272, carbon: 219, peakEnergy: 185, valleyEnergy: 155, savedMoney: 65 },
  { date: '4月', energy: 395, cost: 255, carbon: 206, peakEnergy: 172, valleyEnergy: 145, savedMoney: 60 },
  { date: '5月', energy: 450, cost: 292, carbon: 235, peakEnergy: 200, valleyEnergy: 168, savedMoney: 72 },
  { date: '6月', energy: 485, cost: 315, carbon: 253, peakEnergy: 218, valleyEnergy: 180, savedMoney: 78 }
];
