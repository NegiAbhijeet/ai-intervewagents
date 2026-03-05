// minutes → seconds
export function minutesToSeconds(minutes) {
    const num = Number(minutes)
    if (!Number.isFinite(num)) return 0
    return Math.floor(num) * 60
}

// seconds → minutes (integer only)
export function secondsToMinutes(seconds) {
    const num = Number(seconds)
    if (!Number.isFinite(num)) return 0
    return Math.floor(num / 60)
}