import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

const DAYS_OF_WEEK = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

const Calendar = ({ month, year, selectedDay, onDayPress, dailyTotals = {} }) => {
    // Ayın ilk gününün haftanın hangi gününe denk geldiğini bul
    const calendarData = useMemo(() => {
        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);
        const daysInMonth = lastDay.getDate();

        // Pazartesi = 0, Pazar = 6
        let startDayOfWeek = firstDay.getDay() - 1;
        if (startDayOfWeek < 0) startDayOfWeek = 6;

        const days = [];

        // Önceki ayın günleri (boş)
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push({ day: null, type: 'empty' });
        }

        // Bu ayın günleri
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, type: 'current' });
        }

        // Kalan hücreleri doldur
        const remainingCells = 42 - days.length; // 6 hafta x 7 gün = 42
        for (let i = 0; i < remainingCells; i++) {
            days.push({ day: null, type: 'empty' });
        }

        return days;
    }, [month, year]);

    const today = new Date();
    const isCurrentMonth = today.getMonth() + 1 === month && today.getFullYear() === year;
    const todayDate = today.getDate();

    const formatAmount = (amount) => {
        return Math.round(amount);
    };

    return (
        <View className="bg-white rounded-2xl p-4 shadow-sm">
            {/* Hafta günleri başlıkları */}
            <View className="flex-row mb-2">
                {DAYS_OF_WEEK.map((day, index) => (
                    <View key={index} className="flex-1 items-center py-2">
                        <Text className="text-slate-500 text-xs font-medium">{day}</Text>
                    </View>
                ))}
            </View>

            {/* Takvim günleri */}
            <View className="flex-row flex-wrap">
                {calendarData.map((item, index) => {
                    const isToday = isCurrentMonth && item.day === todayDate;
                    const isSelected = item.day === selectedDay;
                    const hasExpense = dailyTotals[item.day] > 0;

                    if (item.type === 'empty') {
                        return (
                            <View key={index} className="w-[14.28%] aspect-square p-0.5">
                                <View className="flex-1" />
                            </View>
                        );
                    }

                    return (
                        <View key={index} className="w-[14.28%] aspect-square p-0.5">
                            <TouchableOpacity
                                onPress={() => onDayPress(item.day)}
                                className={`flex-1 rounded-xl items-center justify-center ${isSelected
                                    ? 'bg-indigo-500'
                                    : isToday
                                        ? 'bg-indigo-100 border-2 border-indigo-500'
                                        : 'bg-slate-50'
                                    }`}
                            >
                                <Text
                                    className={`text-sm font-semibold ${isSelected
                                        ? 'text-white'
                                        : isToday
                                            ? 'text-indigo-600'
                                            : 'text-slate-700'
                                        }`}
                                >
                                    {item.day}
                                </Text>

                                {/* Harcama etiketi */}
                                {hasExpense && (
                                    <View className={`mt-0.5 px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-white/30' : 'bg-rose-100'
                                        }`}>
                                        <Text className={`text-[9px] font-medium ${isSelected ? 'text-white' : 'text-rose-600'
                                            }`}>
                                            {formatAmount(dailyTotals[item.day])}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

export default Calendar;
