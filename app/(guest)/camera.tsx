import { useState, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImageManipulator from 'expo-image-manipulator'
import { supabase } from '../../lib/supabase'
import { useGuestStore } from '../../store/guestStore'

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  const [facing, setFacing] = useState<'front' | 'back'>('back')
  const [lastPhoto, setLastPhoto] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const cameraRef = useRef<CameraView>(null)

  const { guestId, currentEvent, shotsTaken, incrementShots } = useGuestStore()
  const shotsLeft = (currentEvent?.shot_limit ?? 0) - shotsTaken

  if (!permission) return <View style={styles.container} />

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionBox}>
          <Text style={styles.permissionTitle}>Camera Access Needed</Text>
          <Text style={styles.permissionText}>Once needs camera access to take photos for your event.</Text>
          <TouchableOpacity style={styles.btn} onPress={requestPermission}>
            <Text style={styles.btnText}>Allow Camera</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  if (shotsLeft <= 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionBox}>
          <Text style={styles.permissionTitle}>Film's Full!</Text>
          <Text style={styles.permissionText}>
            You've used all {currentEvent?.shot_limit} shots.{'\n'}
            Check back when the host develops the film.
          </Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.replace('/(guest)/waiting')}>
            <Text style={styles.btnText}>Go to Waiting Room</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  async function takePicture() {
    if (!cameraRef.current || uploading) return
    setUploading(true)

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 })
      if (!photo) return

      const compressed = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1080 } }],
        { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
      )

      setLastPhoto(compressed.uri)

      const path = `${currentEvent?.id}/${guestId}/${Date.now()}.jpg`
      const response = await fetch(compressed.uri)
      const blob = await response.blob()

      const { error: uploadError } = await supabase.storage
        .from('event-photos')
        .upload(path, blob, { contentType: 'image/jpeg' })

      if (uploadError) throw uploadError

      await supabase.from('photos').insert({
        event_id: currentEvent?.id,
        guest_id: guestId,
        storage_path: path,
      })

      await supabase.from('guests')
        .update({ shots_taken: shotsTaken + 1 })
        .eq('id', guestId)

      incrementShots()
    } catch (e: any) {
      Alert.alert('Upload failed', e.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
        {/* Top bar */}
        <SafeAreaView style={styles.topBar}>
          <Text style={styles.eventName}>{currentEvent?.name}</Text>
          <View style={styles.shotsCounter}>
            <Text style={styles.shotsText}>{shotsLeft} shots left</Text>
          </View>
        </SafeAreaView>

        {/* Last photo thumbnail */}
        {lastPhoto && (
          <View style={styles.thumbnailContainer}>
            <Image source={{ uri: lastPhoto }} style={styles.thumbnail} />
          </View>
        )}

        {/* Bottom controls */}
        <View style={styles.bottomBar}>
          <TouchableOpacity onPress={() => router.push('/(guest)/waiting')} style={styles.sideBtn}>
            <Text style={styles.sideBtnText}>Wait</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.shutterBtn, uploading && styles.shutterBtnDisabled]}
            onPress={takePicture}
            disabled={uploading}
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sideBtn}
            onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
          >
            <Text style={styles.sideBtnText}>Flip</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8 },
  eventName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  shotsCounter: { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  shotsText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  thumbnailContainer: { position: 'absolute', bottom: 120, left: 20 },
  thumbnail: { width: 60, height: 80, borderRadius: 8, borderWidth: 2, borderColor: '#fff' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 40, paddingBottom: 48, paddingTop: 20 },
  shutterBtn: { width: 78, height: 78, borderRadius: 39, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#fff' },
  shutterBtnDisabled: { opacity: 0.4 },
  shutterInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#fff' },
  sideBtn: { width: 56, height: 56, justifyContent: 'center', alignItems: 'center' },
  sideBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  permissionBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  permissionTitle: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  permissionText: { color: '#888', fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  btn: { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32 },
  btnText: { color: '#0a0a0a', fontSize: 16, fontWeight: '700' },
})
