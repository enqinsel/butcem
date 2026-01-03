import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, Plus, Edit3 } from 'lucide-react-native';
import Calendar from '../components/Calendar';
import StatCard from '../components/StatCard';
import DayDetailModal from '../components/DayDetailModal';
import IncomeModal from '../components/IncomeModal';
import {
    getTotalIncomeByMonth,
    getTotalExpensesByMonth,
    getDailyExpenseTotals,
    getIncomeByMonth
} from '../database/database';

const DashboardScreen = () => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDay, setSelectedDay] = useState(null);
    const [showDayModal, setShowDayModal] = useState(false);
    const [showIncomeModal, setShowIncomeModal] = useState(false);
    const [incomeModalMode, setIncomeModalMode] = useState('add'); // 'add' or 'edit'
    const [existingIncomeId, setExistingIncomeId] = useState(null);
    const [existingIncomeAmount, setExistingIncomeAmount] = useState(0);

    const [totalIncome, setTotalIncome] = useState(0);
    const [totalExpense, setTotalExpense] = useState(0);
    const [dailyTotals, setDailyTotals] = useState({});

    const monthNames = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];

    const loadData = useCallback(async () => {
        try {
            const income = await getTotalIncomeByMonth(currentMonth, currentYear);
            const expense = await getTotalExpensesByMonth(currentMonth, currentYear);
            const daily = await getDailyExpenseTotals(currentMonth, currentYear);
            const incomeRecords = await getIncomeByMonth(currentMonth, currentYear);

            setTotalIncome(income);
            setTotalExpense(expense);
            setDailyTotals(daily);

            // Mevcut gelir kaydını sakla
            if (incomeRecords && incomeRecords.length > 0) {
                setExistingIncomeId(incomeRecords[0].id);
                setExistingIncomeAmount(incomeRecords[0].amount);
            } else {
                setExistingIncomeId(null);
                setExistingIncomeAmount(0);
            }
        } catch (error) {
            // Silent error
        }
    }, [currentMonth, currentYear]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const goToPreviousMonth = () => {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
        setSelectedDay(null);
    };

    const goToNextMonth = () => {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
        setSelectedDay(null);
    };

    const handleDayPress = (day) => {
        setSelectedDay(day);
        setShowDayModal(true);
    };

    const handleAddIncome = () => {
        setIncomeModalMode('add');
        setShowIncomeModal(true);
    };

    const handleEditIncome = () => {
        setIncomeModalMode('edit');
        setShowIncomeModal(true);
    };

    const balance = totalIncome - totalExpense;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f1f5f9' }} edges={['top']}>
            <View style={{ flex: 1, paddingHorizontal: 16 }}>
                {/* Header */}
                <View style={{ paddingTop: 8, marginBottom: 16 }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1e293b' }}>Bütçem</Text>
                    <Text style={{ color: '#64748b', marginTop: 4, fontSize: 13 }}>
                        💡 Harcama eklemek için takvimde bir güne dokunun
                    </Text>
                </View>

                {/* Ay Seçici */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <TouchableOpacity
                        onPress={goToPreviousMonth}
                        style={{ backgroundColor: 'white', padding: 10, borderRadius: 12 }}
                    >
                        <ChevronLeft size={18} color="#64748b" />
                    </TouchableOpacity>

                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1e293b' }}>
                            {monthNames[currentMonth - 1]} {currentYear}
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={goToNextMonth}
                        style={{ backgroundColor: 'white', padding: 10, borderRadius: 12 }}
                    >
                        <ChevronRight size={18} color="#64748b" />
                    </TouchableOpacity>
                </View>

                {/* Stat Kartları */}
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                    <StatCard
                        title="Gelir"
                        amount={totalIncome}
                        type="income"
                        icon={TrendingUp}
                    />
                    <StatCard
                        title="Gider"
                        amount={totalExpense}
                        type="expense"
                        icon={TrendingDown}
                    />
                    <StatCard
                        title="Bakiye"
                        amount={balance}
                        type="balance"
                        icon={Wallet}
                    />
                </View>

                {/* Gelir Butonları */}
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                    <TouchableOpacity
                        onPress={handleAddIncome}
                        style={{
                            flex: 1,
                            backgroundColor: '#10b981',
                            paddingVertical: 10,
                            borderRadius: 12,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 6,
                        }}
                    >
                        <Plus size={16} color="white" />
                        <Text style={{ color: 'white', fontWeight: '600', marginLeft: 6, fontSize: 14 }}>Gelir Ekle</Text>
                    </TouchableOpacity>

                    {totalIncome > 0 && (
                        <TouchableOpacity
                            onPress={handleEditIncome}
                            style={{
                                backgroundColor: '#f59e0b',
                                paddingVertical: 10,
                                paddingHorizontal: 16,
                                borderRadius: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Edit3 size={16} color="white" />
                            <Text style={{ color: 'white', fontWeight: '600', marginLeft: 6, fontSize: 14 }}>Düzenle</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Takvim */}
                <View style={{ flexGrow: 1, flexShrink: 1 }}>
                    <Calendar
                        month={currentMonth}
                        year={currentYear}
                        selectedDay={selectedDay}
                        onDayPress={handleDayPress}
                        dailyTotals={dailyTotals}
                    />

                    {/* by INAFFTECH */}
                    <Text style={{
                        textAlign: 'center',
                        color: '#94a3b8',
                        fontSize: 12,
                        marginTop: 8,
                        opacity: 0.6
                    }}>
                        by INAFFTECH
                    </Text>
                </View>
            </View>

            {/* Day Detail Modal */}
            <DayDetailModal
                visible={showDayModal}
                onClose={() => {
                    setShowDayModal(false);
                    setSelectedDay(null);
                }}
                day={selectedDay}
                month={currentMonth}
                year={currentYear}
                onExpenseAdded={loadData}
            />

            {/* Income Modal */}
            <IncomeModal
                visible={showIncomeModal}
                onClose={() => setShowIncomeModal(false)}
                month={currentMonth}
                year={currentYear}
                onIncomeAdded={loadData}
                mode={incomeModalMode}
                existingId={existingIncomeId}
                existingAmount={existingIncomeAmount}
            />
        </SafeAreaView>
    );
};

export default DashboardScreen;
