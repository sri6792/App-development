// screens/EditProfileScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

export default function EditProfileScreen({ navigation }) {
  // Editable fields
  const [name, setName] = useState('Student Explorer');
  const [username, setUsername] = useState('@student123');
  const [email, setEmail] = useState('student@example.com');
  const [phone, setPhone] = useState('');

  const handleSave = () => {
    // Here you can integrate with your backend or async storage
    Alert.alert('Profile Updated', 'Your changes have been saved successfully!');
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        <Text style={styles.title}>Edit Profile</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#040617' },

  title: { fontSize: 22, fontWeight: '700', color: '#7DF9FF', marginBottom: 24 },

  label: { color: '#bfcdf5', marginBottom: 6, marginTop: 12, fontWeight: '600' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },

  saveBtn: {
    marginTop: 24,
    backgroundColor: '#7b5df0',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
