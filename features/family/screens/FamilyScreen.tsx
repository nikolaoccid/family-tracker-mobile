import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { UserPlus } from 'lucide-react-native';
import { useAuthStore } from '@/features/auth';
import Colors from '@/shared/ui/colors';
import { QueryBoundary } from '@/shared/ui';
import { useFamily } from '../hooks/useFamily';
import { useMemberActions } from '../hooks/useMemberActions';
import { isFamilyAdmin } from '../model/permissions';
import type { Family } from '../model/family';
import { AnalyticsShortcuts } from '../components/AnalyticsShortcuts';
import { FamilyHeader } from '../components/FamilyHeader';
import FamilyMemberItem from '../components/FamilyMemberItem';
import { NoFamilyState } from '../components/NoFamilyState';
import { SharingScheduleCard } from '../components/SharingScheduleCard';
import { MembersSection } from '../components/MembersSection';

export function FamilyScreen() {
  const query = useFamily();
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <QueryBoundary query={query}>
        {(family) => (family && family.members.length > 0 ? <FamilyOverview family={family} /> : <NoFamilyState />)}
      </QueryBoundary>
    </View>
  );
}

function FamilyOverview({ family }: { family: Family }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAdmin = isFamilyAdmin(family, user?.id);
  const actions = useMemberActions(family, isAdmin);

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false}>
        <FamilyHeader
          name={family.name}
          memberCount={family.members.length}
          isAdmin={isAdmin}
          onDeleteFamily={actions.deleteFamily}
        />
        <AnalyticsShortcuts />
        <SharingScheduleCard isPremium={!!user?.isPremium} />
        <MembersSection title="Family Members">
          {family.members.map((member) => (
            <FamilyMemberItem
              key={member.id}
              member={member}
              isCurrentUser={member.id === user?.id}
              isAdmin={isAdmin}
              onPress={() => router.push(`/profile/view/${member.id}`)}
              onPromote={() => void actions.promote(member)}
              onDemote={() => void actions.demote(member)}
              onDelete={() => void actions.remove(member)}
            />
          ))}
        </MembersSection>
      </ScrollView>
      {isAdmin && (
        <TouchableOpacity style={styles.fab} onPress={() => router.push('/family/add-member')} accessibilityLabel="Add member">
          <UserPlus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.light.background },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
