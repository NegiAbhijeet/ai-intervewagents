// EditAvatarModal.js
import React, { useEffect, useMemo, useState } from 'react'
import {
    Modal,
    View,
    Text,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    FlatList,
} from 'react-native'
import BackgroundGradient2 from './backgroundGradient2'
import fetchWithAuth from '../libs/fetchWithAuth'
import { JAVA_API_URL } from './config'
import Toast from 'react-native-toast-message'
import Ionicons from '@react-native-vector-icons/ionicons'

const SCREEN_WIDTH = Dimensions.get('window').width
const CONTAINER_HORIZONTAL_PADDING = 0
const COLUMNS = 3
const GAP = 12
const CONTAINER_WIDTH = Math.floor(SCREEN_WIDTH * 0.85) - CONTAINER_HORIZONTAL_PADDING * 2
const CELL_SIZE = Math.floor((CONTAINER_WIDTH - GAP * (COLUMNS - 1)) / COLUMNS)

export default function EditAvatarModal({
    visible,
    onClose,
    currentAvatar = null,
    uid,
    onSuccess = () => { },
}) {
    const [isLoading, setIsLoading] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(null)

    const avatars = useMemo(() => {
        const base = 'https://docsightaistorageprod.blob.core.windows.net/avatar/avatar'
        return Array.from({ length: 6 }, (_, i) => `${base}${i + 1}.png`)
    }, [])

    // set initial selectedIndex from currentAvatar when modal opens
    useEffect(() => {
        if (!visible) return
        const idx = avatars.findIndex((a) => a === currentAvatar)
        setSelectedIndex(idx >= 0 ? idx : null)
    }, [visible, currentAvatar, avatars])

    async function handleSave() {
        if (selectedIndex == null) {
            Toast.show({ type: 'info', text1: 'Select an avatar first' })
            return
        }

        const avatarUrl = avatars[selectedIndex]
        const payload = { avatarUrl }

        try {
            setIsLoading(true)

            const response = await fetchWithAuth(`${JAVA_API_URL}/api/candidates/update/${uid}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => null)
                throw new Error(errorData?.error || 'Failed to update avatar')
            }

            Toast.show({ type: 'success', text1: 'Avatar updated' })
            onSuccess({ avatarUrl })
            onClose()
        } catch (error) {
            console.error('Error updating avatar:', error)
            Toast.show({ type: 'error', text1: error.message || 'Something went wrong' })
        } finally {
            setIsLoading(false)
        }
    }

    const previewUri = selectedIndex != null ? avatars[selectedIndex] : currentAvatar

    const renderItem = ({ item, index }) => {
        const isSelected = selectedIndex === index
        return (
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setSelectedIndex(index)}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                style={styles.avatarCell}
            >
                <View style={[styles.avatarOuter, isSelected && styles.avatarOuterSelected]}>
                    <Image source={{ uri: item }} resizeMode="cover" accessibilityLabel={`Avatar ${index + 1}`} style={styles.gridAvatarImage} />
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalWrap}>
                    <BackgroundGradient2 style={StyleSheet.absoluteFill} />
                    <View style={styles.sheet}>
                        <View style={styles.headerRow}>
                            <TouchableOpacity onPress={onClose} accessibilityRole="button" style={styles.iconButton}>
                                <Ionicons name="close" size={26} color="#475569" />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleSave} accessibilityRole="button" disabled={isLoading} style={styles.doneButton}>
                                <Text style={styles.doneText}>{isLoading ? 'Saving...' : 'Done'}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.avatarSection}>
                            <View style={styles.avatarWrapper}>
                                {previewUri ? (
                                    <Image source={{ uri: previewUri }} style={styles.previewAvatar} />
                                ) : (
                                    <View style={styles.avatarPlaceholder} />
                                )}
                            </View>
                            <Text style={styles.changeAvatarText}>Choose Avatar</Text>
                        </View>

                        <FlatList
                            data={avatars}
                            renderItem={renderItem}
                            keyExtractor={(_, idx) => String(idx)}
                            numColumns={COLUMNS}
                            showsVerticalScrollIndicator={false}
                            columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: GAP }}
                            contentContainerStyle={{ paddingBottom: 40 }}
                        />

                        {/* <TouchableOpacity style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} onPress={handleSave} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save Avatar</Text>}
                        </TouchableOpacity> */}
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'white',
    },
    modalWrap: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    sheet: {
        height: '100%',
        width: '100%',
        alignSelf: 'center',
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        overflow: 'hidden',
        paddingHorizontal: 24,
        paddingTop: 18,
        paddingBottom: 36,
        backgroundColor: 'transparent',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    iconButton: {
        borderWidth: 1,
        borderColor: 'rgba(217, 217, 217, 1)',
        padding: 6,
        borderRadius: 999,
    },
    doneButton: {
        borderColor: 'rgba(217, 217, 217, 1)',
        borderWidth: 0.5,
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    doneText: {
        color: '#111827',
        fontSize: 16,
        fontWeight: '600',
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 18,
    },
    avatarWrapper: {
        width: 96,
        height: 96,
        borderRadius: 48,
        borderWidth: 2,
        borderColor: 'rgba(139,72,239,0.25)',
        overflow: 'hidden',
        backgroundColor: '#fff',
        marginBottom: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewAvatar: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#e6e6e6',
    },
    changeAvatarText: {
        color: 'black',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 4,
    },
    avatarCell: {
        width: CELL_SIZE,
        height: CELL_SIZE + 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarOuter: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        borderRadius: CELL_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    avatarOuterSelected: {
        borderWidth: 4,
        borderColor: 'rgba(139, 72, 239, 1)',
        shadowColor: '#4f46e5',
        shadowOpacity: 0.18,
        shadowRadius: 6,
        elevation: 4,
    },
    gridAvatarImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    saveButton: {
        marginTop: 18,
        backgroundColor: '#000',
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    saveText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
})
