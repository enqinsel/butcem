import React from 'react';
import { View, Text } from 'react-native';

const StatCard = ({ title, amount, type = 'neutral', icon: Icon }) => {
    const getColors = () => {
        switch (type) {
            case 'income':
                return {
                    iconBg: '#d1fae5',
                    iconColor: '#059669',
                    textColor: '#059669',
                    amountColor: '#047857',
                };
            case 'expense':
                return {
                    iconBg: '#ffe4e6',
                    iconColor: '#e11d48',
                    textColor: '#e11d48',
                    amountColor: '#be123c',
                };
            case 'balance':
                return {
                    iconBg: '#e0e7ff',
                    iconColor: '#4f46e5',
                    textColor: '#4f46e5',
                    amountColor: '#3730a3',
                };
            default:
                return {
                    iconBg: '#f1f5f9',
                    iconColor: '#64748b',
                    textColor: '#64748b',
                    amountColor: '#475569',
                };
        }
    };

    const colors = getColors();

    // Sadece tam sayı göster, K M yok
    const formatAmount = (value) => {
        return Math.round(value).toLocaleString('tr-TR');
    };

    const getBgColor = () => {
        switch (type) {
            case 'income': return '#ecfdf5';
            case 'expense': return '#fef2f2';
            case 'balance': return '#eef2ff';
            default: return '#f8fafc';
        }
    };

    return (
        <View style={{
            flex: 1,
            backgroundColor: getBgColor(),
            borderRadius: 14,
            padding: 10,
            marginHorizontal: 3
        }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <View style={{
                    backgroundColor: colors.iconBg,
                    padding: 6,
                    borderRadius: 8,
                    marginRight: 6
                }}>
                    {Icon && <Icon size={14} color={colors.iconColor} />}
                </View>
                <Text style={{ color: colors.textColor, fontSize: 11, fontWeight: '500' }}>{title}</Text>
            </View>
            <Text style={{
                color: colors.amountColor,
                fontSize: 14,
                fontWeight: 'bold'
            }}>
                ₺{formatAmount(amount)}
            </Text>
        </View>
    );
};

export default StatCard;
