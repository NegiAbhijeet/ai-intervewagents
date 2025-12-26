import React, { useContext, useEffect, useMemo, useState } from "react"
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    Pressable,
    Modal,
    ActivityIndicator,
} from "react-native"
import { API_URL } from "../components/config"
import Certificate from "../components/certificate"
import fetchWithAuth from "../libs/fetchWithAuth"
import Layout from "./Layout"
import CustomHeader from "../components/customHeader"
import LinearGradient from "react-native-linear-gradient"
import { AppStateContext } from "../components/AppContext"
import { useLinkedInCertificateShare } from "../hooks/useLinkedInCertificateShare"
import getLevelData from "../libs/getLevelData"
const { width: SCREEN_W } = Dimensions.get('window')
const parentWidth = SCREEN_W * 0.8

const ViewAllCertificates = ({ route }) => {
    const { language } = useContext(AppStateContext)
    const { uid, userId } = route.params || {}
    const LEVELS = useMemo(() => getLevelData(language) || {}, [language])
    const [loading, setLoading] = useState(false)
    const [certificates, setCertificates] = useState([])
    const { shareOnLinkedIn, linkedinloading } = useLinkedInCertificateShare(LEVELS)
    const fetchAllCertificates = async () => {
        try {
            setLoading(true)

            const response = await fetchWithAuth(
                `${API_URL}/get-certificate/?uid=${uid}&userId=${userId}`
            )

            const result = await response.json()

            if (Array.isArray(result?.certificates)) {
                const sortedCertificates = result.certificates.sort(
                    (a, b) => b.score - a.score
                )
                console.log(sortedCertificates, "===sortedCertificates")
                setCertificates(sortedCertificates)
            }
        } catch (error) {
            console.error("Failed to fetch certificates:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (uid && userId) {
            fetchAllCertificates()
        }
    }, [uid, userId])

    if (loading) {
        return <Text style={styles.loading}>Loading certificates...</Text>
    }

    if (certificates.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No certificates issued.</Text>
            </View>
        )
    }

    const bestCertificate = certificates[0]
    const otherCertificates = certificates.slice(1)

    return (
        <Layout>
            {
                linkedinloading && <Modal transparent visible animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.spinnerContainer}>
                            <ActivityIndicator size="large" style={styles.spinner} />
                        </View>
                    </View>
                </Modal>
            }
            <CustomHeader title="Certificates Issued" removePadding={true} />
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                {/* Best Certificate */}
                <Text style={styles.sectionTitle}>Best scored certificate</Text>

                <View style={styles.certificateBox}>
                    <Certificate
                        imageUrl={bestCertificate?.certificate_url}
                        parentWidth={parentWidth}
                    />

                    <Pressable style={{ marginTop: 10, width: parentWidth }} onPress={() => { shareOnLinkedIn(bestCertificate?.meeting_id) }} disabled={linkedinloading}>
                        <LinearGradient
                            colors={['rgba(59, 130, 246, 1)', 'rgba(14, 165, 233, 1)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                flexDirection: 'row',
                                borderRadius: 10,
                                justifyContent: 'center',
                                alignItems: 'center',
                                paddingVertical: 16,
                                width: "100%",
                                gap: 8
                            }}
                        >
                            <Image source={require("../assets/images/linkedin.png")} /><Text style={{ color: "white", fontWeight: 600 }}>Share on Linkedin</Text>
                        </LinearGradient>
                    </Pressable>
                </View>

                {/* Other Certificates */}
                {otherCertificates.length > 0 && (
                    <>
                        <Text style={[styles.sectionTitle, { marginTop: 26 }]}>Other certificates</Text>

                        {otherCertificates.map((item, index) => (
                            <View key={index} style={[styles.certificateBox, { marginBottom: 24 }]}>
                                <Certificate
                                    imageUrl={item?.certificate_url}
                                    parentWidth={parentWidth}
                                />
                                <Pressable style={{ marginTop: 10, width: parentWidth }} onPress={() => { shareOnLinkedIn(certificates[index]?.meeting_id) }} disabled={linkedinloading}>
                                    <LinearGradient
                                        colors={['rgba(59, 130, 246, 1)', 'rgba(14, 165, 233, 1)']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={{
                                            flexDirection: 'row',
                                            borderRadius: 10,
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            paddingVertical: 16,
                                            width: "100%",
                                            gap: 8
                                        }}
                                    >
                                        <Image source={require("../assets/images/linkedin.png")} /><Text style={{ color: "white", fontWeight: 600 }}>Share on Linkedin</Text>
                                    </LinearGradient>
                                </Pressable>
                            </View>
                        ))}
                    </>
                )}
            </ScrollView>
        </Layout>
    )
}

export default ViewAllCertificates

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    loading: {
        marginTop: 40,
        textAlign: "center",
        fontSize: 16,
        fontWeight: "600",
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 500,
        marginBottom: 24,
        color: "rgba(60, 60, 60, 1)",
        textAlign: "center"
    },
    certificateBox: {
        marginBottom: 0,
        // backgroundColor: "red"
    },
    otherCertificate: {
        // marginBottom: 20,
    },
    linkedin: {
        marginTop: 12,
        backgroundColor: "#0A66C2",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: 6,
    },
    linkedinIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
    },
    linkedinText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyText: {
        fontSize: 14,
        fontWeight: "500",
        color: "rgba(0,0,0,0.6)",
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
    },
})
