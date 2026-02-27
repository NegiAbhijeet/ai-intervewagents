import Ionicons from '@react-native-vector-icons/ionicons';
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Alert,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { JAVA_API_URL } from './config';
import fetchWithAuth from '../libs/fetchWithAuth';

const REASONS = [
    { id: 'time', label: 'Not enough time right now', icon: 'time-outline' },
    { id: 'difficult', label: 'Questions were too difficult', icon: 'help-circle-outline' },
    { id: 'technical', label: 'Technical issues', icon: 'wifi-outline' },
    { id: 'changed', label: "Changed my mind", icon: 'close-circle-outline' },
    { id: 'other', label: 'Not Mentioned', icon: 'help-outline' },
];

export default function ExitReasonsModal({ uid, name, initialSelected = 'time', onContinue }) {
    const [selected, setSelected] = useState(initialSelected || null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setSelected(initialSelected || null);
    }, [initialSelected]);

    const postFeedback = async (reason) => {
        const payload = {
            uid: uid,
            fullName: name,
            message: reason?.label,
        };
        setLoading(true);
        try {
            const res = await fetchWithAuth(`${JAVA_API_URL}/api/feedback/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                // try to read error body for more context
                let text = '';
                try {
                    text = await res.text();
                } catch (e) {
                    text = '';
                }
                throw new Error(`Server returned ${res.status}${text ? `: ${text}` : ''}`);
            }

            if (onContinue) onContinue();
        } catch (error) {
            console.error('Failed to send feedback', error);
            if (onContinue) onContinue();
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (id) => {
        if (loading) return;
        setSelected(id);
        const reason = REASONS.find((r) => r.id === id) || { id, label: id };
        postFeedback(reason);
    };

    const renderItem = ({ item }) => {
        const active = item.id === selected;

        return (
            <TouchableOpacity
                onPress={() => handleSelect(item.id)}
                style={[styles.option, active && styles.optionActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                disabled={loading}
            >
                <View style={styles.iconWrapper}>
                    <Ionicons name={item.icon} size={18} color={active ? "black" : "white"} />
                </View>

                <Text style={[styles.optionText, active && styles.optionTextActive]} numberOfLines={2}>
                    {item.label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.overlay}>
            {loading && (
                <Modal transparent visible animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.spinnerContainer}>
                            <ActivityIndicator size="large" style={styles.spinner} />
                        </View>
                    </View>
                </Modal>
            )}
            <View style={styles.container}>
                <View style={styles.topBar} />

                <Text style={styles.title}>Tell us why you're leaving?</Text>
                <Text style={styles.subtitle}>Help us improve your interview next time</Text>

                <FlatList
                    data={REASONS}
                    renderItem={renderItem}
                    keyExtractor={(i) => i.id}
                    contentContainerStyle={styles.list}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: [{ translateX: '-50%' }],
        zIndex: 1111,
        width: "110%"
    },
    topBar: {
        height: 3,
        width: 30,
        backgroundColor: 'white',
        alignSelf: 'center',
        borderRadius: 2,
        marginTop: 5,
        marginBottom: 36
    },
    container: {
        width: '100%',
        maxWidth: 360,
        borderRadius: 18,
        paddingVertical: 28,
        paddingHorizontal: 22,
        paddingTop: 0,
        alignItems: 'stretch', // allow children to use full width

        // New styling from Figma
        backgroundColor: 'rgba(0, 0, 0, 1)',
        borderWidth: 1,
        borderColor: 'rgba(60, 60, 60, 1)',
        shadowColor: 'rgba(0, 0, 0, 1)',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 20,
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 6,
    },
    subtitle: {
        color: 'rgba(156, 163, 175, 1)',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
    },
    list: {
        paddingBottom: 8,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.03)',
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 12,
        marginBottom: 12,
    },
    optionActive: {
        backgroundColor: 'rgba(156, 163, 175, 1)',
    },
    iconWrapper: {
        width: 28,
        alignItems: 'center',
        marginRight: 12,
    },
    optionText: {
        color: '#fff',
        fontSize: 15,
        flex: 1,
    },
    optionTextActive: {
        color: '#0b0b0d',
        fontWeight: '500',
    },
    closeButton: {
        marginTop: 6,
        paddingVertical: 12,
        alignItems: 'center',
    },
    closeText: {
        color: '#cfcfcf',
        fontSize: 15,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.25)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    spinnerContainer: {
        width: 96,
        height: 96,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.95)',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 10
    },
    spinner: {
        transform: [{ scale: 1 }]
    }
});
