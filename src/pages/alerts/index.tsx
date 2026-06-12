import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockAlerts } from '@/data/alerts';
import { Alert, AlertLevel } from '@/types';
import { getAlertTypeName } from '@/utils';

type FilterType = 'all' | 'unhandled' | 'handled';

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'unhandled') return !alert.handled;
    if (filter === 'handled') return alert.handled;
    return true;
  });

  const handleAlertClick = (alert: Alert) => {
    console.log('[Alerts] Click alert:', alert.title);
  };

  const handleMarkHandled = (alert: Alert, e) => {
    e.stopPropagation();
    console.log('[Alerts] Mark handled:', alert.title);
    
    setAlerts(prev =>
      prev.map(a => {
        if (a.id === alert.id) {
          return { ...a, handled: true };
        }
        return a;
      })
    );

    Taro.showToast({
      title: '已标记为已处理',
      icon: 'success',
      duration: 1500
    });
  };

  const handleFix = (alert: Alert, e) => {
    e.stopPropagation();
    console.log('[Alerts] Fix alert:', alert.title);
    
    Taro.showToast({
      title: '正在处理...',
      icon: 'loading',
      duration: 1500
    });

    setTimeout(() => {
      setAlerts(prev =>
        prev.map(a => {
          if (a.id === alert.id) {
            return { ...a, handled: true };
          }
          return a;
        })
      );
      Taro.showToast({
        title: '处理成功',
        icon: 'success',
        duration: 1500
      });
    }, 1500);
  };

  const getAlertIcon = (level: AlertLevel) => {
    const icons: Record<AlertLevel, string> = {
      warning: '⚠️',
      error: '🔴',
      info: 'ℹ️'
    };
    return icons[level] || '💡';
  };

  const getFilterText = (type: FilterType) => {
    const texts: Record<FilterType, string> = {
      all: '全部',
      unhandled: '待处理',
      handled: '已处理'
    };
    return texts[type];
  };

  const unhandledCount = alerts.filter(a => !a.handled).length;

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.filterTabs}>
        {(['all', 'unhandled', 'handled'] as FilterType[]).map(type => (
          <View
            key={type}
            className={classnames(styles.filterTab, filter === type && styles.active)}
            onClick={() => setFilter(type)}
          >
            {getFilterText(type)}
            {type === 'unhandled' && unhandledCount > 0 && ` (${unhandledCount})`}
          </View>
        ))}
      </View>

      {filteredAlerts.length > 0 ? (
        <View className={styles.alertList}>
          {filteredAlerts.map(alert => (
            <View
              key={alert.id}
              className={classnames(
                styles.alertCard,
                styles[alert.level],
                alert.handled && styles.handled
              )}
              onClick={() => handleAlertClick(alert)}
            >
              <View className={styles.alertHeader}>
                <View className={classnames(styles.alertIcon, styles[alert.level])}>
                  {getAlertIcon(alert.level)}
                </View>
                <View className={styles.alertInfo}>
                  <Text className={styles.alertTitle}>
                    {alert.title}
                    <Text className={classnames(
                      styles.alertStatus,
                      alert.handled ? styles.handled : styles.unhandled
                    )}>
                      {alert.handled ? '已处理' : '待处理'}
                    </Text>
                  </Text>
                  <Text className={styles.alertTime}>{alert.time}</Text>
                </View>
              </View>

              <Text className={styles.alertContent}>{alert.description}</Text>

              {alert.deviceName && (
                <Text className={styles.alertContent}>
                  相关设备：{alert.deviceName}
                </Text>
              )}

              {!alert.handled && (
                <View className={styles.alertFooter}>
                  <View
                    className={classnames(styles.actionBtn, styles.secondary)}
                    onClick={(e) => handleMarkHandled(alert, e)}
                  >
                    忽略
                  </View>
                  <View
                    className={classnames(styles.actionBtn, styles.primary)}
                    onClick={(e) => handleFix(alert, e)}
                  >
                    立即处理
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>🎉</Text>
          <Text className={styles.emptyText}>
            {filter === 'unhandled' ? '暂无待处理告警' : 
             filter === 'handled' ? '暂无已处理告警' : '暂无告警'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default AlertsPage;
