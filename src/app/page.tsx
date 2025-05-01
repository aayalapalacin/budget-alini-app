// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PurchaseInput from "../components/PurchaseInput";
import { firestore } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore'; // Import updateDoc, doc, deleteDoc


interface Expense {
  id?: string; // Make id optional for new expenses before saving
  name: string;
  amount: number;
  category: string;
  isEditing?: boolean; // Add isEditing state for inline editing
}

interface User {
    id: string;
    name: string;
    income: number;
}

export default function Home() {
    const [income, setIncome] = useState<{ alex: number; lina: number }>({ alex: 0, lina: 0 });
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [showBudgetOverview, setShowBudgetOverview] = useState(false);
    const [selectedPurchaseCategory, setSelectedPurchaseCategory] = useState("all purchase"); // For new filter
    const editablePersonCategories = ["alex purchase", "lina purchase"];


    useEffect(() => {
        const fetchAppData = async () => {
            try {
                // Fetch user data (income for Alex and Lina)
                const usersCollection = collection(firestore, 'users');
                const usersSnapshot = await getDocs(usersCollection);

                let alexIncome = 0;
                let linaIncome = 0;

                usersSnapshot.forEach((doc) => {
                    const userData = doc.data();
                    if (userData.name === "Alex") {
                        alexIncome = userData.income ? userData.income : 0;
                    } else if (userData.name === "Lina") {
                        linaIncome = userData.income ? userData.income : 0;
                    }
                });

                setIncome({ alex: alexIncome, lina: linaIncome });

                // Fetch expenses
                const expensesCollection = collection(firestore, 'expenses');
                const expensesSnapshot = await getDocs(expensesCollection);

                const expenseList = expensesSnapshot.docs.map(doc => {
                    const expenseData = doc.data();
                    return {
                        name: expenseData.name,
                        amount: expenseData.amount,
                        category: expenseData.category // Ensure the category is part of the fetched data
                    } as Expense;
                });
                setExpenses(expenseList);

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchAppData();
    }, []);

    // Calculate total income and expenses
    const totalIncome = income.alex + income.lina;
    const totalExpenses = expenses.reduce((sum, exp: Expense) => sum + exp.amount, 0);
    const remainingBalance = totalIncome - totalExpenses;

    // Function to handle adding a new expense
    const handleExpenseAdded = async (name: string, amount: number, category: string) => {
            try {
                  const expensesCollection = collection(firestore, "expenses");
      await addDoc(expensesCollection, {
        name: name,
        amount: amount,
        category: category,
      });
            } catch (error) {
                    console.log("failed to write to db, err", error)
            }

        setExpenses([...expenses, { name: name, amount, category }]); // Update name and category
    };

    // Dynamically generate dropdown options with "Purchase" suffix
    const purchaseCategories = ['alex', 'lina', 'home', 'joaquin', 'gasoline', 'groceries', 'all'];
       const purchaseCategoriesFiltered = purchaseCategories.map(cat => `${cat} purchase`);
    // Filter expenses to only show 'purchase' expenses
       const purchaseExpenses = expenses.filter(expense => expense.category.toLowerCase().includes('purchase'));
       console.log(selectedPurchaseCategory,"cat!!!!!!!!!!1")
       console.log(purchaseExpenses,"purchaseExpenses!!!!!!!!!")
       const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
           setSelectedPurchaseCategory(e.target.value);
       };

    // Filter "purchase" expenses based on selectedCategory
    const filteredExpenses = selectedPurchaseCategory === "all purchase"
        ? purchaseExpenses
        : purchaseExpenses.filter(expense => expense.category === selectedPurchaseCategory);

        // --- Edit and Delete Functions ---

    const handleDeletePurchase = async (id: string) => {
      try {
          const expenseDocRef = doc(firestore, "expenses", id);
          await deleteDoc(expenseDocRef);
          // Update UI: filter out the deleted expense
          setExpenses(expenses.filter((expense) => expense.id !== id));
      } catch (error) {
          console.error("Error deleting expense:", error);
      }
  };

  const handleEditPurchase = (id: string) => {
      setExpenses(
          expenses.map((expense) =>
              expense.id === id ? { ...expense, isEditing: true } : expense
          )
      );
  };

  const handleCancelEdit = (id: string) => {
      // To truly cancel, we need to revert to the original state before editing started.
      // A simple way is to refetch or store a copy. For simplicity here,
      // we'll just toggle isEditing off. A more robust solution would
      // involve storing the original state of the item being edited.
      setExpenses(
          expenses.map((expense) =>
              expense.id === id ? { ...expense, isEditing: false } : expense
          )
      );
      // Note: If you modify the item in the state during editing (like the Admin page example),
      // you'd need to reset those specific fields here to their original values.
  };

  // Handler for changes in the edit inputs/select
  const handleEditedValueChange = (id: string, field: keyof Expense, value: any) => {
      setExpenses(
          expenses.map((expense) =>
              expense.id === id ? { ...expense, [field]: value } : expense
          )
      );
  };


  const handleSavePurchase = async (expenseToSave: Expense) => {
      if (!expenseToSave.id) return; // Should not happen if editing existing item

      try {
          const expenseDocRef = doc(firestore, "expenses", expenseToSave.id);
          await updateDoc(expenseDocRef, {
              name: expenseToSave.name,
              amount: expenseToSave.amount,
              category: expenseToSave.category, // Save the selected 'alex purchase' or 'lina purchase'
          });

          // Update UI: set isEditing to false
          setExpenses(
              expenses.map((expense) =>
                  expense.id === expenseToSave.id ? { ...expense, isEditing: false } : expense
              )
          );
           console.log("Purchase updated successfully!");

      } catch (error) {
          console.error("Error updating purchase:", error);
      }
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
                        <p className={`font-bold ${remainingBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                            ${remainingBalance}
                        </p>
                    </div>
                </div>
            )}

            {/* Add Purchase Section */}
            <PurchaseInput
                 totalIncome={totalIncome}
            totalExpenses={totalExpenses}
                onPurchaseAdded={handleExpenseAdded}
            />
  <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
                    Filter By Category:
                </label>
                                  <select
                    id="category"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                     value={selectedPurchaseCategory} // Bind to the base category name (e.g., 'alex')
                    onChange={handleCategoryChange}
                >
             
                                   {purchaseCategoriesFiltered.map(baseCategory => ( // Map over base categories
                                           <option key={baseCategory} value={baseCategory}>{baseCategory}</option> // Display with suffix, but value is base
                    ))}
                </select>
                <div>
              {filteredExpenses.map((expense, index) =>{ 
                const nameOnly = expense.category.split(" ")[0]
                return(
             
            
              <li key={index} className="flex justify-between items-center p-4 border-b hover:bg-gray-100 transition-all">
               {expense.isEditing ? (
                            // Edit mode
                            <div className="flex flex-col space-y-2">
                                <label htmlFor={`edit-name-${expense.id}`} className="text-sm font-medium text-gray-700">Item Name</label>
                                <input
                                    type="text"
                                    id={`edit-name-${expense.id}`}
                                    value={expense.name}
                                    onChange={(e) => handleEditedValueChange(expense.id!, 'name', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-md text-gray-900"
                                    placeholder="Item Name"
                                />

                                <label htmlFor={`edit-amount-${expense.id}`} className="text-sm font-medium text-gray-700">Amount</label>
                                <input
                                    type="number"
                                    id={`edit-amount-${expense.id}`}
                                    value={expense.amount}
                                    onChange={(e) => handleEditedValueChange(expense.id!, 'amount', parseFloat(e.target.value) || 0)}
                                    className="w-full p-2 border border-gray-300 rounded-md text-gray-900"
                                    placeholder="Amount"
                                />

                                <label htmlFor={`edit-category-${expense.id}`} className="text-sm font-medium text-gray-700">Person</label>
                                 <select
                                    id={`edit-category-${expense.id}`}
                                    value={expense.category}
                                    onChange={(e) => {
                                      console.log(e.target.value,"category selected")
                                      handleEditedValueChange(expense.id!, 'category', e.target.value)}}
                                    className="w-full p-2 border border-gray-300 rounded-md text-gray-900"
                                >
                                     {editablePersonCategories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>

                                <div className="flex justify-end mt-3 space-x-2">
                                    <button
                                        onClick={() => { handleSavePurchase({
                                            id: expense.id,
                                            name: expense.name,
                                            amount: expense.amount,
                                            category: expense.category,
                                            isEditing: false, // Ensure isEditing is set to false after saving
                                        })}}
                                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-700 focus:outline-none"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => handleCancelEdit(expense.id!)}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Display mode
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-semibold">{expense.name}</div>
                                    <div className="text-sm text-gray-600">Category: {expense.category}</div>
                                    <div>Amount: ${expense.amount.toFixed(2)}</div>
                                </div>

                                <div>
                                    <button
                                        onClick={() => handleEditPurchase(expense.id!)}
                                        className="px-3 py-1 bg-blue-200 text-blue-700 rounded-md hover:bg-blue-300 focus:outline-none mr-2"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeletePurchase(expense.id!)}
                                        className="px-3 py-1 bg-red-200 text-red-700 rounded-md hover:bg-red-300 focus:outline-none"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}
              </li>
  )})}
        </div>
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
