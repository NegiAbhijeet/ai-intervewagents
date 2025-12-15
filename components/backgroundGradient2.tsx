import React from 'react';
import {
    Dimensions,
    Image,
} from 'react-native';
const { width: SCREEN_W } = Dimensions.get('window')
export default function BackgroundGradient2() {
    return (
        <Image
            source={require('../assets/images/bgGradient2.png')}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                transform: 'translateY(100%)',
                height: '100%',
                width: SCREEN_W
            }}
            resizeMode="cover"
        />
    );
}


