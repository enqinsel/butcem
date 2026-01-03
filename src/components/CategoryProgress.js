import React from 'react';
import { View, Text } from 'react-native';

const CategoryProgress = ({ category, amount, total, color }) => {
    const percentage = total > 0 ? (amount / total) * 100 : 0;

    const formatAmount = (value) => {
        return new Intl.NumberFormat('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const getCategoryColor = (cat) => {
        const colors = {
            'Yiyecek & İçecek': { bg: 'bg-orange-500', light: 'bg-orange-100' },
            'Ulaşım': { bg: 'bg-blue-500', light: 'bg-blue-100' },
            'Alışveriş': { bg: 'bg-pink-500', light: 'bg-pink-100' },
            'Faturalar': { bg: 'bg-yellow-500', light: 'bg-yellow-100' },
            'Sağlık': { bg: 'bg-red-500', light: 'bg-red-100' },
            'Eğlence': { bg: 'bg-purple-500', light: 'bg-purple-100' },
            'Eğitim': { bg: 'bg-cyan-500', light: 'bg-cyan-100' },
            'Giyim': { bg: 'bg-teal-500', light: 'bg-teal-100' },
            'Ev & Yaşam': { bg: 'bg-emerald-500', light: 'bg-emerald-100' },
            'Diğer': { bg: 'bg-slate-500', light: 'bg-slate-100' },
        };
        return colors[cat] || { bg: 'bg-indigo-500', light: 'bg-indigo-100' };
    };

    const categoryColor = color || getCategoryColor(category);

    return (
        <View className="mb-4">
            <View className="flex-row justify-between items-center mb-2">
                <Text className="text-slate-700 font-medium text-sm">{category}</Text>
                <Text className="text-slate-500 text-xs">
                    ₺{formatAmount(amount)} ({percentage.toFixed(1)}%)
                </Text>
            </View>
            <View className={`h-3 ${categoryColor.light} rounded-full overflow-hidden`}>
                <View
                    className={`h-full ${categoryColor.bg} rounded-full`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                />
            </View>
        </View>
    );
};

export default CategoryProgress;
