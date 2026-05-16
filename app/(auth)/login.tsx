import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '../../lib/supabase'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email || !password) return Alert.alert('Fill in all fields')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) Alert.alert('Error', error.message)
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.sub}>Sign in to manage your events.</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#555"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#555"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.replace('/(auth)/signup')} style={styles.signupLink}>
          <Text style={styles.signupText}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  inner: { flex: 1, padding: 28 },
  back: { marginBottom: 32 },
  backText: { color: '#888', fontSize: 16 },
  title: { fontSize: 32, fontWeight: '700', color: '#fff', marginBottom: 8 },
  sub: { fontSize: 16, color: '#888', marginBottom: 40 },
  form: { gap: 14 },
  input: { backgroundColor: '#1a1a1a', borderRadius: 14, padding: 18, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: '#2a2a2a' },
  btn: { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 18, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#0a0a0a', fontSize: 17, fontWeight: '700' },
  signupLink: { alignItems: 'center', marginTop: 28 },
  signupText: { color: '#888', fontSize: 15 },
})
