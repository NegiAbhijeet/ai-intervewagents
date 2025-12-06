export default function getISTDateString() {
    // IST is UTC+5:30
    const d = new Date()
    // get UTC millis, add IST offset in ms
    const istOffsetMs = 5.5 * 60 * 60 * 1000
    const ist = new Date(d.getTime() + istOffsetMs)
    const yyyy = ist.getUTCFullYear()
    const mm = String(ist.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(ist.getUTCDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
}