import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    Alert,
    Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight, Sparkles, List, BarChart3, FileText } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CategoryProgress from '../components/CategoryProgress';
import AIReportModal from '../components/AIReportModal';
import {
    getExpensesByMonth,
    getExpensesByCategory,
    getTotalIncomeByMonth,
    getTotalExpensesByMonth
} from '../database/database';
import { generateFinancialAnalysis } from '../services/geminiService';

const AnalysisScreen = () => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('categories');

    const [expenses, setExpenses] = useState([]);
    const [categoryTotals, setCategoryTotals] = useState([]);
    const [totalExpense, setTotalExpense] = useState(0);
    const [totalIncome, setTotalIncome] = useState(0);

    const [showAIReport, setShowAIReport] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [aiReport, setAIReport] = useState('');
    const [aiLoading, setAILoading] = useState(false);
    const [isNewReport, setIsNewReport] = useState(false);

    const monthNames = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];

    const getReportKey = () => `ai_report_${currentMonth}_${currentYear}`;

    // Kayıtlı raporu yükle
    const loadSavedReport = useCallback(async () => {
        try {
            const saved = await AsyncStorage.getItem(getReportKey());
            if (saved) {
                setAIReport(saved);
            } else {
                setAIReport('');
            }
        } catch (error) {
            setAIReport('');
        }
    }, [currentMonth, currentYear]);

    // Raporu kaydet
    const saveReport = async (report) => {
        try {
            await AsyncStorage.setItem(getReportKey(), report);
        } catch (error) {
            // Silent error
        }
    };

    const loadData = useCallback(async () => {
        try {
            const expenseList = await getExpensesByMonth(currentMonth, currentYear);
            const categories = await getExpensesByCategory(currentMonth, currentYear);
            const expenseTotal = await getTotalExpensesByMonth(currentMonth, currentYear);
            const incomeTotal = await getTotalIncomeByMonth(currentMonth, currentYear);

            setExpenses(expenseList);
            setCategoryTotals(categories);
            setTotalExpense(expenseTotal);
            setTotalIncome(incomeTotal);
        } catch (error) {
            // Silent error
        }
    }, [currentMonth, currentYear]);

    useEffect(() => {
        loadData();
        loadSavedReport();
    }, [loadData, loadSavedReport]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        await loadSavedReport();
        setRefreshing(false);
    }, [loadData, loadSavedReport]);

    const goToPreviousMonth = () => {
        if (currentMonth === 1) {
            setCurrentMonth(12);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonth === 12) {
            setCurrentMonth(1);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleAIButtonPress = () => {
        if (expenses.length === 0) {
            Alert.alert('Uyarı', 'Analiz için en az bir harcama kaydı gerekli.');
            return;
        }

        // Mevcut rapor varsa onay modalı göster
        if (aiReport) {
            setShowConfirmModal(true);
        } else {
            // Rapor yoksa direkt analiz yap
            generateNewAnalysis();
        }
    };

    const generateNewAnalysis = async () => {
        setShowConfirmModal(false);
        setShowAIReport(true);
        setAILoading(true);
        setIsNewReport(true);

        try {
            const report = await generateFinancialAnalysis(expenses, totalIncome, totalExpense);
            setAIReport(report);
            await saveReport(report);
        } catch (error) {
            Alert.alert('Hata', error.message || 'AI analizi yapılırken bir hata oluştu.');
            if (!aiReport) {
                setShowAIReport(false);
            }
        } finally {
            setAILoading(false);
        }
    };

    const viewExistingReport = () => {
        setShowConfirmModal(false);
        setShowAIReport(true);
        setIsNewReport(false);
    };

    const formatAmount = (value) => {
        return new Intl.NumberFormat('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const formatDate = (dateStr) => {
        const parts = dateStr.split('-');
        return `${parts[2]}/${parts[1]}`;
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f1f5f9' }} edges={['top']}>
            <ScrollView
                style={{ flex: 1 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1e293b' }}>Analiz</Text>
                    <Text style={{ color: '#64748b', marginTop: 4 }}>Harcamalarınızı inceleyin</Text>
                </View>

                {/* Ay Seçici */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 }}>
                    <TouchableOpacity
                        onPress={goToPreviousMonth}
                        style={{ backgroundColor: 'white', padding: 12, borderRadius: 12 }}
                    >
                        <ChevronLeft size={20} color="#64748b" />
                    </TouchableOpacity>

                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1e293b' }}>
                            {monthNames[currentMonth - 1]}
                        </Text>
                        <Text style={{ color: '#64748b', fontSize: 14 }}>{currentYear}</Text>
                    </View>

                    <TouchableOpacity
                        onPress={goToNextMonth}
                        style={{ backgroundColor: 'white', padding: 12, borderRadius: 12 }}
                    >
                        <ChevronRight size={20} color="#64748b" />
                    </TouchableOpacity>
                </View>

                {/* AI Analiz Butonu */}
                <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
                    <TouchableOpacity
                        onPress={handleAIButtonPress}
                        style={{
                            backgroundColor: '#6366f1',
                            paddingVertical: 16,
                            paddingHorizontal: 16,
                            borderRadius: 16,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Sparkles size={20} color="white" />
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 8 }}>
                            🤖 AI Finans Danışmanı
                        </Text>
                        {aiReport && (
                            <View style={{
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                paddingHorizontal: 8,
                                paddingVertical: 4,
                                borderRadius: 8,
                                marginLeft: 8
                            }}>
                                <Text style={{ color: 'white', fontSize: 10, fontWeight: '600' }}>RAPOR VAR</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Özet Kartları */}
                <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16 }}>
                    <View style={{ flex: 1, backgroundColor: '#fef2f2', borderRadius: 16, padding: 16, marginRight: 8 }}>
                        <Text style={{ color: '#dc2626', fontSize: 12, fontWeight: '500' }}>Toplam Harcama</Text>
                        <Text style={{ color: '#b91c1c', fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>
                            ₺{formatAmount(totalExpense)}
                        </Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#eef2ff', borderRadius: 16, padding: 16, marginLeft: 8 }}>
                        <Text style={{ color: '#4f46e5', fontSize: 12, fontWeight: '500' }}>İşlem Sayısı</Text>
                        <Text style={{ color: '#3730a3', fontSize: 20, fontWeight: 'bold', marginTop: 4 }}>
                            {expenses.length}
                        </Text>
                    </View>
                </View>

                {/* Tab Butonları */}
                <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16 }}>
                    <TouchableOpacity
                        onPress={() => setActiveTab('categories')}
                        style={{
                            flex: 1,
                            paddingVertical: 12,
                            borderRadius: 12,
                            marginRight: 8,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: activeTab === 'categories' ? '#6366f1' : 'white'
                        }}
                    >
                        <BarChart3 size={18} color={activeTab === 'categories' ? 'white' : '#64748b'} />
                        <Text style={{
                            marginLeft: 8,
                            fontWeight: '600',
                            color: activeTab === 'categories' ? 'white' : '#475569'
                        }}>
                            Kategoriler
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('list')}
                        style={{
                            flex: 1,
                            paddingVertical: 12,
                            borderRadius: 12,
                            marginLeft: 8,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: activeTab === 'list' ? '#6366f1' : 'white'
                        }}
                    >
                        <List size={18} color={activeTab === 'list' ? 'white' : '#64748b'} />
                        <Text style={{
                            marginLeft: 8,
                            fontWeight: '600',
                            color: activeTab === 'list' ? 'white' : '#475569'
                        }}>
                            Liste
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* İçerik */}
                <View style={{ paddingHorizontal: 20, paddingBottom: 100 }}>
                    {activeTab === 'categories' ? (
                        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16 }}>
                            {categoryTotals.length === 0 ? (
                                <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                                    <Text style={{ color: '#94a3b8' }}>Bu ay harcama yok</Text>
                                </View>
                            ) : (
                                categoryTotals.map((item, index) => (
                                    <CategoryProgress
                                        key={index}
                                        category={item.category}
                                        amount={item.total}
                                        total={totalExpense}
                                    />
                                ))
                            )}
                        </View>
                    ) : (
                        <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16 }}>
                            {expenses.length === 0 ? (
                                <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                                    <Text style={{ color: '#94a3b8' }}>Bu ay harcama yok</Text>
                                </View>
                            ) : (
                                expenses.map((expense) => (
                                    <View
                                        key={expense.id}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            borderBottomWidth: 1,
                                            borderBottomColor: '#f1f5f9',
                                            paddingVertical: 12
                                        }}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: '#1e293b', fontWeight: '500' }}>
                                                {expense.description}
                                            </Text>
                                            <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>
                                                {expense.category} • {formatDate(expense.date)}
                                            </Text>
                                        </View>
                                        <Text style={{ color: '#dc2626', fontWeight: 'bold' }}>
                                            ₺{formatAmount(expense.amount)}
                                        </Text>
                                    </View>
                                ))
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Mevcut Rapor Onay Modalı */}
            <Modal
                visible={showConfirmModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowConfirmModal(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 24, width: '100%', maxWidth: 340 }}>
                        <View style={{ alignItems: 'center', marginBottom: 16 }}>
                            <Text style={{ fontSize: 40, marginBottom: 8 }}>📊</Text>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1e293b', textAlign: 'center' }}>
                                Mevcut Raporunuz Var
                            </Text>
                            <Text style={{ color: '#64748b', textAlign: 'center', marginTop: 8 }}>
                                Bu ay için daha önce bir analiz raporu oluşturdunuz. Ne yapmak istersiniz?
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={viewExistingReport}
                            style={{
                                backgroundColor: '#6366f1',
                                paddingVertical: 14,
                                borderRadius: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 12
                            }}
                        >
                            <FileText size={18} color="white" />
                            <Text style={{ color: 'white', fontWeight: '600', marginLeft: 8 }}>Raporu Görüntüle</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={generateNewAnalysis}
                            style={{
                                backgroundColor: '#f1f5f9',
                                paddingVertical: 14,
                                borderRadius: 12,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 12
                            }}
                        >
                            <Sparkles size={18} color="#6366f1" />
                            <Text style={{ color: '#6366f1', fontWeight: '600', marginLeft: 8 }}>Yeniden Analiz Et</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setShowConfirmModal(false)}
                            style={{ paddingVertical: 12 }}
                        >
                            <Text style={{ color: '#94a3b8', textAlign: 'center', fontWeight: '500' }}>İptal</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* AI Report Modal */}
            <AIReportModal
                visible={showAIReport}
                onClose={() => setShowAIReport(false)}
                report={aiReport}
                loading={aiLoading}
                onRegenerate={generateNewAnalysis}
                isNewReport={isNewReport}
            />
        </SafeAreaView>
    );
};

export default AnalysisScreen;
