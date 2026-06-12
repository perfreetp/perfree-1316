import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockSuggestions, mockExecutionRecords } from '@/data/strategy';
import { EnergySuggestion, ExecutionRecord } from '@/types';

const ReportsPage: React.FC = () => {
  const [suggestions, setSuggestions] = useState<EnergySuggestion[]>(mockSuggestions);
  const [records] = useState<ExecutionRecord[]>(mockExecutionRecords);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportTime, setExportTime] = useState('');

  const implementedCount = suggestions.filter(s => s.implemented).length;
  const totalSavingPotential = suggestions.reduce((sum, s) => sum + s.savingPotential, 0);
  const implementedSaving = suggestions.filter(s => s.implemented).reduce((sum, s) => sum + s.savingPotential, 0);

  const totalSavedEnergy = records.reduce((sum, r) => sum + (r.savedEnergy || 0), 0);
  const totalSavedMoney = records.reduce((sum, r) => sum + (r.savedMoney || 0), 0);

  const handleImplement = (suggestion: EnergySuggestion, e) => {
    e.stopPropagation();
    console.log('[Reports] Implement suggestion:', suggestion.title);
    
    if (suggestion.implemented) return;

    Taro.showModal({
      title: '确认执行',
      content: `确定要执行"${suggestion.title}"吗？`,
      success: (res) => {
        if (res.confirm) {
          setSuggestions(prev =>
            prev.map(s => {
              if (s.id === suggestion.id) {
                return { ...s, implemented: true };
              }
              return s;
            })
          );
          Taro.showToast({
            title: '已加入执行计划',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  };

  const handleExport = () => {
    console.log('[Reports] Export report');
    
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setExportTime(timeStr);
    setShowExportModal(true);
    
    Taro.showToast({
      title: '报告生成成功',
      icon: 'success',
      duration: 1500
    });
  };

  const handleCopyReport = () => {
    const topSuggestions = suggestions.slice(0, 3);
    const topRecords = records.slice(0, 3);
    
    let reportText = `家庭用能管家 - 节能报表\n`;
    reportText += `导出时间：${exportTime}\n\n`;
    reportText += `===== 数据摘要 =====\n`;
    reportText += `节能建议：共 ${suggestions.length} 条，已采纳 ${implementedCount} 条，未采纳 ${suggestions.length - implementedCount} 条\n`;
    reportText += `总节省潜力：¥${totalSavingPotential.toFixed(0)}/月，已采纳可省 ¥${implementedSaving.toFixed(0)}/月\n`;
    reportText += `执行记录：共 ${records.length} 条\n`;
    reportText += `累计节省电量：${totalSavedEnergy.toFixed(1)} kWh\n`;
    reportText += `累计节省金额：¥${totalSavedMoney.toFixed(2)}\n\n`;
    
    reportText += `===== 核心节能建议 =====\n`;
    topSuggestions.forEach((s, i) => {
      reportText += `${i + 1}. [${s.implemented ? '✓已采纳' : '待采纳'}] ${s.title}\n`;
      reportText += `   说明：${s.description}\n`;
      reportText += `   预计月省：¥${s.savingPotential}\n\n`;
    });
    
    reportText += `===== 近期执行记录 =====\n`;
    topRecords.forEach((r, i) => {
      reportText += `${i + 1}. ${r.action}\n`;
      reportText += `   结果：${r.result}\n`;
      reportText += `   节省：+${(r.savedEnergy || 0).toFixed(1)} kWh / 省¥${(r.savedMoney || 0).toFixed(2)}\n`;
      reportText += `   时间：${r.time}\n\n`;
    });
    
    Taro.setClipboardData({
      data: reportText,
      success: () => {
        Taro.showToast({
          title: '报告已复制到剪贴板',
          icon: 'success',
          duration: 1500
        });
      }
    });
  };

  const handleCloseExportModal = () => {
    setShowExportModal(false);
  };

  const handleShare = () => {
    console.log('[Reports] Share report');
    Taro.showToast({
      title: '分享功能开发中',
      icon: 'none',
      duration: 1500
    });
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      device: '💡',
      behavior: '🧘',
      strategy: '⚙️'
    };
    return icons[type] || '📋';
  };

  const getTypeName = (type: string) => {
    const names: Record<string, string> = {
      device: '设备升级',
      behavior: '行为习惯',
      strategy: '智能策略'
    };
    return names[type] || type;
  };

  const getRecordIcon = (action: string) => {
    if (action.includes('避峰')) return '⚡';
    if (action.includes('储能')) return '🔋';
    if (action.includes('温度')) return '🌡️';
    if (action.includes('离家')) return '🏠';
    return '✅';
  };

  const topSuggestionsForExport = suggestions.slice(0, 3);
  const topRecordsForExport = records.slice(0, 3);

  return (
    <View className={styles.page}>
      <ScrollView scrollY style={{ flex: 1, paddingBottom: '160rpx' }}>
        <View className={styles.summaryCard}>
          <Text className={styles.summaryTitle}>本月节能概览</Text>
          
          <View className={styles.summaryStats}>
            <View className={styles.summaryStat}>
              <Text className={styles.statValue}>
                {totalSavedEnergy.toFixed(1)}
                <Text className={styles.statUnit}>kWh</Text>
              </Text>
              <Text className={styles.statLabel}>已节省电量</Text>
            </View>
            <View className={styles.summaryStat}>
              <Text className={styles.statValue}>
                ¥{totalSavedMoney.toFixed(0)}
              </Text>
              <Text className={styles.statLabel}>已节省电费</Text>
            </View>
            <View className={styles.summaryStat}>
              <Text className={styles.statValue}>
                {implementedCount}/{suggestions.length}
              </Text>
              <Text className={styles.statLabel}>已采纳建议</Text>
            </View>
          </View>

          <Text className={styles.summaryDesc}>
            您已采纳 {implementedCount} 条节能建议，预计每月可节省 ¥{implementedSaving.toFixed(0)} 元电费。
            还有 {suggestions.length - implementedCount} 条建议等待您的采纳。
          </Text>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>节能建议</Text>
            <Text className={styles.sectionMore}>可省 ¥{totalSavingPotential.toFixed(0)}/月</Text>
          </View>

          <View className={styles.suggestionList}>
            {suggestions.map(suggestion => (
              <View
                key={suggestion.id}
                className={classnames(styles.suggestionCard, suggestion.implemented && styles.implemented)}
              >
                <View className={styles.suggestionHeader}>
                  <View className={classnames(styles.suggestionIcon, styles[suggestion.type])}>
                    {getTypeIcon(suggestion.type)}
                  </View>
                  <View className={styles.suggestionInfo}>
                    <Text className={styles.suggestionTitle}>{suggestion.title}</Text>
                    <Text className={styles.suggestionType}>{getTypeName(suggestion.type)}</Text>
                  </View>
                </View>

                <Text className={styles.suggestionDesc}>{suggestion.description}</Text>

                <View className={styles.suggestionFooter}>
                  <Text className={styles.savingPotential}>
                    预计月省 ¥{suggestion.savingPotential}
                  </Text>
                  <View
                    className={classnames(styles.implementBtn, suggestion.implemented && styles.implemented)}
                    onClick={(e) => handleImplement(suggestion, e)}
                  >
                    {suggestion.implemented ? '已采纳' : '立即采纳'}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>执行记录</Text>
            <Text className={styles.sectionMore}>查看全部 ›</Text>
          </View>

          <View className={styles.recordList}>
            {records.map(record => (
              <View key={record.id} className={styles.recordItem}>
                <View className={styles.recordIcon}>
                  {getRecordIcon(record.action)}
                </View>
                <View className={styles.recordContent}>
                  <Text className={styles.recordAction}>{record.action}</Text>
                  <Text className={styles.recordResult}>{record.result}</Text>
                  <Text className={styles.recordTime}>{record.time}</Text>
                </View>
                <View className={styles.recordSaving}>
                  <Text className={styles.savedEnergy}>
                    +{(record.savedEnergy || 0).toFixed(1)} kWh
                  </Text>
                  <Text className={styles.savedMoney}>
                    省¥{(record.savedMoney || 0).toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View className={styles.bottomBar}>
        <View className={styles.shareBtn} onClick={handleShare}>
          分享
        </View>
        <View className={styles.exportBtn} onClick={handleExport}>
          导出报告
        </View>
      </View>

      {showExportModal && (
        <View className={styles.modalMask} onClick={handleCloseExportModal}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalSuccessIcon}>✓</Text>
              <Text className={styles.modalTitle}>报告导出成功</Text>
            </View>

            <View className={styles.exportReport}>
              <Text className={styles.exportReportTitle}>家庭节能报告</Text>
              <Text className={styles.exportTime}>导出时间：{exportTime}</Text>

              <View className={styles.summaryBlock}>
                <Text className={styles.blockTitle}>📊 数据摘要</Text>
                <View className={styles.summaryRow}>
                  <Text className={styles.summaryRowLabel}>节能建议</Text>
                  <Text className={styles.summaryRowValue}>
                    共 {suggestions.length} 条，已采纳 {implementedCount} 条，未采纳 {suggestions.length - implementedCount} 条
                  </Text>
                </View>
                <View className={styles.summaryRow}>
                  <Text className={styles.summaryRowLabel}>节省潜力</Text>
                  <Text className={styles.summaryRowValue}>
                    总潜力 ¥{totalSavingPotential.toFixed(0)}/月，已采纳可省 ¥{implementedSaving.toFixed(0)}/月
                  </Text>
                </View>
                <View className={styles.summaryRow}>
                  <Text className={styles.summaryRowLabel}>执行记录</Text>
                  <Text className={styles.summaryRowValue}>共 {records.length} 条</Text>
                </View>
                <View className={styles.summaryRow}>
                  <Text className={styles.summaryRowLabel}>累计节省</Text>
                  <Text className={styles.summaryRowValue}>
                    电量 {totalSavedEnergy.toFixed(1)} kWh / 金额 ¥{totalSavedMoney.toFixed(2)}
                  </Text>
                </View>
              </View>

              <View className={styles.summaryBlock}>
                <Text className={styles.blockTitle}>💡 核心节能建议</Text>
                {topSuggestionsForExport.map((s, i) => (
                  <View key={s.id} className={styles.exportSuggestionItem}>
                    <View className={styles.exportSuggestionHeader}>
                      <Text className={styles.exportSuggestionIndex}>{i + 1}.</Text>
                      <View className={classnames(styles.exportBadge, s.implemented ? styles.badgeDone : styles.badgePending)}>
                        {s.implemented ? '已采纳' : '待采纳'}
                      </View>
                      <Text className={styles.exportSuggestionTitle}>{s.title}</Text>
                    </View>
                    <Text className={styles.exportSuggestionSaving}>预计月省 ¥{s.savingPotential}</Text>
                  </View>
                ))}
              </View>

              <View className={styles.summaryBlock}>
                <Text className={styles.blockTitle}>✅ 近期执行记录</Text>
                {topRecordsForExport.map((r, i) => (
                  <View key={r.id} className={styles.exportRecordItem}>
                    <View className={styles.exportRecordHeader}>
                      <Text className={styles.exportRecordIndex}>{i + 1}.</Text>
                      <Text className={styles.exportRecordAction}>{r.action}</Text>
                    </View>
                    <Text className={styles.exportRecordResult}>{r.result}</Text>
                    <View className={styles.exportRecordFooter}>
                      <Text className={styles.exportRecordMeta}>+{(r.savedEnergy || 0).toFixed(1)} kWh · 省¥{(r.savedMoney || 0).toFixed(2)}</Text>
                      <Text className={styles.exportRecordTime}>{r.time}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.modalActions}>
              <View className={classnames(styles.modalBtn, styles.cancelBtn)} onClick={handleCloseExportModal}>
                关闭
              </View>
              <View className={classnames(styles.modalBtn, styles.confirmBtn)} onClick={handleCopyReport}>
                复制内容
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default ReportsPage;
