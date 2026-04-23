import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { useAuth } from '../../AuthContext';

const PURPLE = '#5C3EFF';

const ROLES = [
  { key: 'courier', label: '🛵 Kurye' },
  { key: 'restaurant', label: '🍔 Restoran' },
];

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '',
    role: 'courier', restaurant_name: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password || !form.phone) {
      Alert.alert('Hata', 'Tüm alanları doldurun');
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor');
      return;
    }
    if (form.password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır');
      return;
    }
    if (form.role === 'restaurant' && !form.restaurant_name) {
      Alert.alert('Hata', 'Restoran adını girin');
      return;
    }

    setLoading(true);
    const result = await register(form);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Kayıt Başarısız', result.error || 'Tekrar deneyin');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={{ fontSize: 36 }}>🛵</Text>
          </View>
          <Text style={styles.title}>Hesap Oluştur</Text>
          <Text style={styles.subtitle}>Getir-Heri'ye katılın</Text>
        </View>

        {/* Rol Seçimi */}
        <Text style={styles.label}>Hesap Türü</Text>
        <View style={styles.roleRow}>
          {ROLES.map(r => (
            <TouchableOpacity
              key={r.key}
              style={[styles.roleBtn, form.role === r.key && styles.roleBtnActive]}
              onPress={() => update('role', r.key)}
            >
              <Text style={[styles.roleBtnText, form.role === r.key && styles.roleBtnTextActive]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Ad Soyad</Text>
        <TextInput style={styles.input} value={form.name} onChangeText={v => update('name', v)} placeholder="Adınız" placeholderTextColor="#aaa" />

        <Text style={styles.label}>E-posta</Text>
        <TextInput style={styles.input} value={form.email} onChangeText={v => update('email', v)} keyboardType="email-address" autoCapitalize="none" placeholder="ornek@email.com" placeholderTextColor="#aaa" />

        <Text style={styles.label}>Telefon</Text>
        <TextInput style={styles.input} value={form.phone} onChangeText={v => update('phone', v)} keyboardType="phone-pad" placeholder="05xx xxx xx xx" placeholderTextColor="#aaa" />

        {form.role === 'restaurant' && (
          <>
            <Text style={styles.label}>Restoran Adı</Text>
            <TextInput style={styles.input} value={form.restaurant_name} onChangeText={v => update('restaurant_name', v)} placeholder="Restoranınızın adı" placeholderTextColor="#aaa" />
          </>
        )}

        <Text style={styles.label}>Şifre</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={form.password}
            onChangeText={v => update('password', v)}
            secureTextEntry={!showPassword}
            placeholder="En az 6 karakter"
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Şifre Tekrar</Text>
        <TextInput
          style={styles.input}
          value={form.confirmPassword}
          onChangeText={v => update('confirmPassword', v)}
          secureTextEntry={!showPassword}
          placeholder="Şifrenizi tekrarlayın"
          placeholderTextColor="#aaa"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Hesap Oluştur</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkRow}>
          <Text style={styles.linkText}>
            Zaten hesabınız var mı? <Text style={styles.link}>Giriş Yap</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, paddingBottom: 48 },
  header: { alignItems: 'center', marginVertical: 32 },
  logo: { width: 72, height: 72, borderRadius: 18, backgroundColor: PURPLE, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '800', color: '#111', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666' },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  roleBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', alignItems: 'center' },
  roleBtnActive: { borderColor: PURPLE, backgroundColor: '#EEF0FF' },
  roleBtnText: { fontSize: 14, fontWeight: '600', color: '#666' },
  roleBtnTextActive: { color: PURPLE },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4, marginTop: 12 },
  input: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: '#111', backgroundColor: '#FAFAFA' },
  passwordRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  eyeBtn: { padding: 13, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#FAFAFA' },
  button: { backgroundColor: PURPLE, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 28 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  linkRow: { alignItems: 'center', marginTop: 20 },
  linkText: { color: '#666', fontSize: 14 },
  link: { color: PURPLE, fontWeight: '700' },
});