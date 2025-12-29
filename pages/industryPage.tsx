import {
    View,
    Text,
    Pressable,
    FlatList,
    StyleSheet,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { AppStateContext } from '../components/AppContext'
import BackgroundGradient2 from '../components/backgroundGradient2'
import { useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import getIndustryData from "../libs/getIndustryData"

const IndustryPage = () => {
    const navigation = useNavigation()
    const { t } = useTranslation()
    const { language } = useContext(AppStateContext)

    const [selectedIndustry, setSelectedIndustry] = useState(null)

    const industries = useMemo(
        () => getIndustryData(language) || {},
        [language]
    )
    const listData = useMemo(() => {
        if (!industries || typeof industries !== 'object') return []
        return [
            ...Object.keys(industries).map(k => ({ key: k })),
        ]
    }, [industries])

    const renderIndustry = ({ item }) => {
        const chosen = selectedIndustry === item.key;
        const onPress = () => {
            setSelectedIndustry(item.key);
        };
        return (
            <Pressable onPress={onPress}>
                <View style={[styles.card, chosen && styles.cardSelected]}>
                    <View style={{ flex: 1 }}>
                        <View style={styles.row}>
                            <Text
                                numberOfLines={1}
                                style={[styles.value, chosen && styles.cardSelected]}
                            >
                                {item.key}
                            </Text>
                        </View>
                    </View>
                </View>
            </Pressable>
        );
    };

    const onNext = () => {
        if (!selectedIndustry) return

        navigation.navigate('roleSelect', {
            selectedIndustry,
        })
    }

    return (
        <View style={styles.container}>
            <BackgroundGradient2 />

            <View style={styles.screenWrap}>
                <View style={styles.header}>
                    <Text style={styles.title}>
                        {t('onboarding.chooseDomain')}
                    </Text>
                </View>

                <Text style={styles.dropdownLabel}>
                    {t('onboarding.selectDomain')}
                </Text>

                <FlatList
                    data={listData}
                    renderItem={renderIndustry}
                    keyExtractor={(_, index) => index.toString()}
                    showsVerticalScrollIndicator={false}
                />

                <View style={{ height: 16 }} />

                <Pressable
                    onPress={onNext}
                    disabled={!selectedIndustry}
                    style={[
                        styles.button,
                        !selectedIndustry && styles.disabledButton,
                    ]}
                >
                    <Text style={styles.buttonText}>
                        {t('onboarding.next')}
                    </Text>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "white" },
    header: {
        marginTop: 45,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#0f172a',
        textAlign: 'center',
    },
    screenWrap: {
        flex: 1,
        width: '85%',
        alignSelf: 'center',
    },
    dropdownLabel: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 26,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 10.6,
        marginBottom: 6,
        borderWidth: 1,
        paddingVertical: 12,
        borderColor: 'rgba(242, 242, 242, 1)',
        alignItems: 'center',
        boxShadow: "0px 4.24px 10.6px 0px rgba(37, 73, 150, 0.1)"
    },
    cardSelected: {
        borderColor: '#111827',
        backgroundColor: 'black',
        color: "white"
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    button: {
        backgroundColor: 'black',
        paddingVertical: 15,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 16
    },
    disabledButton: {
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
})

export default IndustryPage
