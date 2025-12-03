import Ionicons from '@react-native-vector-icons/ionicons';
import { translate } from 'pdf-lib';
import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const REASONS = [
    { id: 'time', label: 'Not enough time right now', icon: 'time-outline' },
    { id: 'difficult', label: 'Questions were too difficult', icon: 'help-circle-outline' },
    { id: 'technical', label: 'Technical issues', icon: 'wifi-outline' },
    { id: 'changed', label: "Changed my mind", icon: 'close-circle-outline' },
    { id: 'other', label: 'Not Mentioned', icon: 'help-outline' },
];

export default function ExitReasonsModal({ initialSelected = "time", onContinue }) {
    const [selected, setSelected] = useState(initialSelected || null);

    useEffect(() => {
        setSelected(initialSelected || null);
    }, [initialSelected]);

    const handleSelect = (id) => {
        setSelected(id);
        if (onContinue) onContinue();
    };

    const renderItem = ({ item }) => {
        const active = item.id === selected;

        return (
            <TouchableOpacity
                onPress={() => handleSelect(item.id)}
                style={[styles.option, active && styles.optionActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
            >
                <View style={styles.iconWrapper}>
                    <Ionicons name={item.icon} size={18} color={"white"} />
                </View>

                <Text style={[styles.optionText, active && styles.optionTextActive]} numberOfLines={2}>
                    {item.label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.overlay}>
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
        bottom: 8,
        left: '50%',
        transform: [{ translateX: '-50%' }],
        zIndex: 1111,
        width:"100%"
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
        backgroundColor: 'rgba(0, 0, 0, 0.93)',
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
        backgroundColor: '#fff',
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
        fontWeight: '600',
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
});
