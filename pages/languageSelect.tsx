import React, { useState, useEffect, useContext } from 'react';
import {
    View,
    Text,
    Pressable,
    FlatList,
    StyleSheet,
    I18nManager,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundGradient2 from '../components/backgroundGradient2';
import { AppStateContext } from '../components/AppContext';

// A compact set of languages. Extend this list as needed.
const LANGUAGES = [
    { code: 'en', label: 'English', isRTL: false },
    { code: 'es', label: 'Español', isRTL: false },
    { code: 'hi', label: 'हिन्दी', isRTL: false },
    { code: 'fr', label: 'Français', isRTL: false },
    { code: 'ar', label: 'العربية', isRTL: true },
    { code: 'zh', label: '中文', isRTL: false },
];

const STORAGE_KEY = 'user-language';

const LanguageSelectionScreen = () => {
    const { setLangSelected } = useContext(AppStateContext) || {};
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        let mounted = true;
        AsyncStorage.getItem(STORAGE_KEY)
            .then(saved => {
                if (!mounted) return;
                if (saved) setSelected(saved);
            })

        return () => {
            mounted = false;
        };
    }, []);

    const onSave = async () => {
        if (!selected) return;
        const langObj = LANGUAGES.find(l => l.code === selected);
        try {
            // persist the language
            await AsyncStorage.setItem(STORAGE_KEY, selected);

            // apply RTL if needed
            if (langObj?.isRTL !== undefined && I18nManager.isRTL !== langObj.isRTL) {
                I18nManager.forceRTL(!!langObj.isRTL);
                // note: a full reload may be necessary for layout to flip
            }

            // if i18n is installed in the app, try to change language globally
            try {
                // optional, will fail silently if i18n not present
                // eslint-disable-next-line global-require
                const i18n = require('../i18n').default;
                if (i18n && typeof i18n.changeLanguage === 'function') {
                    i18n.changeLanguage(selected);
                }
            } catch (e) {
                // ignore, i18n not configured
            }

            setLangSelected(true)
        } catch (err) {
            console.warn('Failed to save language', err);
        }
    };

    const renderLanguage = ({ item }) => {
        const chosen = selected === item.code;
        return (
            <Pressable onPress={() => setSelected(item.code)}>
                <View style={[styles.card, chosen && styles.cardSelected]}>
                    <View style={{ flex: 1 }}>
                        <View style={styles.row}>
                            <Text numberOfLines={1} style={[styles.value, chosen && styles.cardSelectedText]}>
                                {item.label}
                            </Text>
                        </View>
                    </View>
                </View>
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            <BackgroundGradient2 />
            <View style={styles.screenWrap}>
                <View style={styles.header}>
                    <Text style={styles.title}>Choose Language</Text>
                </View>
                <Text style={styles.dropdownLabel}>Pick your preferred language</Text>

                <FlatList
                    data={LANGUAGES}
                    renderItem={renderLanguage}
                    keyExtractor={(item) => item.code}
                    showsVerticalScrollIndicator={false}
                />

                <View style={{ height: 30 }} />

                <View style={styles.bottom}>
                    <Pressable
                        onPress={onSave}
                        disabled={!selected}
                        style={[
                            styles.button,
                            !selected && styles.disabledButton,
                        ]}
                    >
                        <Text style={styles.buttonText}>{selected ? 'Save' : 'Select'}</Text>
                    </Pressable>
                </View>

                <View style={{ height: 40 }} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 45,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0f172a',
        textAlign: 'center',
        width: '100%',
    },
    screenWrap: {
        flex: 1,
        width: '85%',
        marginHorizontal: 'auto',
        justifyContent: 'flex-start',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10.6,
        marginBottom: 6,
        borderWidth: 1,
        paddingHorizontal: 20,
        borderColor: 'rgba(242, 242, 242, 1)',
        shadowColor: '#C70039',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 2,
        elevation: 1,
        paddingVertical: 12,
    },
    cardSelected: {
        borderColor: '#111827',
        backgroundColor: 'rgba(0, 0, 0, 1)',
    },
    cardSelectedText: {
        color: 'white',
    },
    disabledButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    value: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        textAlign: 'center',
        lineHeight: 27.2,
    },
    dropdownLabel: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 26,
    },
    bottom: { width: '90%', alignSelf: 'center' },
    button: {
        backgroundColor: 'rgba(0, 0, 0, 1)',
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 27.2,
    },
    buttonText: { color: 'white', fontSize: 18, fontWeight: '600', lineHeight: 27.2 },
});

export default LanguageSelectionScreen;
