// src/components/ExpenseList.tsx
"use client"; // This is needed if you're using app router in Next.js

import { useState, useEffect } from "react";
import { firestore } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { Category, Expense } from "@/assets/types";
import { fetchExpenses } from "@/assets/fetch";

interface ExpensesProps {
  shouldRefresh: boolean;
  categories: Category[]; // Pass categories down from Admin
}

const Expenses: React.FC<ExpensesProps> = ({ shouldRefresh, categories }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // State for editing
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [tempEditedExpense, setTempEditedExpense] = useState<Partial<Expense> | null>(null);

  // Fetch expenses whenever the component mounts, selected category changes,
  // or shouldRefresh changes
  useEffect(() => {
    fetchExpenses(setExpenses);
    
  }, [selectedCategory, shouldRefresh]); // Depend on selectedCategory and shouldRefresh

  // --- Editing Logic ---

  const startEditing = (expense: Expense) => {
      setEditingExpenseId(expense.id);
      // Initialize temporary state with current expense data
      setTempEditedExpense({
          name: expense.name,
          amount: expense.amount,
          category: expense.category
      });
  };

  const cancelEditing = () => {
      setEditingExpenseId(null);
      setTempEditedExpense(null);
  };

  const saveEditing = async (id: string) => {
      if (!tempEditedExpense) return;

      try {
          const expenseRef = doc(firestore, "expenses", id);
          // Only update the fields that are in tempEditedExpense
          await updateDoc(expenseRef, {
              name: tempEditedExpense.name,
              amount: tempEditedExpense.amount,
              category: tempEditedExpense.category,
              // Add other fields if needed
          });

          console.log(`Expense ${id} updated successfully!`);

          // Reset editing state
          setEditingExpenseId(null);
          setTempEditedExpense(null);

          // Trigger a refresh of the list
          // We need to tell the Admin component to trigger the refresh
          // This might require lifting the refresh logic up or having a dedicated refresh function passed down.
          // For simplicity here, let's re-fetch manually or rely on `shouldRefresh` mechanism if you adjust it.
          // A simple manual re-fetch after save:
          const expensesCollection = collection(firestore, 'expenses');
          const expensesSnapshot = await getDocs(expensesCollection);
           const expensesList = expensesSnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                name: data.name || '',
                amount: data.amount || 0,
                category: data.category || ''
              } as Expense;
            });
             const filteredExpenses = selectedCategory === 'all'
                ? expensesList
                : expensesList.filter(expense => expense.category === selectedCategory);
            setExpenses(filteredExpenses);


      } catch (error) {
          console.error(`Error updating expense ${id}:`, error);
          // Optionally show an error message
      }
  };

    const handleDelete = async (id: string) => {
        try {
            await deleteDoc(doc(firestore, "expenses", id));
            console.log(`Expense ${id} deleted successfully!`);
            // Filter the item out of the current state for immediate UI update
            setExpenses(expenses.filter(expense => expense.id !== id));
        } catch (error) {
            console.error(`Error deleting expense ${id}:`, error);
            // Optionally show an error message
        }
    };


  const handleTempInputChange = (field: keyof Expense, value: any) => {
      setTempEditedExpense(prev => ({
          ...prev,
          [field]: value
      }));
  };

  const expenseCategories= categories.filter((category)=> !category.name.includes("purchase") )

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-center text-blue-700">Expense List</h2>

      <div className="mb-4">
        <label className="text-lg font-semibold mb-2 block">Filter by Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Categories</option>
          {expenseCategories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
    <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">

      <ul className="space-y-4">
        {expenses.map((expense) => (
          <li key={expense.id} className="p-4 border border-gray-200 rounded-md shadow-sm bg-gray-50">
            {editingExpenseId === expense.id ? (
              // Render edit form
              <div className="space-y-3">
                  <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                          type="text"
                          value={tempEditedExpense?.name || ''}
                          onChange={(e) => handleTempInputChange('name', e.target.value)}
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                  </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700">Amount</label>
                       <input
                          type="number"
                          value={tempEditedExpense?.amount || 0}
                          onChange={(e) => handleTempInputChange('amount', parseFloat(e.target.value))}
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                       <select
                          value={tempEditedExpense?.category || ''}
                          onChange={(e) => handleTempInputChange('category', e.target.value)}
                          className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        {expenseCategories.map((category) => (
                            <option key={category.id} value={category.name}>
                              {category.name}
                            </option>
                          ))}
                      </select>
                   </div>

                  <div className="flex space-x-2 justify-end">
                       <button
                          onClick={() => saveEditing(expense.id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                       >
                          Save
                       </button>
                        <button
                          onClick={cancelEditing}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                       >
                          Cancel
                       </button>
                  </div>
              </div>
            ) : (
              // Render display view
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{expense.name}</p>
                  <p className="text-gray-700">${expense.amount.toFixed(2)}</p>
                  <p className="text-gray-600 text-sm">Category: {expense.category}</p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => startEditing(expense)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors"
                    >
                        Edit
                    </button>
                     <button
                        onClick={() => handleDelete(expense.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                    >
                        Delete
                    </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  </div>
  );
}

export default Expenses;
