import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockAlerts } from '@/data/alerts';
import { mockMonthlyBill } from '@/data/bill';

const MinePage: React.FC = () => {
  const [unhandledCount] = useState(mockAlerts.filter(a => !a.handled).length);
  
  const currentMonthBill = mockMonthlyBill[mockMonthlyBill.length - 1];
  const monthlyGoal = 500;
  const goalPercent = Math.min((currentMonthBill.energy / monthlyGoal) * 100, 100);

  const goToPage = (url: string) => {
    console.log('[Mine] Navigate to:', url);
    Taro.navigateTo({ url });
  };

  const menuGroups = [
    {
      title: '常用功能',
      items: [
        { 
          icon: '👨‍👩‍👧‍👦', 
          iconClass: 'green',
          title: '家庭管理', 
          desc: '成员权限、用电目标',
          url: '/pages/family/index'
        },
        { 
          icon: '📊', 
          iconClass: 'blue',
          title: '节能报表', 
          desc: '节能建议、执行记录',
          url: '/pages/reports/index'
        },
        { 
          icon: '🔔', 
          iconClass: 'orange',
          title: '告警中心', 
          desc: `${unhandledCount} 条待处理`,
          badge: unhandledCount,
          url: '/pages/alerts/index'
        }
      ]
    },
    {
      title: '其他',
      items: [
        { 
          icon: '⚙️', 
          iconClass: 'purple',
          title: '设置', 
          desc: '通知、隐私、通用',
          url: ''
        },
        { 
          icon: '❓', 
          iconClass: 'blue',
          title: '帮助与反馈', 
          desc: '常见问题、意见反馈',
          url: ''
        },
        { 
          icon: 'ℹ️', 
          iconClass: 'green',
          title: '关于我们', 
          desc: '版本 v1.0.0',
          url: ''
        }
      ]
    }
  ];

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.userCard}>
        <View className={styles.userInfo}>
          <View className={styles.avatar}>👤</View>
          <View className={styles.userDetail}>
            <Text className={styles.userName}>张先生</Text>
            <Text className={styles.userRole}>家庭户主</Text>
          </View>
        </View>

        <View className={styles.goalSection}>
          <View className={styles.goalHeader}>
            <Text className={styles.goalTitle}>本月用电目标</Text>
            <Text className={styles.goalValue}>
              {currentMonthBill.energy.toFixed(0)} / {monthlyGoal} kWh
            </Text>
          </View>
          <View className={styles.goalProgress}>
            <View 
              className={styles.goalFill} 
              style={{ width: `${goalPercent}%` }}
            />
          </View>
          <Text className={styles.goalDesc}>
            {goalPercent < 80 ? '继续保持，目标完成度良好 ✓' : '注意控制用电，接近目标上限 ⚠️'}
          </Text>
        </View>
      </View>

      {menuGroups.map((group, groupIndex) => (
        <View key={groupIndex}>
          <Text className={styles.sectionTitle}>{group.title}</Text>
          <View className={styles.section}>
            {group.items.map((item, itemIndex) => (
              <View
                key={itemIndex}
                className={styles.menuItem}
                onClick={() => item.url && goToPage(item.url)}
              >
                <View className={classnames(styles.menuIcon, styles[item.iconClass])}>
                  {item.icon}
                </View>
                <View className={styles.menuContent}>
                  <Text className={styles.menuTitle}>{item.title}</Text>
                  {item.desc && <Text className={styles.menuDesc}>{item.desc}</Text>}
                </View>
                {item.badge && item.badge > 0 && (
                  <View className={styles.badge}>{item.badge}</View>
                )}
                <Text className={styles.menuArrow}>›</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default MinePage;
