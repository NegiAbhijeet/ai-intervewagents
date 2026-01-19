// minutes → seconds
export function minutesToSeconds(minutes) {
    if (!Number.isFinite(minutes)) return 0
    return Math.floor(minutes) * 60
}

// seconds → minutes (integer only)
export function secondsToMinutes(seconds) {
    if (!Number.isFinite(seconds)) return 0
    return Math.floor(seconds / 60)
}
