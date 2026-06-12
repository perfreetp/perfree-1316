export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/devices/index',
    'pages/bill/index',
    'pages/strategy/index',
    'pages/mine/index',
    'pages/alerts/index',
    'pages/family/index',
    'pages/reports/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: '家庭用能管家',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F2F8F5'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#00B578',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/devices/index',
        text: '设备'
      },
      {
        pagePath: 'pages/bill/index',
        text: '账单'
      },
      {
        pagePath: 'pages/strategy/index',
        text: '策略'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
