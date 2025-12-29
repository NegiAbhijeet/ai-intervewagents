import {
    View,
    Text,
    Pressable,
    FlatList,
    StyleSheet,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { AppStateContext } from '../components/AppContext'
import BackgroundGradient2 from '../components/backgroundGradient2'
import { useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import getLevelData from "../libs/getLevelData"
import fetchWithAuth from '../libs/fetchWithAuth'
import Toast from 'react-native-toast-message'

const LevelPage = () => {
    const navigation = useNavigation()
    const route = useRoute()
    const { t } = useTranslation()
    const { language } = useContext(AppStateContext)

    const {
        selectedIndustry,
        selectedRole,
        selectedSkills: initialSkills = [],
    } = route.params || {}

    const [selectedLevel, setSelectedLevel] = useState(null)
    const [selectedSkills, setSelectedSkills] = useState(initialSkills)
    const [loadingSkills, setLoadingSkills] = useState(false)

    const LEVELS = useMemo(
        () => getLevelData(language) || [],
        [language]
    )

    const fetchSkillsForPosition = async () => {
        setLoadingSkills(true)
        try {
            const body = {
                position: selectedRole,
                experience: selectedLevel || 0,
                uid: "userProfile?.uid",
                interviewType: "technical",
            }

            const response = await fetchWithAuth(
                `https://python.aiinterviewagents.com/generate-skills/`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                }
            )

            if (!response.ok) {
                throw new Error("Failed to fetch skills")
            }

            const data = await response.json()
            return (data.skills || []).slice(0, 5)
        } catch (err) {
            console.error(err)
            return []
        } finally {
            setLoadingSkills(false)
        }
    }

    const renderLevel = ({ item }) => {
        const chosen = selectedLevel === item.value

        return (
            <Pressable onPress={() => setSelectedLevel(item.value)}>
                <View style={[styles.card, chosen && styles.cardSelected]}>
                    <Text
                        numberOfLines={1}
                        style={[styles.value, chosen && styles.cardSelected]}
                    >
                        {item.label}
                    </Text>
                </View>
            </Pressable>
        )
    }

    const onNext = async () => {
        if (!selectedLevel) return

        let skills = selectedSkills

        if (!skills || skills.length === 0) {
            skills = await fetchSkillsForPosition()

            if (!skills || skills.length === 0) {
                Toast.show({
                    type: "error",
                    text1: "Please choose correct industry or role.",
                })
                return
            }

            setSelectedSkills(skills)
        }

        navigation.navigate('AvatarSelection', {
            selectedIndustry,
            selectedRole,
            selectedLevel,
            selectedSkills: skills,
        })
    }

    return (
        <View style={styles.container}>
            <BackgroundGradient2 />

            <View style={styles.screenWrap}>
                <View style={styles.header}>
                    <Text style={styles.title}>
                        {t('onboarding.selectLevel')}
                    </Text>
                </View>

                <Text style={styles.dropdownLabel}>
                    {t('onboarding.pickExperience')}
                </Text>

                <FlatList
                    data={LEVELS}
                    renderItem={renderLevel}
                    keyExtractor={(_, index) => index.toString()}
                    showsVerticalScrollIndicator={false}
                />

                <View style={{ height: 16 }} />

                <Pressable
                    onPress={onNext}
                    disabled={!selectedLevel || loadingSkills}
                    style={[
                        styles.button,
                        (!selectedLevel || loadingSkills) && styles.disabledButton,
                    ]}
                >
                    <Text style={styles.buttonText}>
                        {loadingSkills ? "please wait..." : t('onboarding.next')}
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

export default LevelPage
