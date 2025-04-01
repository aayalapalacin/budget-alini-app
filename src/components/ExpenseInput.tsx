"use client";

import { useState, useEffect } from "react";

interface ExpenseInputProps {
  totalIncome: number;
  totalExpenses: number;
  onExpenseAdded: (amount: number, category: string) => void;
}

const ExpenseInput = ({ totalIncome, totalExpenses, onExpenseAdded }: ExpenseInputProps) => {
  const [newExpense, setNewExpense] = useState({ amount: "", category: "" });
  const [remainingBalance, setRemainingBalance] = useState(totalIncome - totalExpenses);

  // Update remaining balance in real-time as user types the amount
  useEffect(() => {
    const currentExpenseAmount = parseFloat(newExpense.amount) || 0;
    const updatedRemainingBalance = totalIncome - totalExpenses - currentExpenseAmount;
    setRemainingBalance(updatedRemainingBalance);
  }, [newExpense.amount, totalIncome, totalExpenses]);

  const handleExpenseInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewExpense({ ...newExpense, amount: e.target.value });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewExpense({ ...newExpense, category: e.target.value });
  };

  const handleAddExpense = () => {
    if (!newExpense.amount || !newExpense.category) return;
    onExpenseAdded(parseFloat(newExpense.amount), newExpense.category);
    setNewExpense({ amount: "", category: "" }); // Reset after adding
  };

  return (
    <div className="mb-6 p-4 border border-gray-300 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold">Add Expense</h2>

      <input
        type="text" // Changed to text
        value={newExpense.amount}
        onChange={handleExpenseInputChange}
        className="w-full p-2 border rounded-md mb-4"
        placeholder="Amount"
      />

      <select
        value={newExpense.category}
        onChange={handleCategoryChange}
        className="w-full p-2 border rounded-md mb-4"
      >
        <option value="">Select Category</option>
        <option value="alex">Alex</option>
        <option value="lina">Lina</option>
        <option value="joaquin">Joaquin</option>
        <option value="gas">Gas</option>
        <option value="groceries">Groceries</option>
        <option value="eating out">Eating Out</option>
      </select>

      <button
        onClick={handleAddExpense}
        className="w-full py-2 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition"
      >
        Add Expense
      </button>

      <div className="mt-4">
        <p className="text-lg font-semibold">Remaining Balance</p>
        <p className={`font-bold ${remainingBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
          ${remainingBalance}
        </p>
      </div>
    </div>
  );
};

export default ExpenseInput;
