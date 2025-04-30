// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PurchaseInput from "../components/PurchaseInput";
import { firestore } from '@/lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';

interface Expense {
    name: string;
    amount: number;
    category: string; // Ensure your Expense interface includes a category
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
                <span> Person: {nameOnly}</span>
                <span>Item: {expense.name}</span>
                <span className="text-red-600">Amount: ${expense.amount.toFixed(2)}</span>
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
