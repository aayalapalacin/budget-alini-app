"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ExpenseInput from "../components/ExpenseInput"; // Importing the new ExpenseInput component

interface Expense {
  title: string;
  amount: number;
}

export default function Home() {
  const [income, setIncome] = useState<{ alex: number; lina: number }>({ alex: 0, lina: 0 });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showBudgetOverview, setShowBudgetOverview] = useState(false); // State for toggle

  useEffect(() => {
    const storedData = localStorage.getItem("budgetData");
    if (storedData) {
      try {
        const savedData = JSON.parse(storedData);
        setIncome(savedData.income || { alex: 0, lina: 0 });
        setExpenses(savedData.expenses || []);
      } catch (error) {
        console.error("Error parsing localStorage data:", error);
      }
    }
  }, []);

  // Calculate total income and expenses
  const totalIncome = income.alex + income.lina;
  const totalExpenses = expenses.reduce((sum, exp: Expense) => sum + exp.amount, 0);

  // Handle adding a new expense
  const handleExpenseAdded = (amount: number, category: string) => {
    setExpenses([...expenses, { title: category, amount }]);
  };

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen text-gray-900 bg-white shadow-xl rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Budget Overview</h1>

      {/* Toggle Button for Budget Overview */}
      <div className="mb-4 flex items-center justify-between">
        <label htmlFor="toggle" className="text-lg font-semibold">
          Show Budget Overview
        </label>
        <input
          type="checkbox"
          id="toggle"
          checked={showBudgetOverview}
          onChange={() => setShowBudgetOverview(!showBudgetOverview)}
          className="toggle-checkbox"
        />
      </div>

      {/* Conditional Rendering of Budget Overview */}
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
            <p className={`font-bold ${totalIncome - totalExpenses >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${totalIncome - totalExpenses}
            </p>
          </div>
        </div>
      )}

      {/* Add Expense Section */}
      <ExpenseInput
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        onExpenseAdded={handleExpenseAdded}
      />

      <div className="mt-6 text-center">
        <Link href="/admin">
          <button className="px-6 py-3 rounded-md shadow-md bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold transition-all transform hover:scale-105 hover:shadow-lg hover:from-purple-500 hover:to-blue-500">
            Go to Admin
          </button>
        </Link>
      </div>
    </div>
  );
}
