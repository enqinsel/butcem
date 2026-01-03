import * as SQLite from 'expo-sqlite';

let db = null;

// Veritabanını aç veya oluştur
export const initDatabase = async () => {
    try {
        db = await SQLite.openDatabaseAsync('butcem.db');

        // Income tablosu
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS income (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL
      );
    `);

        // Expenses tablosu
        await db.execAsync(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        day INTEGER NOT NULL,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL
      );
    `);

        console.log('Database initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing database:', error);
        return false;
    }
};

// ============ INCOME FUNCTIONS ============

// Gelir ekle
export const addIncome = async (amount, month, year) => {
    try {
        const result = await db.runAsync(
            'INSERT INTO income (amount, month, year) VALUES (?, ?, ?)',
            [amount, month, year]
        );
        return result.lastInsertRowId;
    } catch (error) {
        console.error('Error adding income:', error);
        throw error;
    }
};

// Belirli ay/yıl için gelir getir
export const getIncomeByMonth = async (month, year) => {
    try {
        const result = await db.getAllAsync(
            'SELECT * FROM income WHERE month = ? AND year = ?',
            [month, year]
        );
        return result;
    } catch (error) {
        console.error('Error getting income:', error);
        throw error;
    }
};

// Aylık toplam gelir
export const getTotalIncomeByMonth = async (month, year) => {
    try {
        const result = await db.getFirstAsync(
            'SELECT SUM(amount) as total FROM income WHERE month = ? AND year = ?',
            [month, year]
        );
        return result?.total || 0;
    } catch (error) {
        console.error('Error getting total income:', error);
        throw error;
    }
};

// Gelir güncelle
export const updateIncome = async (id, amount) => {
    try {
        await db.runAsync(
            'UPDATE income SET amount = ? WHERE id = ?',
            [amount, id]
        );
        return true;
    } catch (error) {
        console.error('Error updating income:', error);
        throw error;
    }
};

// Gelir sil
export const deleteIncome = async (id) => {
    try {
        await db.runAsync('DELETE FROM income WHERE id = ?', [id]);
        return true;
    } catch (error) {
        console.error('Error deleting income:', error);
        throw error;
    }
};

// ============ EXPENSE FUNCTIONS ============

// Harcama ekle
export const addExpense = async (category, description, amount, date, day, month, year) => {
    try {
        const result = await db.runAsync(
            'INSERT INTO expenses (category, description, amount, date, day, month, year) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [category, description, amount, date, day, month, year]
        );
        return result.lastInsertRowId;
    } catch (error) {
        console.error('Error adding expense:', error);
        throw error;
    }
};

// Belirli güne ait harcamaları getir
export const getExpensesByDay = async (day, month, year) => {
    try {
        const result = await db.getAllAsync(
            'SELECT * FROM expenses WHERE day = ? AND month = ? AND year = ? ORDER BY id DESC',
            [day, month, year]
        );
        return result;
    } catch (error) {
        console.error('Error getting expenses by day:', error);
        throw error;
    }
};

// Belirli ay için harcamaları getir
export const getExpensesByMonth = async (month, year) => {
    try {
        const result = await db.getAllAsync(
            'SELECT * FROM expenses WHERE month = ? AND year = ? ORDER BY day DESC, id DESC',
            [month, year]
        );
        return result;
    } catch (error) {
        console.error('Error getting expenses by month:', error);
        throw error;
    }
};

// Aylık toplam harcama
export const getTotalExpensesByMonth = async (month, year) => {
    try {
        const result = await db.getFirstAsync(
            'SELECT SUM(amount) as total FROM expenses WHERE month = ? AND year = ?',
            [month, year]
        );
        return result?.total || 0;
    } catch (error) {
        console.error('Error getting total expenses:', error);
        throw error;
    }
};

// Kategori bazlı harcama toplamları
export const getExpensesByCategory = async (month, year) => {
    try {
        const result = await db.getAllAsync(
            'SELECT category, SUM(amount) as total FROM expenses WHERE month = ? AND year = ? GROUP BY category ORDER BY total DESC',
            [month, year]
        );
        return result;
    } catch (error) {
        console.error('Error getting expenses by category:', error);
        throw error;
    }
};

// Günlük harcama toplamları (takvim için)
export const getDailyExpenseTotals = async (month, year) => {
    try {
        const result = await db.getAllAsync(
            'SELECT day, SUM(amount) as total FROM expenses WHERE month = ? AND year = ? GROUP BY day',
            [month, year]
        );
        // Convert to object for easy lookup
        const totals = {};
        result.forEach(item => {
            totals[item.day] = item.total;
        });
        return totals;
    } catch (error) {
        console.error('Error getting daily expense totals:', error);
        throw error;
    }
};

// Harcama güncelle
export const updateExpense = async (id, category, description, amount) => {
    try {
        await db.runAsync(
            'UPDATE expenses SET category = ?, description = ?, amount = ? WHERE id = ?',
            [category, description, amount, id]
        );
        return true;
    } catch (error) {
        console.error('Error updating expense:', error);
        throw error;
    }
};

// Harcama sil
export const deleteExpense = async (id) => {
    try {
        await db.runAsync('DELETE FROM expenses WHERE id = ?', [id]);
        return true;
    } catch (error) {
        console.error('Error deleting expense:', error);
        throw error;
    }
};
