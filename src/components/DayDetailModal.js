import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    Dimensions
} from 'react-native';
import { X, Sparkles, Plus, Trash2 } from 'lucide-react-native';
import { suggestCategory } from '../services/geminiService';
import { addExpense, getExpensesByDay, deleteExpense } from '../database/database';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const DayDetailModal = ({ visible, onClose, day, month, year, onExpenseAdded }) => {
    const [expenses, setExpenses] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestingCategory, setSuggestingCategory] = useState(false);

    const monthNames = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];

    useEffect(() => {
        if (visible && day) {
            loadExpenses();
            setShowAddForm(false);
            setCategory('');
            setDescription('');
            setAmount('');
        }
    }, [visible, day]);

    const loadExpenses = async () => {
        try {
            const data = await getExpensesByDay(day, month, year);
            setExpenses(data);
        } catch (error) {
            // Silent error
        }
    };

    const handleSuggestCategory = async () => {
        if (!description.trim()) {
            Alert.alert('Uyarı', 'Lütfen önce açıklama giriniz.');
            return;
        }

        setSuggestingCategory(true);
        try {
            const suggested = await suggestCategory(description);
            if (suggested) {
                setCategory(suggested);
            } else {
                Alert.alert('Hata', 'Kategori önerisi alınamadı.');
            }
        } catch (error) {
            Alert.alert('Hata', 'Kategori önerisi alınamadı. API bağlantısını kontrol edin.');
        } finally {
            setSuggestingCategory(false);
        }
    };

    const handleAddExpense = async () => {
        if (!category.trim() || !description.trim() || !amount.trim()) {
            Alert.alert('Uyarı', 'Lütfen tüm alanları doldurunuz.');
            return;
        }

        const numericAmount = parseFloat(amount.replace(',', '.'));
        if (isNaN(numericAmount) || numericAmount <= 0) {
            Alert.alert('Uyarı', 'Geçerli bir tutar giriniz.');
            return;
        }

        setLoading(true);
        try {
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            await addExpense(category, description, numericAmount, dateStr, day, month, year);

            // Reset form
            setCategory('');
            setDescription('');
            setAmount('');
            setShowAddForm(false);

            // Reload expenses
            await loadExpenses();

            // Notify parent
            if (onExpenseAdded) {
                onExpenseAdded();
            }
        } catch (error) {
            Alert.alert('Hata', 'Harcama eklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteExpense = async (id) => {
        Alert.alert(
            'Silme Onayı',
            'Bu harcamayı silmek istediğinizden emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteExpense(id);
                            await loadExpenses();
                            if (onExpenseAdded) {
                                onExpenseAdded();
                            }
                        } catch (error) {
                            Alert.alert('Hata', 'Harcama silinirken bir hata oluştu.');
                        }
                    },
                },
            ]
        );
    };

    const formatAmount = (value) => {
        return new Intl.NumberFormat('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const totalDayExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
                {/* Header */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 20,
                    paddingTop: 50,
                    backgroundColor: 'white',
                    borderBottomWidth: 1,
                    borderBottomColor: '#e2e8f0'
                }}>
                    <View>
                        <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1e293b' }}>
                            {day} {monthNames[month - 1]} {year}
                        </Text>
                        <Text style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
                            Toplam Harcama: ₺{formatAmount(totalDayExpense)}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={onClose}
                        style={{ backgroundColor: '#f1f5f9', padding: 12, borderRadius: 24 }}
                    >
                        <X size={22} color="#64748b" />
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        style={{ flex: 1, padding: 20 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Harcama listesi */}
                        {expenses.length === 0 && !showAddForm ? (
                            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                                <Text style={{ fontSize: 48, marginBottom: 16 }}>📝</Text>
                                <Text style={{ color: '#94a3b8', fontSize: 16, textAlign: 'center' }}>
                                    Bu güne ait harcama yok
                                </Text>
                                <Text style={{ color: '#cbd5e1', fontSize: 14, marginTop: 4 }}>
                                    Aşağıdaki butona tıklayarak ekleyin
                                </Text>
                            </View>
                        ) : (
                            <>
                                {expenses.length > 0 && (
                                    <Text style={{ color: '#64748b', fontSize: 14, marginBottom: 12, fontWeight: '600' }}>
                                        Harcamalar ({expenses.length})
                                    </Text>
                                )}
                                {expenses.map((expense) => (
                                    <View
                                        key={expense.id}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            backgroundColor: 'white',
                                            borderRadius: 16,
                                            padding: 16,
                                            marginBottom: 12,
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 2 },
                                            shadowOpacity: 0.05,
                                            shadowRadius: 4,
                                            elevation: 2,
                                        }}
                                    >
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: '#1e293b', fontWeight: '600', fontSize: 16 }}>{expense.description}</Text>
                                            <Text style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>{expense.category}</Text>
                                        </View>
                                        <Text style={{ color: '#e11d48', fontWeight: 'bold', fontSize: 16, marginRight: 12 }}>
                                            ₺{formatAmount(expense.amount)}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => handleDeleteExpense(expense.id)}
                                            style={{ padding: 8, backgroundColor: '#fef2f2', borderRadius: 8 }}
                                        >
                                            <Trash2 size={18} color="#f43f5e" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </>
                        )}

                        {/* Harcama ekleme formu */}
                        {showAddForm && (
                            <View style={{
                                backgroundColor: 'white',
                                borderRadius: 20,
                                padding: 20,
                                marginTop: 16,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.05,
                                shadowRadius: 4,
                                elevation: 2,
                            }}>
                                <Text style={{ color: '#6366f1', fontWeight: 'bold', fontSize: 18, marginBottom: 20 }}>
                                    ✨ Yeni Harcama Ekle
                                </Text>

                                {/* Açıklama */}
                                <View style={{ marginBottom: 16 }}>
                                    <Text style={{ color: '#475569', fontSize: 14, marginBottom: 8, fontWeight: '500' }}>Açıklama</Text>
                                    <TextInput
                                        style={{
                                            backgroundColor: '#f8fafc',
                                            borderRadius: 12,
                                            padding: 14,
                                            color: '#1e293b',
                                            fontSize: 16,
                                            borderWidth: 1,
                                            borderColor: '#e2e8f0'
                                        }}
                                        placeholder="Ne aldınız?"
                                        value={description}
                                        onChangeText={setDescription}
                                        placeholderTextColor="#94a3b8"
                                    />
                                </View>

                                {/* Kategori */}
                                <View style={{ marginBottom: 16 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                        <Text style={{ color: '#475569', fontSize: 14, fontWeight: '500' }}>Kategori</Text>
                                        <TouchableOpacity
                                            onPress={handleSuggestCategory}
                                            disabled={suggestingCategory}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                backgroundColor: '#6366f1',
                                                paddingHorizontal: 14,
                                                paddingVertical: 8,
                                                borderRadius: 20
                                            }}
                                        >
                                            {suggestingCategory ? (
                                                <ActivityIndicator size="small" color="white" />
                                            ) : (
                                                <>
                                                    <Sparkles size={16} color="white" />
                                                    <Text style={{ color: 'white', fontSize: 13, marginLeft: 6, fontWeight: '600' }}>AI Öner</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                    <TextInput
                                        style={{
                                            backgroundColor: '#f8fafc',
                                            borderRadius: 12,
                                            padding: 14,
                                            color: '#1e293b',
                                            fontSize: 16,
                                            borderWidth: 1,
                                            borderColor: '#e2e8f0'
                                        }}
                                        placeholder="Kategori"
                                        value={category}
                                        onChangeText={setCategory}
                                        placeholderTextColor="#94a3b8"
                                    />
                                </View>

                                {/* Tutar */}
                                <View style={{ marginBottom: 20 }}>
                                    <Text style={{ color: '#475569', fontSize: 14, marginBottom: 8, fontWeight: '500' }}>Tutar (₺)</Text>
                                    <TextInput
                                        style={{
                                            backgroundColor: '#f8fafc',
                                            borderRadius: 12,
                                            padding: 14,
                                            color: '#1e293b',
                                            fontSize: 16,
                                            borderWidth: 1,
                                            borderColor: '#e2e8f0'
                                        }}
                                        placeholder="0.00"
                                        value={amount}
                                        onChangeText={setAmount}
                                        keyboardType="decimal-pad"
                                        placeholderTextColor="#94a3b8"
                                    />
                                </View>

                                {/* Butonlar */}
                                <View style={{ flexDirection: 'row' }}>
                                    <TouchableOpacity
                                        onPress={() => {
                                            setShowAddForm(false);
                                            setCategory('');
                                            setDescription('');
                                            setAmount('');
                                        }}
                                        style={{ flex: 1, backgroundColor: '#f1f5f9', paddingVertical: 14, borderRadius: 12, marginRight: 8 }}
                                    >
                                        <Text style={{ color: '#64748b', fontWeight: '600', textAlign: 'center', fontSize: 16 }}>İptal</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={handleAddExpense}
                                        disabled={loading}
                                        style={{ flex: 1, backgroundColor: '#6366f1', paddingVertical: 14, borderRadius: 12, marginLeft: 8 }}
                                    >
                                        {loading ? (
                                            <ActivityIndicator size="small" color="white" />
                                        ) : (
                                            <Text style={{ color: 'white', fontWeight: '600', textAlign: 'center', fontSize: 16 }}>Kaydet</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Boşluk */}
                        <View style={{ height: 100 }} />
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Alt buton */}
                {!showAddForm && (
                    <View style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: 20,
                        paddingBottom: 40,
                        backgroundColor: 'white',
                        borderTopWidth: 1,
                        borderTopColor: '#e2e8f0'
                    }}>
                        <TouchableOpacity
                            onPress={() => setShowAddForm(true)}
                            style={{
                                backgroundColor: '#6366f1',
                                paddingVertical: 16,
                                borderRadius: 16,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Plus size={22} color="white" />
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 8 }}>
                                Harcama Ekle
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </Modal>
    );
};

export default DayDetailModal;
