import React, { useEffect, useMemo, useState } from 'react'
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
    ScrollView,

} from 'react-native'
import fetchWithAuth from '../libs/fetchWithAuth'
import { JAVA_API_URL } from './config'
import Toast from 'react-native-toast-message'
import Ionicons from '@react-native-vector-icons/ionicons'
import Layout from '../pages/Layout'
// Safe JSON loading
let industriesData = {};
try {
    industriesData = require('../libs/industryJson.json');
} catch (e) {
    console.warn("Industry JSON missing");
}



export default function EditProfileModal({
    visible,
    onClose,
    currentName = '',
    avatarUrl = null,
    initialPosition,
    initialIndustry,
    initialLevel,
    canId,
    onSuccess, language
}) {
    // Form State
    const [name, setName] = useState('')
    const [level, setLevel] = useState(0) // 0 = numeric safe default
    const [industry, setIndustry] = useState('')
    const [position, setPosition] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // UI State (Controls which screen is visible: 'form' | 'industry' | 'role' | 'level')
    const [viewMode, setViewMode] = useState('form')
    function getLevelData(lang) {
        if (lang === 'hi') return require('../libs/levels-hi.json')
        if (lang === 'en') return require('../libs/levels.json')
        return require('../libs/levels.json')
    }

    const LEVELS = useMemo(() => getLevelData(language) || {}, [language])
    // Initialize Data
    useEffect(() => {
        if (visible) {
            setName(currentName || '')
            setIndustry(initialIndustry || '')
            setPosition(initialPosition || '')

            // Safe Number Conversion
            const safeLevel = parseInt(initialLevel);
            setLevel(!isNaN(safeLevel) ? safeLevel : 0);

            setViewMode('form'); // Reset view
        }
    }, [visible, currentName, initialIndustry, initialPosition, initialLevel])

    // --- SAVE LOGIC ---
    async function handleSave() {
        if (!name.trim()) return Toast.show({ type: 'error', text1: 'Name is required' });

        setIsLoading(true)
        try {
            const nameArray = name.trim().split(' ')
            const firstName = nameArray[0]
            const lastName = nameArray.slice(1).join(' ') || ''

            let skills = []
            if (industry && position && industriesData[industry]) {
                skills = industriesData[industry][position] || []
            }

            const payload = {
                firstName,
                lastName,
                industry,
                position,
                requiredSkills: skills.length > 0 ? skills : undefined,
                experienceYears: level > 0 ? level : undefined
            }

            const url = `${JAVA_API_URL}/api/candidates/update/${canId}`
            const response = await fetchWithAuth(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!response.ok) throw new Error('Update failed');

            Toast.show({ type: 'success', text1: 'Profile updated!' })
            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
            Toast.show({ type: 'error', text1: 'Failed to update profile' })
        } finally {
            setIsLoading(false)
        }
    }

    // --- RENDER HELPERS ---

    // 1. The Main Form
    const renderForm = () => (
        <ScrollView showsVerticalScrollIndicator={false}>
            {/* Avatar */}
            <View style={styles.avatarSection}>
                <View style={styles.avatarWrapper}>
                    {avatarUrl && !avatarUrl.includes("profileData") ? (
                        <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                    ) : (
                        <View style={styles.avatarPlaceholder} />
                    )}
                </View>
            </View>

            {/* Name Input */}
            <Text style={styles.label}>Full Name</Text>
            <TextInput
                value={name}
                onChangeText={setName}
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#999"
            />

            {/* Level Selector now uses a dropdown like Industry/Role */}
            <Text style={styles.label}>Experience Level</Text>
            <TouchableOpacity
                style={styles.selectorBtn}
                onPress={() => setViewMode('level')}
            >
                <Text style={styles.selectorText}>{LEVELS.find(l => l.value === level)?.label || 'Select Level >'}</Text>
                <Ionicons name="chevron-down" size={20} color="#333" />
            </TouchableOpacity>

            {/* Custom Industry Selector (Click opens list) */}
            <Text style={styles.label}>Domain</Text>
            <TouchableOpacity
                style={styles.selectorBtn}
                onPress={() => setViewMode('industry')}
            >
                <Text style={styles.selectorText}>
                    {industry || "Select Industry >"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#333" />
            </TouchableOpacity>

            {/* Custom Role Selector */}
            <Text style={styles.label}>Role / Position</Text>
            <TouchableOpacity
                style={[styles.selectorBtn, !industry && styles.disabledBtn]}
                disabled={!industry}
                onPress={() => setViewMode('role')}
            >
                <Text style={styles.selectorText}>
                    {position || (industry ? "Select Role >" : "Select Industry first")}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#333" />
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );

    // 2. The List Selection View (Replaces Picker)
    const renderListSelection = (dataArray, onSelect, title) => (
        <View style={{ flex: 1 }}>
            <View style={styles.subHeader}>
                <TouchableOpacity onPress={() => setViewMode('form')}>
                    <Text style={styles.backText}>{'< Back'}</Text>
                </TouchableOpacity>
                <Text style={styles.subTitle}>{title}</Text>
                <View style={{ width: 40 }} />
            </View>
            <ScrollView>
                {dataArray.map((item) => {
                    const display = typeof item === 'string' ? item : item.label;
                    const key = typeof item === 'string' ? item : String(item.value);
                    return (
                        <TouchableOpacity
                            key={key}
                            style={styles.listItem}
                            onPress={() => {
                                onSelect(item);
                                setViewMode('form');
                            }}
                        >
                            <Text style={styles.listItemText}>{display}</Text>
                        </TouchableOpacity>
                    )
                })}
                {dataArray.length === 0 && <Text style={{ padding: 20, textAlign: 'center' }}>No options available</Text>}
            </ScrollView>
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <Layout>
                <View style={styles.backdrop}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalWrap}>
                        <View style={styles.sheet}>

                            {/* Header only shows in Form mode */}
                            {viewMode === 'form' && (
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
                            )}

                            {/* Conditional Rendering based on View Mode */}
                            {viewMode === 'form' && renderForm()}

                            {viewMode === 'industry' && renderListSelection(
                                Object.keys(industriesData),
                                (val) => { setIndustry(val); setPosition(''); },
                                "Select Industry"
                            )}

                            {viewMode === 'role' && renderListSelection(
                                industry ? Object.keys(industriesData[industry] || {}) : [],
                                setPosition,
                                "Select Role"
                            )}

                            {viewMode === 'level' && renderListSelection(
                                LEVELS,
                                (item) => {
                                    // item is an object {label, value}
                                    if (typeof item === 'object' && item !== null) setLevel(item.value)
                                    else {
                                        // fallback: try to find by label
                                        const found = LEVELS.find(l => l.label === item)
                                        if (found) setLevel(found.value)
                                    }
                                },
                                "Select Level"
                            )}

                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Layout>
        </Modal>
    )
}

