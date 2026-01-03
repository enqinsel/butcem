import React from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { X, Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

const AIReportModal = ({ visible, onClose, report, loading, onRegenerate, isNewReport = false }) => {

    const handleCopyReport = async () => {
        if (report) {
            await Clipboard.setStringAsync(report);
            // Sessizce kopyala, modal gösterme
        }
    };

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
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 24, marginRight: 8 }}>🤖</Text>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1e293b' }}>
                            AI Finans Raporu
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={onClose}
                        style={{ backgroundColor: '#f1f5f9', padding: 12, borderRadius: 24 }}
                    >
                        <X size={22} color="#64748b" />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={{ flex: 1, padding: 20 }}
                    showsVerticalScrollIndicator={false}
                >
                    {loading ? (
                        <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                            <ActivityIndicator size="large" color="#6366f1" />
                            <Text style={{ color: '#64748b', marginTop: 16, textAlign: 'center', fontSize: 16 }}>
                                AI analiz yapıyor...{'\n'}Bu işlem birkaç saniye sürebilir.
                            </Text>
                        </View>
                    ) : report ? (
                        <View style={{
                            backgroundColor: 'white',
                            borderRadius: 20,
                            padding: 20,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 4,
                            elevation: 2,
                        }}>
                            <Text style={{
                                color: '#1e293b',
                                fontSize: 16,
                                lineHeight: 26,
                            }}>
                                {report}
                            </Text>
                        </View>
                    ) : (
                        <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                            <Text style={{ color: '#94a3b8', textAlign: 'center', fontSize: 16 }}>
                                Henüz rapor oluşturulmadı.
                            </Text>
                        </View>
                    )}

                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Alt butonlar - sadece rapor varsa ve loading değilse */}
                {report && !loading && (
                    <View style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: 20,
                        paddingBottom: 40,
                        backgroundColor: 'white',
                        borderTopWidth: 1,
                        borderTopColor: '#e2e8f0',
                        flexDirection: 'row',
                    }}>
                        {/* İlk rapor ise sadece kopyala butonu */}
                        {isNewReport ? (
                            <TouchableOpacity
                                onPress={handleCopyReport}
                                style={{
                                    flex: 1,
                                    backgroundColor: '#6366f1',
                                    paddingVertical: 14,
                                    borderRadius: 12,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Copy size={18} color="white" />
                                <Text style={{ color: 'white', fontWeight: '600', marginLeft: 8 }}>Raporu Kopyala</Text>
                            </TouchableOpacity>
                        ) : (
                            <>
                                <TouchableOpacity
                                    onPress={handleCopyReport}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#f1f5f9',
                                        paddingVertical: 14,
                                        borderRadius: 12,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: 8,
                                    }}
                                >
                                    <Copy size={18} color="#64748b" />
                                    <Text style={{ color: '#64748b', fontWeight: '600', marginLeft: 8 }}>Kopyala</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={onRegenerate}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#6366f1',
                                        paddingVertical: 14,
                                        borderRadius: 12,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginLeft: 8,
                                    }}
                                >
                                    <Text style={{ color: 'white', fontWeight: '600' }}>Yeniden Analiz</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                )}
            </View>
        </Modal>
    );
};

export default AIReportModal;
