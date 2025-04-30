// src/app/expenses/page.tsx
"use client";

import { useState, useEffect } from "react";
import { firestore } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";

interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  isEditing: boolean;
}

interface ExpenseListProps {
    shouldRefresh: boolean;
}

export default function Expenses({shouldRefresh}: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All"); // State for the selected category

  // Define the list of available categories
  const categories = ["All", "alex", "lina", "home", "joaquin", "gasoline", "groceries"];

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const expensesCollection = collection(firestore, "expenses");
        const expensesSnapshot = await getDocs(expensesCollection);

        const expenseList = expensesSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || "",
            amount: data.amount || 0,
            category: data.category || "",
            isEditing: false, // Add isEditing state
          } as Expense;
        });

        setExpenses(expenseList);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };

    fetchExpenses();
  }, [shouldRefresh]);

  const handleDeleteExpense = async (id: string) => {
    try {
      const expenseDocRef = doc(firestore, "expenses", id);
      await deleteDoc(expenseDocRef);
      setExpenses(expenses.filter((expense) => expense.id !== id)); // Update UI
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const handleEditExpense = (id: string) => {
    setExpenses(
      expenses.map((expense) =>
        expense.id === id ? { ...expense, isEditing: true } : expense
      )
    );
  };

  const handleSaveExpense = async (id: string, newName:string, newAmount: number, newCategory: string) => {
    try {
      const expenseDocRef = doc(firestore, "expenses", id);
      await updateDoc(expenseDocRef, { amount: newAmount, category: newCategory, name: newName });
      setExpenses(
        expenses.map((expense) =>
          expense.id === id
            ? { ...expense, amount: newAmount, category: newCategory, name: newName, isEditing: false }
            : expense
        )
      );
    } catch (error) {
      console.error("Error updating expense:", error);
    }
  };

  const handleCancelEdit = (id: string) => {
    setExpenses(
      expenses.map((expense) =>
        expense.id === id ? { ...expense, isEditing: false } : expense
      )
    );
  };

  const handleNameChange = (id:string, newName:string) =>{
    setExpenses(
      expenses.map((expense) =>
        expense.id === id
          ? { ...expense, name: newName }
          : expense
      )
    );
  }

  const handleAmountChange = (id:string, newAmount: number) =>{
    setExpenses(
      expenses.map((expense) =>
        expense.id === id
          ? { ...expense, amount: newAmount }
          : expense
      )
    );
  }

    const handleCategoryChange = (id:string, newCategory: string) =>{
    setExpenses(
      expenses.map((expense) =>
        expense.id === id
          ? { ...expense, category: newCategory }
          : expense
      )
    );
  }
    // Filter expenses based on selectedCategory
    const filteredExpenses = selectedCategory === "All"
    ? expenses
    : expenses.filter(expense => expense.category === selectedCategory);


  return (
    <div className="p-6 max-w-2xl mx-auto bg-white min-h-screen text-gray-900 shadow-2xl rounded-xl">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Expenses</h1>
        {/* Category Filter Dropdown */}
        <div className="mb-6">
                <label htmlFor="category-filter" className="block text-lg font-semibold mb-2 text-gray-700">Filter by Category:</label>
                <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                ))}
                </select>
            </div>
      <ul className="space-y-4">
        {filteredExpenses.map((expense) => (
          <li
            key={expense.id}
            className="bg-gray-100 rounded-md shadow-sm overflow-hidden"
          >
            <div className="flex justify-between items-center p-4">
            {expense.isEditing ? (
                <div className="flex flex-col">
                    <label htmlFor={`name-${expense.id}`} className="text-sm font-medium text-gray-700">Expense Name</label>
                    <input
                      type="text"
                      id={`name-${expense.id}`}
                      value={expense.name}
                      onChange={(e) => handleNameChange(expense.id, e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter expense title"
                    />
                  
                    <label htmlFor={`amount-${expense.id}`} className="text-sm font-medium text-gray-700">Expense Amount</label>
                    <input
                      type="number"
                      id={`amount-${expense.id}`}
                      value={expense.amount}
                      onChange={(e) => handleAmountChange(expense.id, parseFloat(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter expense amount"
                    />
                  
                  <label htmlFor={`category-${expense.id}`} className="text-sm font-medium text-gray-700">Category</label>
                  <select
                      id={`category-${expense.id}`}
                      value={expense.category}
                      onChange={(e) => handleCategoryChange(expense.id, e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.slice(1).map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
               ) : (
                <div>
                  <span className="text-lg font-semibold">
                    {expense.name}
                    <span className="text-sm text-gray-500"> ({expense.category})</span>
                  </span>
                </div>
              )}


              <div className="flex items-center">
                <span className="text-red-600 mr-4">${expense.amount.toFixed(2)}</span>

                {expense.isEditing ? (
                  <>
                    <button
                      onClick={() => handleSaveExpense(expense.id, expense.name, expense.amount, expense.category)}
                      className="text-green-500 hover:text-green-700 focus:outline-none mr-2"
                    >
                      save
                    </button>
                    <button
                      onClick={() => handleCancelEdit(expense.id)}
                      className="text-gray-500 hover:text-gray-700 focus:outline-none"
                    >
                      cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEditExpense(expense.id)}
                      className="text-blue-500 hover:text-blue-700 focus:outline-none mr-2"
                    >
                      edit
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="text-red-500 hover:text-red-700 focus:outline-none"
                    >
                      x
                    </button>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
