import React from 'react';
import {
    Image,
} from 'react-native';

export default function BackgroundGradient1() {
    return (
        <Image
            source={require('../assets/images/bgGradient.png')}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                transform: 'translateY(170%)',
                height: '100%',
            }}
            resizeMode="cover"
        />
    );
}


