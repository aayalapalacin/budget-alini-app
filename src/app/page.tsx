"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PurchaseInput from "../components/PurchaseInput";
import { firestore } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

interface Expense {
  id?: string;
  name: string;
  amount: number;
  category: string;
  timestamp?: Date;
  isEditing?: boolean;
}

function formatDateForInput(date?: Date): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date?: Date): string {
  return date ? date.toLocaleDateString() : "No date";
}

export default function Home() {
  const [income, setIncome] = useState({ alex: 0, lina: 0 });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showBudgetOverview, setShowBudgetOverview] = useState(false);
  const [selectedPurchaseCategory, setSelectedPurchaseCategory] = useState("all purchase");
  const editablePersonCategories = ["alex purchase", "lina purchase"];
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [tempEditedExpense, setTempEditedExpense] = useState<Partial<Expense> | null>(null);

  useEffect(() => {
    const fetchAppData = async () => {
      const usersCollection = collection(firestore, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      let alexIncome = 0, linaIncome = 0;

      usersSnapshot.forEach(doc => {
        const user = doc.data();
        if (user.name === "Alex") alexIncome = user.income ?? 0;
        else if (user.name === "Lina") linaIncome = user.income ?? 0;
      });

      setIncome({ alex: alexIncome, lina: linaIncome });

      const expensesCollection = collection(firestore, 'expenses');
      const expensesSnapshot = await getDocs(expensesCollection);
      const list = expensesSnapshot.docs.map(doc => {
        const data = doc.data();
        const timestamp = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : undefined;
        return { id: doc.id, name: data.name, amount: data.amount, category: data.category, timestamp };
      });

      list.sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
      setExpenses(list);
    };

    fetchAppData();
  }, []);

  const totalIncome = income.alex + income.lina;
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const remainingBalance = totalIncome - totalExpenses;

  const handleExpenseAdded = async (
    name: string,
    amount: number,
    category: string,
    date?: Date
  ) => {
    const expensesCollection = collection(firestore, "expenses");
  
    await addDoc(expensesCollection, {
      name,
      amount,
      category,
      timestamp: date ? Timestamp.fromDate(date) : serverTimestamp(),
    });
  
    const snapshot = await getDocs(expensesCollection);
    const updatedList = snapshot.docs.map(doc => {
      const data = doc.data();
      const timestamp = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : undefined;
      return { id: doc.id, name: data.name, amount: data.amount, category: data.category, timestamp };
    });
  
    updatedList.sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
    setExpenses(updatedList);
  };
  

  const purchaseCategories = ['alex', 'lina', 'home', 'joaquin', 'gasoline', 'groceries', 'all'];
  const purchaseCategoriesFiltered = purchaseCategories.map(cat => `${cat} purchase`);
  const purchaseExpenses = expenses.filter(exp => exp.category.toLowerCase().includes('purchase'));
  const filteredExpenses = selectedPurchaseCategory === "all purchase"
    ? purchaseExpenses
    : purchaseExpenses.filter(exp => exp.category === selectedPurchaseCategory);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPurchaseCategory(e.target.value);
  };

  const handleDeletePurchase = async (id: string) => {
    await deleteDoc(doc(firestore, "expenses", id));
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const handleStartEditPurchase = (expense: Expense) => {
    setEditingExpenseId(expense.id!);
    setTempEditedExpense({ ...expense });
  };

  const handleCancelEdit = () => {
    setEditingExpenseId(null);
    setTempEditedExpense(null);
  };

  const handleEditedValueChange = (field: keyof (Expense & { timestamp?: Date }), value: any) => {
    setTempEditedExpense(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: field === 'timestamp' ? new Date(value) : value,
      };
    });
  };

  const handleSavePurchase = async (id: string) => {
    if (!id || !tempEditedExpense) return;
    await updateDoc(doc(firestore, "expenses", id), {
      name: tempEditedExpense.name,
      amount: tempEditedExpense.amount,
      category: tempEditedExpense.category,
      timestamp: tempEditedExpense.timestamp ? Timestamp.fromDate(tempEditedExpense.timestamp) : serverTimestamp(),
    });

    setExpenses(expenses.map(exp => exp.id === id ? { ...exp, ...tempEditedExpense, isEditing: false } : exp));
    setEditingExpenseId(null);
    setTempEditedExpense(null);
  };

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen text-gray-900 bg-white shadow-xl rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Budget Overview</h1>

      <div className="mb-4 flex items-center justify-between">
        <label htmlFor="toggle" className="text-lg font-semibold">
          Show Budget Overview
        </label>
        <input
          type="checkbox"
          id="toggle"
          checked={showBudgetOverview}
          onChange={() => setShowBudgetOverview(!showBudgetOverview)}
        />
      </div>

      {showBudgetOverview && (
        <div>
          <div className="mb-4 p-4 border border-gray-300 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">Total Income</h2>
            <p className="text-green-600 font-bold">${totalIncome}</p>
          </div>
          <div className="mb-4 p-4 border border-gray-300 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">Total Expenses</h2>
            <p className="text-red-600 font-bold">${totalExpenses}</p>
          </div>
          <div className="p-4 border border-gray-300 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">Remaining Balance</h2>
            <p className={`font-bold ${remainingBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${remainingBalance}
            </p>
          </div>
        </div>
      )}

      <PurchaseInput totalIncome={totalIncome} totalExpenses={totalExpenses} onPurchaseAdded={handleExpenseAdded} />

      <label htmlFor="category" className="block text-sm font-bold mt-4">
        Filter By Category:
      </label>
      <select
        id="category"
        className="w-full p-2 border rounded"
        value={selectedPurchaseCategory}
        onChange={handleCategoryChange}
      >
        {purchaseCategoriesFiltered.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      <ul>
        {filteredExpenses.map(expense => (
          <li key={expense.id} className="p-4 border-b">
            {editingExpenseId === expense.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={tempEditedExpense?.name || ""}
                  onChange={e => handleEditedValueChange('name', e.target.value)}
                  className="w-full p-2 border"
                />
                <input
                  type="number"
                  value={tempEditedExpense?.amount || 0}
                  onChange={e => handleEditedValueChange('amount', parseFloat(e.target.value))}
                  className="w-full p-2 border"
                />
                <select
                  value={tempEditedExpense?.category || ""}
                  onChange={e => handleEditedValueChange('category', e.target.value)}
                  className="w-full p-2 border"
                >
                  {editablePersonCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <input
                  type="date"
                  value={formatDateForInput(tempEditedExpense?.timestamp)}
                  onChange={e => handleEditedValueChange('timestamp', e.target.value)}
                  className="w-full p-2 border"
                />
                <div className="flex justify-end space-x-2">
                  <button onClick={() => handleSavePurchase(expense.id!)} className="bg-green-500 text-white px-3 py-1 rounded">Save</button>
                  <button onClick={handleCancelEdit} className="bg-gray-300 px-3 py-1 rounded">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold">{expense.name}</div>
                  <div>Amount: ${expense.amount.toFixed(2)}</div>
                  <div>Category: {expense.category}</div>
                  <div>Date: {formatDisplayDate(expense.timestamp)}</div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleStartEditPurchase(expense)} className="bg-blue-500 text-white px-3 py-1 rounded">Edit</button>
                  <button onClick={() => handleDeletePurchase(expense.id!)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-6 text-center">
        <Link href="/admin">
          <button className="px-6 py-3 rounded-md shadow-md bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
            Go to Admin
          </button>
        </Link>
      </div>
    </div>
  );
}
