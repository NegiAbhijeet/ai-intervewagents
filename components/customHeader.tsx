import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CustomHeader({
    title = '',
    backIconSize = 26,
    backIconColor = '#111',
    rightIconName,
    rightIconSize = 22,
    rightIconColor = '#111',
    onRightPress,
    rightComponent,
    style,
    titleStyle,
    removePadding
}) {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation()
    function onBack() {
        navigation.goBack()
    }
    return (
        <View style={[styles.container, { paddingTop: insets.top }, style]}>
            <View style={[styles.inner, { paddingHorizontal: removePadding ? 0 : "7.5%", }]}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={onBack}
                    style={styles.left}
                    accessibilityRole="button"
                    accessibilityLabel="back"
                >
                    <Ionicons name={"arrow-back"} size={backIconSize} color={backIconColor} />
                </TouchableOpacity>

                <View style={styles.center} pointerEvents="none">
                    <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.title, titleStyle]}>
                        {title}
                    </Text>
                </View>

                <View style={styles.right}>
                    {rightComponent ? (
                        rightComponent
                    ) : rightIconName ? (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={onRightPress}
                            style={styles.rightTouch}
                            accessibilityRole="button"
                            accessibilityLabel="right-action"
                        >
                            <Ionicons name={rightIconName} size={rightIconSize} color={rightIconColor} />
                        </TouchableOpacity>
                    ) : (
                        // keeps spacing consistent when there is no right item
                        <View style={styles.rightPlaceholder} />
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: 'white',
        alignItems: "center",
        justifyContent: 'center',
        flexDirection: "row"
    },
    inner: {
        // height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10
    },
    left: {
        width: 56,
        // height: 56,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
    },
    right: {
        width: 56,
        // height: 56,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    rightTouch: {
        paddingHorizontal: 6,
        paddingVertical: 8,
    },
    rightPlaceholder: {
        width: 24,
        height: 24,
    },
});