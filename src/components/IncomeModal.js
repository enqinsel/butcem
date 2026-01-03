import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert
} from 'react-native';
import { X, Plus, Check, Trash2 } from 'lucide-react-native';
import { addIncome, updateIncome, deleteIncome } from '../database/database';

const IncomeModal = ({
    visible,
    onClose,
    month,
    year,
    onIncomeAdded,
    mode = 'add',
    existingId = null,
    existingAmount = 0
}) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const monthNames = [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];

    useEffect(() => {
        if (visible) {
            if (mode === 'edit' && existingAmount > 0) {
                setAmount(existingAmount.toString());
            } else {
                setAmount('');
            }
        }
    }, [visible, mode, existingAmount]);

    const handleSave = async () => {
        const trimmedAmount = amount.trim() || '0';
        const numericAmount = parseFloat(trimmedAmount.replace(',', '.'));

        if (isNaN(numericAmount) || numericAmount < 0) {
            Alert.alert('Uyarı', 'Geçerli bir tutar giriniz.');
            return;
        }

        setLoading(true);
        try {
            if (mode === 'edit' && existingId) {
                await updateIncome(existingId, numericAmount);
            } else {
                await addIncome(numericAmount, month, year);
            }
            setAmount('');
            onClose();
            if (onIncomeAdded) {
                onIncomeAdded();
            }
        } catch (error) {
            Alert.alert('Hata', 'İşlem sırasında bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            'Geliri Sil',
            'Bu geliri silmek istediğinizden emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Sil',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            if (existingId) {
                                await deleteIncome(existingId);
                            }
                            setAmount('');
                            onClose();
                            if (onIncomeAdded) {
                                onIncomeAdded();
                            }
                        } catch (error) {
                            Alert.alert('Hata', 'Silme işlemi başarısız oldu.');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
                >
                    {/* Header */}
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: 20,
                        borderBottomWidth: 1,
                        borderBottomColor: '#f1f5f9'
                    }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1e293b' }}>
                            {mode === 'edit' ? 'Geliri Düzenle' : 'Gelir Ekle'} - {monthNames[month - 1]} {year}
                        </Text>
                        <TouchableOpacity
                            onPress={onClose}
                            style={{ backgroundColor: '#f1f5f9', padding: 8, borderRadius: 20 }}
                        >
                            <X size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <View style={{ padding: 20 }}>
                        {/* Tutar */}
                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ color: '#64748b', fontSize: 14, marginBottom: 8 }}>Gelir Tutarı (₺)</Text>
                            <TextInput
                                style={{
                                    backgroundColor: '#f8fafc',
                                    borderRadius: 12,
                                    padding: 16,
                                    fontSize: 18,
                                    color: '#1e293b',
                                    borderWidth: 1,
                                    borderColor: '#e2e8f0'
                                }}
                                placeholder="0"
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="decimal-pad"
                                placeholderTextColor="#94a3b8"
                                autoFocus
                            />
                        </View>

                        {/* Butonlar */}
                        <View style={{ flexDirection: 'row' }}>
                            {mode === 'edit' && (
                                <TouchableOpacity
                                    onPress={handleDelete}
                                    disabled={loading}
                                    style={{
                                        backgroundColor: '#fef2f2',
                                        paddingVertical: 14,
                                        paddingHorizontal: 16,
                                        borderRadius: 12,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 8,
                                    }}
                                >
                                    <Trash2 size={18} color="#dc2626" />
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                onPress={handleSave}
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    backgroundColor: mode === 'edit' ? '#f59e0b' : '#10b981',
                                    paddingVertical: 14,
                                    borderRadius: 12,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <>
                                        {mode === 'edit' ? (
                                            <Check size={18} color="white" />
                                        ) : (
                                            <Plus size={18} color="white" />
                                        )}
                                        <Text style={{ color: 'white', fontWeight: '600', fontSize: 16, marginLeft: 8 }}>
                                            {mode === 'edit' ? 'Kaydet' : 'Gelir Ekle'}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

export default IncomeModal;
