import { View, TouchableOpacity, Image } from 'react-native'

const ToggleButton = ({
    isActive,
    onToggle,
    imageOn,
    imageOff,
    imageSize = 20
}) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onToggle}
            style={{
                flexDirection: 'row',
                height: 48,
                width: 48,
                borderRadius: 9999,
                backgroundColor: isActive ? 'black' : '#808080',
                alignItems: 'center',
                justifyContent: 'center'
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
                <Image
                    source={isActive ? imageOn : imageOff}
                    style={{
                        width: imageSize,
                        height: imageSize,
                        resizeMode: 'contain'
                    }}
                />
            </View>
        </TouchableOpacity>
    )
}

export default ToggleButton
