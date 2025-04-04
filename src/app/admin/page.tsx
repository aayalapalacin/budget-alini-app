"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Expense {
  title: string;
  amount: number;
}

export default function Admin() {
  const [income, setIncome] = useState<{ alex: string; lina: string }>({ alex: "0", lina: "0" });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [view, setView] = useState<'income' | 'expenses'>('income');
  const [newExpense, setNewExpense] = useState({ title: "", amount: "" });

  useEffect(() => {
    const storedData = localStorage.getItem("budgetData");
    if (storedData) {
      try {
        const savedData = JSON.parse(storedData);
        setIncome(savedData.income || { alex: "0", lina: "0" });
        setExpenses(savedData.expenses || []);
      } catch (error) {
        console.error("Error parsing localStorage data:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("budgetData", JSON.stringify({ income, expenses }));
  }, [income, expenses]);

  const handleIncomeChange = (name: "alex" | "lina", value: string) => {
    setIncome((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddExpense = () => {
    if (!newExpense.title || !newExpense.amount) return;
    setExpenses([...expenses, { title: newExpense.title, amount: parseFloat(newExpense.amount) }]);
    setNewExpense({ title: "", amount: "" });
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white min-h-screen text-gray-900 shadow-2xl rounded-xl">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Admin Panel</h1>
      
      <div className="flex justify-center gap-6 mb-6">
        <button onClick={() => setView('income')} className={`px-6 py-3 rounded-md transition-all text-white ${view === 'income' ? 'bg-gradient-to-r from-blue-500 to-blue-700' : 'bg-gray-300 text-gray-700'} hover:scale-105`}>
          Income
        </button>
        <button onClick={() => setView('expenses')} className={`px-6 py-3 rounded-md transition-all text-white ${view === 'expenses' ? 'bg-gradient-to-r from-blue-500 to-blue-700' : 'bg-gray-300 text-gray-700'} hover:scale-105`}>
          Expenses
        </button>
      </div>

      {view === 'income' ? (
        <div className="space-y-6">
          <div className="flex flex-col">
            <label className="text-lg font-semibold mb-2">Alex's Income</label>
            <input
              type="text"
              value={income.alex}
              onChange={(e) => handleIncomeChange("alex", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Alex's income"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-lg font-semibold mb-2">Lina's Income</label>
            <input
              type="text"
              value={income.lina}
              onChange={(e) => handleIncomeChange("lina", e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Lina's income"
            />
          </div>
        </div>
      ) : (
        <div>
          <div className="space-y-4">
            <div className="flex flex-col">
              <label className="text-lg font-semibold mb-2">Expense Title</label>
              <input
                type="text"
                value={newExpense.title}
                onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter expense title"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-lg font-semibold mb-2">Expense Amount</label>
              <input
                type="text"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter expense amount"
              />
            </div>
            <button 
              onClick={handleAddExpense} 
              className="w-full py-3 mt-4 text-white bg-gradient-to-r from-blue-500 to-blue-700 rounded-md shadow-lg hover:bg-blue-600 transition-all">
              Add Expense
            </button>
          </div>

          <div className="mt-6 max-h-40 overflow-y-auto border-t-2 pt-4">
            {expenses.map((exp, index) => (
              <div key={index} className="flex justify-between items-center p-4 border-b hover:bg-gray-100 transition-all">
                <span>{exp.title}</span>
                <span className="text-red-600">${exp.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link href="/">
          <button className="px-6 py-3 rounded-md bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold transition-all transform hover:scale-105 hover:shadow-xl">
            Go to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
