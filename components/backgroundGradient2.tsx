import React from 'react';
import {
    Image,
} from 'react-native';

export default function BackgroundGradient2() {
    return (
        <Image
            source={require('../assets/images/bgGradient2.png')}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                transform: 'translateY(200%)',
                height: '100%',
            }}
            resizeMode="cover"
        />
    );
}


