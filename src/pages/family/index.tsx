import React, { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockFamilyMembers, mockMonthlyBill } from '@/data/strategy';
import { FamilyMember } from '@/types';

const FamilyPage: React.FC = () => {
  const [members] = useState<FamilyMember[]>(mockFamilyMembers);
  
  const currentMonthBill = mockMonthlyBill[mockMonthlyBill.length - 1];
  const totalGoal = members.reduce((sum, m) => sum + (m.energyGoal || 0), 0);
  const goalPercent = Math.min((currentMonthBill.energy / totalGoal) * 100, 100);

  const getRoleName = (role: string) => {
    const names: Record<string, string> = {
      owner: '户主',
      admin: '管理员',
      member: '成员'
    };
    return names[role] || role;
  };

  const getRoleClass = (role: string) => {
    return role;
  };

  const handleMemberClick = (member: FamilyMember) => {
    console.log('[Family] Click member:', member.name);
    Taro.showActionSheet({
      itemList: ['查看详情', '修改权限', '设置用电目标', '移除成员'],
      success: (res) => {
        console.log('[Family] Selected action:', res.tapIndex);
        Taro.showToast({
          title: '功能开发中',
          icon: 'none',
          duration: 1500
        });
      }
    });
  };

  const handleAddMember = () => {
    console.log('[Family] Add member');
    Taro.showToast({
      title: '添加成员功能开发中',
      icon: 'none',
      duration: 1500
    });
  };

  const handleGoalClick = () => {
    console.log('[Family] Edit goal');
    Taro.showToast({
      title: '目标设置功能开发中',
      icon: 'none',
      duration: 1500
    });
  };

  const getMemberAvatar = (name: string) => {
    const avatars = ['👨', '👩', '👦', '👧'];
    const index = name.length % avatars.length;
    return avatars[index] || '👤';
  };

  return (
    <ScrollView className={styles.page} scrollY>
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
          {members.map(member => (
            <View
              key={member.id}
              className={styles.memberItem}
              onClick={() => handleMemberClick(member)}
            >
              <View className={styles.memberAvatar}>
                {getMemberAvatar(member.name)}
              </View>
              <View className={styles.memberInfo}>
                <Text className={styles.memberName}>
                  {member.name}
                  <Text className={classnames(styles.roleTag, styles[getRoleClass(member.role)])}>
                    {getRoleName(member.role)}
                  </Text>
                </Text>
                <Text className={styles.memberRole}>
                  用电目标：{member.energyGoal} kWh/月
                </Text>
              </View>
              <View className={styles.memberGoal}>
                <Text className={styles.goalValue}>
                  {Math.round((currentMonthBill.energy / members.length) / (member.energyGoal || 1) * 100}%
                </Text>
                <View className={styles.goalProgress}>
                  <View 
                  className={styles.goalFill}
                  style={{ 
                    width: `${Math.min(
                      ((currentMonthBill.energy / members.length) / (member.energyGoal || 1)) * 100,
                      100
                    )}%` 
                  }}
                />
                </View>
              </View>
              <Text className={styles.memberArrow}>›</Text>
            </View>
          ))}
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
  );
};

export default FamilyPage;
