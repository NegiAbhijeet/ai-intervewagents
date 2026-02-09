import { View, TouchableOpacity } from 'react-native'
import Ionicons from '@react-native-vector-icons/ionicons'

const ToggleButton = ({ isActive, onToggle, iconOn, iconOff }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onToggle}
            style={{
                flexDirection: 'row',
                height: 48,
                borderRadius: 9999,
                overflow: 'hidden',
                backgroundColor: isActive ? 'black' : '#808080',
                borderWidth: 1,
                borderColor: "transparent",
                alignItems: "center",
                justifyContent: "center"
            }}
        >
            <View
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: 9999,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Ionicons name={isActive ? iconOn : iconOff} size={18} color={isActive ? '#fff' : '#fff'} />
            </View>
        </TouchableOpacity>
    )
}

export default ToggleButton
