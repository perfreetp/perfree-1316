import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockFamilyMembers, mockMonthlyBill } from '@/data/strategy';
import { FamilyMember } from '@/types';

const FamilyPage: React.FC = () => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState<'role' | 'goal' | 'familyGoal' | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useDidShow(() => {
    console.log('[Family] Page did show, reloading data');
    setIsLoading(true);
    setTimeout(() => {
      setMembers([...mockFamilyMembers]);
      setIsLoading(false);
    }, 50);
  });

  const currentMonthBill = mockMonthlyBill[mockMonthlyBill.length - 1];
  
  const totalGoal = useMemo(() => {
    if (!members || members.length === 0) return 0;
    return members.reduce((sum, m) => sum + (m.energyGoal || 0), 0);
  }, [members]);

  const goalPercent = useMemo(() => {
    if (totalGoal <= 0) return 0;
    return Math.min((currentMonthBill.energy / totalGoal) * 100, 100);
  }, [currentMonthBill.energy, totalGoal]);

  const validateGoalValue = (value: string, field: string): { valid: boolean; message?: string; numValue?: number } => {
    if (!value || value.trim() === '') {
      return { valid: false, message: '请输入数值' };
    }
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
      return { valid: false, message: '请输入有效的数字' };
    }
    if (numValue <= 0) {
      return { valid: false, message: '数值必须大于0' };
    }
    if (field === 'goal' && numValue > 2000) {
      return { valid: false, message: '个人目标不能超过2000 kWh' };
    }
    if (field === 'familyGoal' && numValue > 20000) {
      return { valid: false, message: '家庭目标不能超过20000 kWh' };
    }
    if (field === 'goal' && numValue < 10) {
      return { valid: false, message: '个人目标不能小于10 kWh' };
    }
    if (field === 'familyGoal' && numValue < 50) {
      return { valid: false, message: '家庭目标不能小于50 kWh' };
    }
    return { valid: true, numValue };
  };

  const getRoleName = (role: string) => {
    const names: Record<string, string> = {
      owner: '户主',
      admin: '管理员',
      member: '成员'
    };
    return names[role] || role;
  };

  const getMemberAvatar = (name: string) => {
    if (!name) return '👤';
    const avatars = ['👨', '👩', '👦', '👧', '🧑'];
    const index = name.charCodeAt(0) % avatars.length;
    return avatars[index] || '👤';
  };

  const handleMemberClick = (member: FamilyMember) => {
    console.log('[Family] Click member:', member.name);
    Taro.showActionSheet({
      itemList: ['修改权限', '设置用电目标', '移除成员'],
      success: (res) => {
        console.log('[Family] Selected action:', res.tapIndex);
        if (member.role === 'owner' && (res.tapIndex === 0 || res.tapIndex === 2)) {
          Taro.showToast({
            title: '户主权限不可修改',
            icon: 'none',
            duration: 1500
          });
          return;
        }
        if (res.tapIndex === 0) {
          handleEditRole(member);
        } else if (res.tapIndex === 1) {
          handleEditGoal(member);
        } else if (res.tapIndex === 2) {
          handleRemoveMember(member);
        }
      }
    });
  };

  const handleEditRole = (member: FamilyMember) => {
    console.log('[Family] Edit role for:', member.name);
    Taro.showActionSheet({
      itemList: ['管理员', '普通成员'],
      success: (res) => {
        const newRole = res.tapIndex === 0 ? 'admin' : 'member';
        setMembers(prev =>
          prev.map(m => {
            if (m.id === member.id) {
              return { ...m, role: newRole as any };
            }
            return m;
          })
        );
        Taro.showToast({
          title: `已改为${newRole === 'admin' ? '管理员' : '普通成员'}`,
          icon: 'success',
          duration: 1500
        });
      }
    });
  };

  const handleEditGoal = (member: FamilyMember) => {
    console.log('[Family] Edit goal for:', member.name);
    setEditingMember(member);
    setTempValue(String(member.energyGoal || 100));
    setEditField('goal');
    setShowEditModal(true);
  };

  const handleRemoveMember = (member: FamilyMember) => {
    console.log('[Family] Remove member:', member.name);
    Taro.showModal({
      title: '确认移除',
      content: `确定要移除成员"${member.name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          setMembers(prev => prev.filter(m => m.id !== member.id));
          Taro.showToast({
            title: '已移除成员',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  };

  const handleAddMember = () => {
    console.log('[Family] Add member');
    Taro.showModal({
      title: '添加成员',
      editable: true,
      placeholderText: '请输入成员昵称',
      success: (res) => {
        if (res.confirm && res.content) {
          const newName = res.content.trim();
          if (newName) {
            const newMember: FamilyMember = {
              id: 'm' + Date.now(),
              name: newName,
              role: 'member',
              energyGoal: 100
            };
            setMembers(prev => [...prev, newMember]);
            Taro.showToast({
              title: '成员已添加',
              icon: 'success',
              duration: 1500
            });
          } else {
            Taro.showToast({
              title: '昵称不能为空',
              icon: 'none',
              duration: 1500
            });
          }
        }
      }
    });
  };

  const handleGoalClick = () => {
    console.log('[Family] Edit family goal');
    setEditField('familyGoal');
    setTempValue(String(totalGoal || 500));
    setShowEditModal(true);
  };

  const handleConfirmEdit = () => {
    console.log('[Family] Confirm edit, field:', editField, 'value:', tempValue);
    
    const validation = validateGoalValue(tempValue, editField || '');
    if (!validation.valid) {
      Taro.showToast({
        title: validation.message || '输入无效',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    const goalValue = validation.numValue!;

    if (editField === 'goal' && editingMember) {
      setMembers(prev =>
        prev.map(m => {
          if (m.id === editingMember.id) {
            return { ...m, energyGoal: goalValue };
          }
          return m;
        })
      );
      Taro.showToast({
        title: '目标已更新',
        icon: 'success',
        duration: 1500
      });
    } else if (editField === 'familyGoal') {
      const avgGoal = Math.ceil(goalValue / Math.max(members.length, 1));
      setMembers(prev =>
        prev.map(m => {
          if (m.role === 'owner' || m.role === 'admin') {
            return { ...m, energyGoal: Math.ceil(avgGoal * 1.2) };
          }
          return { ...m, energyGoal: avgGoal };
        })
      );
      Taro.showToast({
        title: '家庭目标已更新',
        icon: 'success',
        duration: 1500
      });
    }
    
    setShowEditModal(false);
    setEditingMember(null);
    setEditField(null);
    setTempValue('');
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingMember(null);
    setEditField(null);
    setTempValue('');
  };

  const getEditModalTitle = () => {
    if (editField === 'goal') return `设置 ${editingMember?.name || ''} 的用电目标`;
    if (editField === 'familyGoal') return '设置家庭月度用电目标';
    return '编辑';
  };

  const getMemberGoalPercent = (member: FamilyMember) => {
    const goal = member.energyGoal || 1;
    const memberUsage = currentMonthBill.energy / Math.max(members.length, 1);
    return Math.min((memberUsage / goal) * 100, 100);
  };

  if (isLoading) {
    return (
      <View className={styles.page}>
        <View className={styles.loadingContainer}>
          <Text className={styles.loadingText}>加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <ScrollView scrollY>
        <View className={styles.familyCard}>
          <Text className={styles.familyName}>幸福小家</Text>
          <Text className={styles.familyDesc}>共 {members.length} 位家庭成员</Text>
          
          <View className={styles.familyStats}>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{currentMonthBill.energy.toFixed(0)}</Text>
              <Text className={styles.statLabel}>本月用电(kWh)</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{totalGoal}</Text>
              <Text className={styles.statLabel}>月度目标(kWh)</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{goalPercent.toFixed(0)}%</Text>
              <Text className={styles.statLabel}>目标完成度</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>家庭成员</Text>
            <Text className={styles.addAction} onClick={handleAddMember}>
              + 添加成员
            </Text>
          </View>

          <View className={styles.memberList}>
            {members && members.length > 0 ? (
              members.map(member => (
                <View
                  key={member.id}
                  className={styles.memberItem}
                  onClick={() => handleMemberClick(member)}
                >
                  <View className={styles.memberAvatar}>
                    {getMemberAvatar(member.name)}
                  </View>
                  <View className={styles.memberInfo}>
                    <View style={{ display: 'flex', alignItems: 'center' }}>
                      <Text className={styles.memberName}>{member.name}</Text>
                      <Text className={classnames(styles.roleTag, styles[member.role])}>
                        {getRoleName(member.role)}
                      </Text>
                    </View>
                    <Text className={styles.memberRole}>
                      用电目标：{member.energyGoal || 0} kWh/月
                    </Text>
                  </View>
                  <View className={styles.memberGoal}>
                    <Text className={styles.goalValue}>
                      {Math.round(getMemberGoalPercent(member))}%
                    </Text>
                    <View className={styles.goalProgress}>
                      <View
                        className={styles.goalFill}
                        style={{ width: `${getMemberGoalPercent(member)}%` }}
                      />
                    </View>
                  </View>
                  <Text className={styles.memberArrow}>›</Text>
                </View>
              ))
            ) : (
              <View className={styles.emptyState}>
                <Text className={styles.emptyText}>暂无家庭成员</Text>
              </View>
            )}
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>家庭用电目标</Text>
          </View>
          <View className={styles.goalSection} onClick={handleGoalClick}>
            <View className={styles.goalRow}>
              <Text className={styles.goalLabel}>月度电量目标</Text>
              <View className={styles.goalContent}>
                <Text className={styles.goalNum}>{totalGoal}</Text>
                <Text className={styles.goalUnit}>kWh</Text>
                <Text>›</Text>
              </View>
            </View>
            <View className={styles.goalRow}>
              <Text className={styles.goalLabel}>月度电费目标</Text>
              <View className={styles.goalContent}>
                <Text className={styles.goalNum}>¥{Math.round(totalGoal * 0.6)}</Text>
                <Text className={styles.goalUnit}>元</Text>
                <Text>›</Text>
              </View>
            </View>
            <View className={styles.goalRow}>
              <Text className={styles.goalLabel}>月度减碳目标</Text>
              <View className={styles.goalContent}>
                <Text className={styles.goalNum}>{Math.round(totalGoal * 0.5)}</Text>
                <Text className={styles.goalUnit}>kg</Text>
                <Text>›</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {showEditModal && (
        <View className={styles.modalMask} onClick={handleCancelEdit}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>{getEditModalTitle()}</Text>
            
            <View className={styles.modalInputWrap}>
              <Input
                className={styles.modalInput}
                type='number'
                value={tempValue}
                onInput={(e) => setTempValue(e.detail.value)}
                placeholder='请输入数值'
                focus
              />
              <Text className={styles.inputUnit}>kWh / 月</Text>
            </View>

            <View className={styles.modalTips}>
              <Text>{editField === 'goal' ? '个人目标建议 50-500 kWh' : '家庭目标建议 200-3000 kWh'}</Text>
            </View>

            <View className={styles.modalActions}>
              <View className={classnames(styles.modalBtn, styles.cancelBtn)} onClick={handleCancelEdit}>
                取消
              </View>
              <View className={classnames(styles.modalBtn, styles.confirmBtn)} onClick={handleConfirmEdit}>
                确定
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default FamilyPage;
