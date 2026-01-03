import { GoogleGenAI } from "@google/genai";
import Constants from 'expo-constants';

// API Key - app.json extra'dan okunuyor
const apiKey = Constants.expoConfig?.extra?.GEMINI_API_KEY || "";

// Google Gen AI client'ını başlat
const ai = new GoogleGenAI({ apiKey });

// Açıklamaya göre kategori önerisi
export const suggestCategory = async (description) => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `"${description}" açıklaması için en uygun harcama kategorisini tek bir kelime olarak öner. Kategori seçenekleri: Yiyecek & İçecek, Ulaşım, Alışveriş, Faturalar, Sağlık, Eğlence, Eğitim, Giyim, Ev & Yaşam, Diğer. Sadece kategoriyi yaz, başka bir şey yazma.`,
        });

        return response.text ? response.text.trim() : "";
    } catch (error) {
        throw new Error("Kategori önerisi alınamadı: " + (error.message || "Bilinmeyen hata"));
    }
};

// Aylık finansal analiz raporu
export const generateFinancialAnalysis = async (expenses, totalIncome, totalExpense) => {
    const categoryTotals = {};
    expenses.forEach(exp => {
        if (!categoryTotals[exp.category]) {
            categoryTotals[exp.category] = 0;
        }
        categoryTotals[exp.category] += exp.amount;
    });

    const categoryBreakdown = Object.entries(categoryTotals)
        .map(([cat, amount]) => `${cat}: ${amount.toFixed(2)} TL`)
        .join('\n');

    const balance = totalIncome - totalExpense;

    const prompt = `Sen profesyonel bir kişisel finans danışmanısın.

Gelirim: ${totalIncome.toFixed(2)} TL
Toplam Harcamam: ${totalExpense.toFixed(2)} TL
Kalan Bakiye: ${balance.toFixed(2)} TL

Kategori Bazlı Harcamalar:
${categoryBreakdown || "Henüz harcama yok"}

Toplam Harcama Sayısı: ${expenses.length}

Lütfen bu verileri analiz et:
1. 📊 GENEL DEĞERLENDİRME - Gelir-gider dengesini değerlendir
2. 💡 TASARRUF İPUÇLARI - En az 3 öneri ver
3. ⚠️ DİKKAT EDİLMESİ GEREKENLER - Harcama alışkanlığı eleştirisi
4. 📈 AY SONU TAHMİNİ - Bu hız devam ederse ay sonunda ne olur

Cevabı samimi, anlaşılır ve motive edici olarak Türkçe ver.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text || "Analiz oluşturulamadı.";
    } catch (error) {
        throw new Error("Analiz oluşturulamadı: " + (error.message || "Bilinmeyen hata"));
    }
};

export default {
    suggestCategory,
    generateFinancialAnalysis,
};
