// screens/ProfileScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login'); // navigate to login
    } catch (error) {
      alert("Logout failed: " + error.message);
    }
  };

  // STATIC USER DETAILS
  const user = {
    name: "Student Explorer",
    username: "@student123",
    email: "student@example.com",
    isVIP: false,
    vipLevel: "Cosmic Voyager",
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <StatusBar barStyle="light-content" />

      {/* Top Section */}
      <View style={styles.topSection}>
        <View style={[styles.iconContainer, user.isVIP && { borderColor: '#FFD700' }]}>
          <Ionicons
            name="person-circle-outline"
            size={80}
            color={user.isVIP ? "#FFD700" : "#7DF9FF"}
          />
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
          {user.isVIP && <Text style={styles.vipBadge}>🌌 {user.vipLevel}</Text>}
        </View>
      </View>

      {/* VIP Section */}
      {user.isVIP ? (
        <View style={[styles.card, styles.vipCard]}>
          <Text style={styles.cardTitle}>VIP Exclusive</Text>
          <Text style={styles.cardText}>
            Enjoy your VIP privileges and cosmic rewards.
          </Text>
          <TouchableOpacity style={[styles.btn, styles.vipBtn]}>
            <Text style={styles.btnText}>Go to VIP Dashboard ✨</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>VIP Access</Text>
          <Text style={styles.cardText}>
            Unlock VIP to gain access to exclusive missions and rewards!
          </Text>
          <TouchableOpacity style={styles.btn}>
            <Text style={styles.btnText}>Unlock VIP 🚀</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* About */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>About</Text>
        <Text style={styles.cardText}>
          NASA Space Explorer helps you track missions and explore the universe.
        </Text>
      </View>

      {/* Settings */}
      <Text style={styles.sectionTitle}>Settings</Text>
      <View style={styles.settingsCard}>
        <TouchableOpacity style={styles.settingItem}>
          <Ionicons name="notifications-outline" size={22} color="#FFCC00" />
          <Text style={styles.settingText}>Notifications</Text>
          <Text>On</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <MaterialCommunityIcons name="lock-outline" size={22} color="#FF6FD8" />
          <Text style={styles.settingText}>Privacy & Security</Text>
          <Ionicons name="chevron-forward" size={20} color="#FF6FD8" />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.small}>Version 1.0 • NASA Space Explorer</Text>
      </View>
    </ScrollView>
  );
}

// ----------------- STYLES ----------------- //
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#040617', padding: 16 },

  topSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#7DF9FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  userInfo: { alignItems: 'center' },
  name: { color: '#fff', fontSize: 20, fontWeight: '700' },
  username: { color: '#bfcdf5', fontSize: 14, marginTop: 2 },
  email: { color: '#b9c2e6', fontSize: 13, marginTop: 2 },
  vipBadge: { marginTop: 4, color: '#FFD700', fontWeight: '700', fontSize: 14 },

  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  vipCard: { backgroundColor: 'rgba(255,215,0,0.08)' },

  cardTitle: { color: '#7DF9FF', fontWeight: '700', fontSize: 16, marginBottom: 6 },
  cardText: { color: '#c9d1ee', fontSize: 13, marginBottom: 12 },

  btn: {
    backgroundColor: '#7b5df0',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  vipBtn: { backgroundColor: '#FFD700' },
  btnText: { color: '#fff', fontWeight: '700' },

  sectionTitle: {
    color: '#7DF9FF',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 8,
    marginTop: 8,
  },

  settingsCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    paddingVertical: 4,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  settingText: { flex: 1, marginLeft: 12, color: '#fff', fontWeight: '600', fontSize: 14 },

  logoutBtn: {
    backgroundColor: '#ff4d6d',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  footer: { alignItems: 'center', paddingVertical: 14 },
  small: { color: '#9aa3cf', fontSize: 12 },
});
