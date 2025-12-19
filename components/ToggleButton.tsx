import { View, TouchableOpacity } from 'react-native'
import Ionicons from '@react-native-vector-icons/ionicons'

const ToggleButton = ({ value, onToggle, iconOn, iconOff }) => {
    if (value) {
        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={onToggle}
                style={{
                    flexDirection: 'row',
                    height: 48,
                    borderRadius: 9999,
                    overflow: 'hidden',
                    backgroundColor: 'rgba(40, 42, 44, 1)',
                    alignItems: "center",
                    justifyContent: "center"
                }}
            >
                <View
                    style={{
                        width: 40,
                        height: 40,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Ionicons name="ellipsis-horizontal" size={18} color="#fff" />
                </View>

                <View
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: 9999,
                        backgroundColor: 'rgba(51, 53, 55, 1)',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Ionicons name={iconOn} size={18} color="#fff" />
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onToggle}
            style={{
                flexDirection: 'row',
                height: 48,
                borderRadius: 18,
                overflow: 'hidden',
                backgroundColor: '#6d1b1b',
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            <View
                style={{
                    width: 40,
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Ionicons name="chevron-up" size={18} color="#fff" />
            </View>

            <View
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: 18,
                    backgroundColor: '#f3dcdc',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Ionicons name={iconOff} size={18} color="#6d1b1b" />
            </View>
        </TouchableOpacity>
    )
}

export default ToggleButton
