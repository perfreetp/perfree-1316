import React, { useState, useMemo, useRef } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockFamilyMembers, mockMonthlyBill } from '@/data/strategy';
import { FamilyMember } from '@/types';

const MEMBERS_STORAGE_KEY = 'family_members_data';
const GOAL_STORAGE_KEY = 'family_goal_data';

const loadPersistedMembers = (): FamilyMember[] => {
  try {
    const stored = Taro.getStorageSync(MEMBERS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[Family] Failed to load members:', e);
  }
  return [...mockFamilyMembers];
};

const loadPersistedFamilyGoal = (members: FamilyMember[]): number => {
  try {
    const stored = Taro.getStorageSync(GOAL_STORAGE_KEY);
    if (stored && typeof stored === 'number' && stored > 0) {
      return stored;
    }
  } catch (e) {
    console.warn('[Family] Failed to load family goal:', e);
  }
  if (members && members.length > 0) {
    return members.reduce((sum, m) => sum + (m.energyGoal || 0), 0);
  }
  return 500;
};

const persistMembers = (members: FamilyMember[]) => {
  try {
    Taro.setStorageSync(MEMBERS_STORAGE_KEY, JSON.stringify(members));
  } catch (e) {
    console.warn('[Family] Failed to persist members:', e);
  }
};

const persistFamilyGoal = (goal: number) => {
  try {
    Taro.setStorageSync(GOAL_STORAGE_KEY, goal);
  } catch (e) {
    console.warn('[Family] Failed to persist family goal:', e);
  }
};

const FamilyPage: React.FC = () => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [familyGoal, setFamilyGoal] = useState<number>(500);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState<'goal' | 'familyGoal' | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const initializedRef = useRef(false);

  useDidShow(() => {
    console.log('[Family] Page did show');
    if (!initializedRef.current) {
      setIsLoading(true);
      setTimeout(() => {
        const persistedMembers = loadPersistedMembers();
        const persistedGoal = loadPersistedFamilyGoal(persistedMembers);
        setMembers(persistedMembers);
        setFamilyGoal(persistedGoal);
        setIsLoading(false);
        initializedRef.current = true;
      }, 50);
    }
  });

  const currentMonthEnergy = useMemo(() => {
    try {
      if (!mockMonthlyBill || !Array.isArray(mockMonthlyBill) || mockMonthlyBill.length === 0) {
        return 0;
      }
      const last = mockMonthlyBill[mockMonthlyBill.length - 1];
      if (!last || typeof last.energy !== 'number') {
        return 0;
      }
      return last.energy;
    } catch (e) {
      console.warn('[Family] Failed to get month energy:', e);
      return 0;
    }
  }, []);

  const goalPercent = useMemo(() => {
    if (familyGoal <= 0) return 0;
    return Math.min((currentMonthEnergy / familyGoal) * 100, 100);
  }, [currentMonthEnergy, familyGoal]);

  const updateMembers = (updater: (prev: FamilyMember[]) => FamilyMember[]) => {
    setMembers(prev => {
      const next = updater(prev);
      persistMembers(next);
      return next;
    });
  };

  const updateFamilyGoal = (goal: number) => {
    setFamilyGoal(goal);
    persistFamilyGoal(goal);
  };

  const validateGoalValue = (value: string, field: string): { valid: boolean; message?: string; numValue?: number } => {
    const strValue = String(value ?? '').trim();
    if (strValue === '') {
      return { valid: false, message: '请输入数值' };
    }
    const numValue = Number(strValue);
    if (isNaN(numValue) || !Number.isFinite(numValue)) {
      return { valid: false, message: '请输入有效的数字' };
    }
    if (numValue <= 0) {
      return { valid: false, message: '数值必须大于0' };
    }
    if (!Number.isInteger(numValue)) {
      return { valid: false, message: '请输入整数' };
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
    return { valid: true, numValue: Math.round(numValue) };
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
    Taro.showActionSheet({
      itemList: ['修改权限', '设置用电目标', '移除成员'],
      success: (res) => {
        if (member.role === 'owner' && (res.tapIndex === 0 || res.tapIndex === 2)) {
          Taro.showToast({ title: '户主权限不可修改', icon: 'none', duration: 1500 });
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
    Taro.showActionSheet({
      itemList: ['管理员', '普通成员'],
      success: (res) => {
        const newRole = res.tapIndex === 0 ? 'admin' : 'member';
        updateMembers(prev =>
          prev.map(m => m.id === member.id ? { ...m, role: newRole as any } : m)
        );
        Taro.showToast({ title: `已改为${newRole === 'admin' ? '管理员' : '普通成员'}`, icon: 'success', duration: 1500 });
      }
    });
  };

  const handleEditGoal = (member: FamilyMember) => {
    setEditingMember(member);
    setTempValue(String(member.energyGoal || 100));
    setEditField('goal');
    setShowEditModal(true);
  };

  const handleRemoveMember = (member: FamilyMember) => {
    Taro.showModal({
      title: '确认移除',
      content: `确定要移除成员"${member.name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          updateMembers(prev => prev.filter(m => m.id !== member.id));
          Taro.showToast({ title: '已移除成员', icon: 'success', duration: 1500 });
        }
      }
    });
  };

  const handleAddMember = () => {
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
            updateMembers(prev => [...prev, newMember]);
            Taro.showToast({ title: '成员已添加', icon: 'success', duration: 1500 });
          } else {
            Taro.showToast({ title: '昵称不能为空', icon: 'none', duration: 1500 });
          }
        }
      }
    });
  };

  const handleGoalClick = () => {
    setEditField('familyGoal');
    setTempValue(String(familyGoal));
    setShowEditModal(true);
  };

  const handleConfirmEdit = () => {
    const validation = validateGoalValue(tempValue, editField || '');
    if (!validation.valid) {
      Taro.showToast({ title: validation.message || '输入无效', icon: 'none', duration: 2000 });
      return;
    }
    
    const goalValue = validation.numValue!;

    if (editField === 'goal' && editingMember) {
      updateMembers(prev =>
        prev.map(m => m.id === editingMember.id ? { ...m, energyGoal: goalValue } : m)
      );
      Taro.showToast({ title: '目标已更新', icon: 'success', duration: 1500 });
      closeModal();
    } else if (editField === 'familyGoal') {
      const memberCount = Math.max(members.length, 1);
      const baseGoal = Math.floor(goalValue / memberCount);
      const remainder = goalValue - baseGoal * memberCount;
      
      updateMembers(prev => {
        const sorted = [...prev].sort((a, b) => {
          const priority: Record<string, number> = { owner: 0, admin: 1, member: 2 };
          return (priority[a.role] ?? 99) - (priority[b.role] ?? 99);
        });
        
        const updated = prev.map(m => {
          let target = baseGoal;
          const rank = sorted.findIndex(s => s.id === m.id);
          if (rank < remainder) {
            target += 1;
          }
          return { ...m, energyGoal: Math.max(10, target) };
        });
        
        return updated;
      });
      
      updateFamilyGoal(goalValue);
      
      Taro.showToast({ title: '家庭目标已更新', icon: 'success', duration: 1500 });
      closeModal();
    }
  };

  const closeModal = () => {
    setShowEditModal(false);
    setEditingMember(null);
    setEditField(null);
    setTempValue('');
  };

  const handleCancelEdit = () => {
    closeModal();
  };

  const getEditModalTitle = () => {
    if (editField === 'goal') return `设置 ${editingMember?.name || ''} 的用电目标`;
    if (editField === 'familyGoal') return '设置家庭月度用电目标';
    return '编辑';
  };

  const getMemberGoalPercent = (member: FamilyMember) => {
    const goal = member.energyGoal || 1;
    const memberUsage = currentMonthEnergy / Math.max(members.length, 1);
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
              <Text className={styles.statValue}>{Math.round(currentMonthEnergy)}</Text>
              <Text className={styles.statLabel}>本月用电(kWh)</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{familyGoal}</Text>
              <Text className={styles.statLabel}>月度目标(kWh)</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{Math.round(goalPercent)}%</Text>
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
                <Text className={styles.goalNum}>{familyGoal}</Text>
                <Text className={styles.goalUnit}>kWh</Text>
                <Text>›</Text>
              </View>
            </View>
            <View className={styles.goalRow}>
              <Text className={styles.goalLabel}>月度电费目标</Text>
              <View className={styles.goalContent}>
                <Text className={styles.goalNum}>¥{Math.round(familyGoal * 0.6)}</Text>
                <Text className={styles.goalUnit}>元</Text>
                <Text>›</Text>
              </View>
            </View>
            <View className={styles.goalRow}>
              <Text className={styles.goalLabel}>月度减碳目标</Text>
              <View className={styles.goalContent}>
                <Text className={styles.goalNum}>{Math.round(familyGoal * 0.5)}</Text>
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