const styles = StyleSheet.create({
    backdrop: { flex: 1, },
    modalWrap: { flex: 1, justifyContent: 'flex-end' },
    sheet: {
        height: '100%',
        paddingTop: 20,
        overflow: 'hidden'
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' },
    iconBtn: { padding: 8, backgroundColor: '#f3f4f6', borderRadius: 20 },
    closeX: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    doneBtn: { backgroundColor: '#000', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
    doneText: {
        color: '#111827',
        fontSize: 16,
        fontWeight: '600',
    },

    // Avatar
    avatarSection: { alignItems: 'center', marginBottom: 20 },
    avatarWrapper: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#8c42ec', overflow: 'hidden', backgroundColor: '#eee' },
    avatarImage: { width: '100%', height: '100%' },
    avatarPlaceholder: { width: '100%', height: '100%', backgroundColor: '#ddd' },

    // Form
    label: { fontSize: 12, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 12 },
    input: {
        borderWidth: 1.2,
        borderColor: 'rgba(0, 0, 0, 1)',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: 'rgba(255,255,255,0.6)',
        fontSize: 16,
    },

    levelRow: { flexDirection: 'row', justifyContent: 'space-between' },
    levelBtn: { flex: 1, paddingVertical: 10, marginHorizontal: 4, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, alignItems: 'center', backgroundColor: '#fff' },
    levelBtnActive: { backgroundColor: '#8c42ec', borderColor: '#8c42ec' },
    levelText: { fontSize: 12, color: '#333' },
    levelTextActive: { color: '#fff', fontWeight: '600' },

    selectorBtn: {
        borderWidth: 1.2,
        borderColor: 'rgba(0, 0, 0, 1)', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 8, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    disabledBtn: { opacity: 0.5 },
    selectorText: { fontSize: 16, color: '#000' },

    subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    backText: { color: '#8c42ec', fontSize: 16, fontWeight: '500' },
    subTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
    listItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
    listItemText: { fontSize: 16, color: '#333' }
})
