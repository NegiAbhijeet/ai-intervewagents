import { useState, useCallback } from 'react'
import { Linking } from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard'
import Toast from 'react-native-toast-message'
import { API_URL } from '../components/config'
import fetchWithAuth from '../libs/fetchWithAuth'
export function useLinkedInCertificateShare(LEVELS) {
    const [linkedinloading, setLinkedinloading] = useState(false)

    const shareOnLinkedIn = useCallback(async (meetingId) => {
        try {
            setLinkedinloading(true)
            if (!meetingId) {
                Toast.show({
                    type: 'error',
                    text1: 'Share failed.'
                })
                return
            }

            const res = await fetchWithAuth(`${API_URL}/congratulations/${meetingId}/`)
            const json = await res.json()
            const meetingReport = json?.meetingData ?? {}
            const score = meetingReport?.feedback?.averagePercentage ?? 0

            const missing = []

            if (!meetingReport?.position) missing.push('position')
            if (
                !Array.isArray(meetingReport?.candidateRequiredSkills) ||
                meetingReport.candidateRequiredSkills.length === 0
            ) {
                missing.push('skills')
            }

            if (missing.length > 0) {
                Toast.show({
                    type: 'error',
                    text1: 'Share failed.'
                })
                return
            }

            const certificateUrl = `https://aiinterviewagents.com/certificate/${meetingId}`
            const userLevel = meetingReport.requiredExperience
            const finalLevel = LEVELS.find(
                item => Number(item.value) === Number(userLevel)
            )

            const normalizedSkills =
                meetingReport.candidateRequiredSkills
                    .map(s => String(s).trim())
                    .filter(Boolean)
                    .join(', ') + '.'

            const clipboardText =
                `I scored ${score}% at the ${finalLevel?.label} and covered key skills including ${normalizedSkills}
Sharing this to connect with professionals and recruiters working in ${meetingReport.position} roles.
You can view my certificate and profile through the link below on AI Interview Agents.
Always open to learning, feedback, and new opportunities.`

            Clipboard.setString(clipboardText)

            const postText =
                `Just finished a full Technical interview for a ${meetingReport.position} role on AI Interview Agents.`

            const shareUrl =
                `https://www.linkedin.com/feed/?linkOrigin=LI_BADGE&shareActive=true&shareUrl=${encodeURIComponent(
                    certificateUrl
                )}&text=${encodeURIComponent(postText)}`

            await Linking.openURL(shareUrl)
        } catch (err) {
            console.error('share failed', err)
            Toast.show({
                type: 'error',
                text1: 'Share failed',
                text2: 'Unable to open LinkedIn'
            })
        } finally {
            setLinkedinloading(false)
        }
    }, [LEVELS])

    return {
        shareOnLinkedIn,
        linkedinloading
    }
}
