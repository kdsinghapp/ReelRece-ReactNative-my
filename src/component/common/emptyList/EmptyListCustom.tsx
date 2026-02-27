import { Color } from '@theme/color';
import font from '@theme/font';
import { t } from 'i18next';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface EmptyListComponentProps {
    message?: string;
}

const EmptyListCustom: React.FC<EmptyListComponentProps> = ({ message =   t("emptyState.nodata") }) => {
    return (
        <View style={styles.emptyContainer}>
            <Text  allowFontScaling={false}  style={styles.emptyText}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
    },
    emptyText: {
        fontSize: 15,
        color: Color.textGray,
        textAlign:"center" ,
        fontFamily:font.PoppinsMedium
        
    },
});

export default EmptyListCustom;
