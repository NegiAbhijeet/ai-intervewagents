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
import getIndustryData from "../libs/getIndustryData"
import ManualIndustry from '../components/ManualRole'

const RolePage = () => {
    const navigation = useNavigation()
    const route = useRoute()
    const { t } = useTranslation()
    const { language } = useContext(AppStateContext)

    const { selectedIndustry } = route.params || {}

    const [selectedRole, setSelectedRole] = useState(null)
    const [selectedSkills, setSelectedSkills] = useState([])
    const [showNotListedModal, setShowNotListedModal] = useState(false)
    const [customRole, setCustomRole] = useState("")
    const [customError, setCustomError] = useState(null)

    const industries = useMemo(
        () => getIndustryData(language) || {},
        [language]
    )

    const rolesArray = useMemo(() => {
        if (!selectedIndustry || !industries[selectedIndustry]) {
            return [{ key: "__ROLE_NOT_LISTED__", label: "Not listed" }]
        }

        return [
            ...Object.keys(industries[selectedIndustry]).map(roleName => ({
                key: roleName,
                skills: industries[selectedIndustry][roleName],
            })),
            { key: "__ROLE_NOT_LISTED__", label: "Not listed" },
        ]
    }, [industries, selectedIndustry])

    const renderRole = ({ item }) => {
        const isNotListed = item.key === "__ROLE_NOT_LISTED__"
        const chosen = selectedRole === item.key

        const onPress = () => {
            if (isNotListed) {
                setSelectedRole(null)
                setSelectedSkills([])
                setShowNotListedModal(true)
                return
            }
            setSelectedRole(item.key)
            setSelectedSkills(item.skills || [])
        }

        return (
            <Pressable onPress={onPress}>
                <View style={[styles.card, chosen && styles.cardSelected]}>
                    <Text
                        numberOfLines={1}
                        style={[styles.value, chosen && styles.cardSelected]}
                    >
                        {isNotListed ? "Not listed" : item.key}
                    </Text>
                </View>
            </Pressable>
        )
    }


    const onNext = (customRole) => {
        const finalRole = selectedRole || customRole?.trim()

        if (!finalRole) return

        navigation.navigate('levelSelect', {
            selectedIndustry,
            selectedRole: finalRole,
            selectedSkills,
        })
    }

    return (
        <View style={styles.container}>
            <BackgroundGradient2 />

            <ManualIndustry
                visible={showNotListedModal}
                customIndustry={null}
                setCustomIndustry={() => { }}
                customRole={customRole}
                setCustomRole={setCustomRole}
                customError={customError}
                isIndustry={false}
                onClose={() => {
                    setShowNotListedModal(false)
                    setCustomRole("")
                    setCustomError(null)
                }}
                onSave={() => {
                    if (!customRole.trim()) {
                        setCustomError("Role is required")
                        return
                    }
                    setShowNotListedModal(false)
                    setCustomError(null)
                    onNext(customRole.trim())
                }}
            />

            <View style={styles.screenWrap}>
                <View style={styles.header}>
                    <Text style={styles.title}>
                        {t('onboarding.chooseRole')}
                    </Text>
                </View>

                <Text style={styles.dropdownLabel}>
                    {t('onboarding.pickRole')}
                </Text>

                <FlatList
                    data={rolesArray}
                    renderItem={renderRole}
                    keyExtractor={(_, index) => index.toString()}
                    showsVerticalScrollIndicator={false}
                />

                <View style={{ height: 16 }} />

                <Pressable
                    onPress={onNext}
                    disabled={!selectedRole}
                    style={[
                        styles.button,
                        !selectedRole && styles.disabledButton,
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

export default RolePage
