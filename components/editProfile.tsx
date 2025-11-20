// EditProfileModal.js
import React, { useEffect, useState } from 'react'
import {
    Modal,
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
} from 'react-native'
import BackgroundGradient2 from './backgroundGradient2'
import fetchWithAuth from '../libs/fetchWithAuth'
import Ionicons from '@react-native-vector-icons/ionicons'
import { JAVA_API_URL } from './config'
import Toast from 'react-native-toast-message'
import EditAvatarModal from './editAvatar'
import { GradientBorderView } from '@good-react-native/gradient-border'
import { Picker } from '@react-native-picker/picker'
const levels = [
    { label: 'Entry level', value: 1 },
    { label: 'Mid-level', value: 8 },
    { label: 'Senior', value: 12 },
    { label: 'Executive', value: 20 }
];
// load industries/positions from local JSON
const industries = require('../libs/industryJson.json')

export default function EditProfileModal({
    visible,
    onClose,
    currentName = '',
    avatarUrl = null,
    initialPosition,
    initialIndustry,
    initialLevel,
    canId,
    onSuccess,
}) {
    const [name, setName] = useState(currentName)
    const [isLoading, setIsLoading] = useState(false)
    const [isAvatarEdit, setIsAvatarEdit] = useState(false)

    // new state for industry and role
    const [industry, setIndustry] = useState(initialIndustry || '')
    // replace existing useState for level with:
    const [level, setLevel] = useState(
        initialLevel !== undefined && initialLevel !== null ? Number(initialLevel) : ''
    )

    const [position, setPosition] = useState(initialPosition || '')
    const [availableRoles, setAvailableRoles] = useState([])

    useEffect(() => {
        setName(currentName)
        setIndustry(initialIndustry || '')
        setPosition(initialPosition || '')
        setLevel(initialLevel !== undefined && initialLevel !== null ? Number(initialLevel) : '')
    }, [currentName, initialIndustry, initialPosition, initialLevel, visible])


    // update roles when industry changes
    useEffect(() => {
        if (industry && industries[industry]) {
            setAvailableRoles(Object.keys(industries[industry]))
            // if current position is not present in new industry, clear it
            if (!industries[industry][position]) {
                setPosition('')
            }
        } else {
            setAvailableRoles([])
            setPosition('')
        }
    }, [industry])

    async function handleSave() {
        if (!name) {
            return
        }

        const nameArray = name.trim().split(' ')
        let firstName = nameArray[0]
        let lastName = nameArray.slice(1).join(' ')
        let url = `${JAVA_API_URL}/api/candidates/update/${canId}`
        const payload = { firstName, lastName, }
        // include industry/position only when selected
        if (industry) payload.industry = industry
        if (position) payload.position = position
        if (level) payload.experienceYears = level
        try {
            setIsLoading(true)

            const response = await fetchWithAuth(url
                ,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                }
            )

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData?.error || 'Failed to update candidate')
            }

            Toast.show({ type: 'success', text1: 'Candidate updated successfully' })
            onClose()
            onSuccess()
        } catch (error) {
            console.error('Error updating candidate:', error)
            Toast.show({ type: 'error', text1: error.message || 'Something went wrong' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.backdrop}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.modalWrap}
                >
                    <BackgroundGradient2 style={StyleSheet.absoluteFill} />
                    <View style={styles.sheet}>
                        <View style={styles.headerRow}>
                            <TouchableOpacity
                                onPress={onClose}
                                accessibilityRole="button"
                                style={{ borderWidth: 1, borderColor: 'rgba(217, 217, 217, 1)', padding: 6, borderRadius: 50 }}
                            >
                                <Ionicons name="close" size={26} color="#475569" />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleSave} accessibilityRole="button" disabled={isLoading} style={{ borderColor: 'rgba(217, 217, 217, 1)', borderWidth: 0.5, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 }}>
                                <Text style={styles.doneText}>{isLoading ? 'Saving...' : 'Done'}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.avatarSection}>
                            <GradientBorderView
                                gradientProps={{
                                    colors: ['rgba(93, 91, 239, 1)', 'rgba(140, 66, 236, 1)'],
                                    start: { x: 0, y: 0 },
                                    end: { x: 0, y: 1 },
                                }}
                                style={styles.avatarWrapper}
                            >
                                {avatarUrl ? (
                                    <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                                ) : (
                                    <View style={styles.avatarPlaceholder} />
                                )}
                            </GradientBorderView>
                        </View>

                        <View style={styles.form}>
                            <Text style={styles.label}>Your Full Name</Text>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter name"
                                style={styles.input}
                                placeholderTextColor="gray"
                                maxLength={50}
                                editable={!isLoading}
                            />

                            <Text style={[styles.label, { marginTop: 16 }]}>Your Level</Text>
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={level}
                                    onValueChange={val => setLevel(val)}
                                    enabled={!isLoading}
                                    style={{ color: 'black' }}
                                >
                                    <Picker.Item label="Select level" value="" style={{ color: 'black' }} />
                                    {levels.map(item => (
                                        <Picker.Item
                                            key={String(item.value)}
                                            label={item.label}
                                            value={item.value}
                                            style={{ color: 'black' }}
                                        />
                                    ))}
                                </Picker>
                            </View>

                            <Text style={[styles.label, { marginTop: 16 }]}>Industry</Text>
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={industry}
                                    onValueChange={val => { setPosition(''); setIndustry(val) }}
                                    enabled={!isLoading}
                                    style={{ color: 'black' }}
                                >
                                    <Picker.Item label="Select industry" value="" style={{ color: 'black' }} />
                                    {Object.keys(industries).map(ind => (
                                        <Picker.Item
                                            key={ind}
                                            label={ind}
                                            value={ind}
                                            style={{ color: 'black' }}
                                        />
                                    ))}
                                </Picker>
                            </View>

                            <Text style={[styles.label, { marginTop: 16 }]}>Role / Position</Text>
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={position}
                                    onValueChange={val => setPosition(val)}
                                    enabled={!isLoading && availableRoles.length > 0}
                                    style={{ color: 'black' }}
                                >
                                    <Picker.Item
                                        label={availableRoles.length ? 'Select role' : 'Choose industry first'}
                                        value=""
                                        style={{ color: 'black' }}
                                    />
                                    {availableRoles.map(role => (
                                        <Picker.Item
                                            key={role}
                                            label={role}
                                            value={role}
                                            style={{ color: 'black' }}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
            <EditAvatarModal visible={isAvatarEdit} onClose={() => setIsAvatarEdit(false)} currentAvatar={avatarUrl} canId={canId} />
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
    closeText: {
        color: '#475569',
        fontSize: 16,
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
        borderWidth: 3,
        borderColor: 'rgba(139,72,239,0.25)',
        overflow: 'hidden',
        backgroundColor: '#fff',
        marginBottom: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarImage: {
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
        color: 'rgba(0, 0, 0, 1)',
        textDecorationLine: 'underline',
        marginTop: 4,
        fontSize: 12,
    },
    form: {
        marginTop: 6,
        width: '100%',
    },
    label: {
        color: 'rgba(0, 0, 0, 1)',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1.2,
        borderColor: 'rgba(0, 0, 0, 1)',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: 'rgba(255,255,255,0.6)',
        fontSize: 16,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 1)',
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.6)',
    },
    saveButton: {
        marginTop: 28,
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
