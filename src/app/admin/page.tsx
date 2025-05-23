// src/app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { firestore } from "@/lib/firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import Expenses from "@/components/ExpenseList";
import { PayOut } from "@/components/PayOut";

interface Expense {
  title: string;
  amount: number;
}

interface Category {
  id: string;
  name: string;
}

export default function Admin() {
  const [income, setIncome] = useState<{ alex: string; lina: string }>({ alex: "0", lina: "0" });
  const [view, setView] = useState<string>('income');
  const [newExpenseName, setNewExpenseName] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState<string>("");
  const [newExpenseCategory, setNewExpenseCategory] = useState("alex"); // Default category
  const [categories, setCategories] = useState<Category[]>([]);

  const [shouldRefreshExpenses, setShouldRefreshExpenses] = useState(false);


  useEffect(() => {
    const fetchIncomes = async () => {
      try {
        const usersCollection = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersCollection);

        let alexIncome = "0";
        let linaIncome = "0";

        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.name === "Alex") {
            alexIncome = userData.income ? userData.income.toString() : "0";
          } else if (userData.name === "Lina") {
            linaIncome = userData.income ? userData.income.toString() : "0";
          }
        });

        setIncome({ alex: alexIncome, lina: linaIncome });

      } catch (error) {
        console.error("Error fetching incomes:", error);
      }
    };
    const fetchCategories = async () => {
      try {
        const categoriesCollection = collection(firestore, "categories");
        const categoriesSnapshot = await getDocs(categoriesCollection);

        const categoryList = categoriesSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || "",
          } as Category;
        });

        setCategories(categoryList);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
    fetchIncomes();
  }, []);

  const handleIncomeChange = (name: "alex" | "lina", value: string) => {
    setIncome((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddExpense = async () => {
    
    const expenseAmountNumber = parseFloat(newExpenseAmount);
    if (!newExpenseName || !newExpenseAmount || !newExpenseCategory) return;

    try {
      // Add the new expense to the "expenses" collection in Firebase
      const expensesCollection = collection(firestore, "expenses");
      await addDoc(expensesCollection, {
        name: newExpenseName,
        amount: expenseAmountNumber,
        category: newExpenseCategory,
      });

      // Clear the input fields
      setNewExpenseName("");
      setNewExpenseAmount("");
      setNewExpenseCategory("alex");
      // set "shouldRefreshExpenses" to "true" before setting it back to "false"
      setShouldRefreshExpenses(true);
      console.log("Expense added successfully!");
    } catch (error) {
      console.error("Error adding expense:", error);
    }
    setShouldRefreshExpenses(false);
  };

  const expenseCategories= categories.filter((category)=> !category.name.includes("purchase") )
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
        <button onClick={() => setView('pay out')} className={`px-6 py-3 rounded-md transition-all text-white ${view === 'pay out' ? 'bg-gradient-to-r from-blue-500 to-blue-700' : 'bg-gray-300 text-gray-700'} hover:scale-105`}>
          Pay out
        </button>
      </div>

      {view === 'income' ? 
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
      : view === 'expenses' ? (
        <div>
          <div className="space-y-4">
            <div className="flex flex-col">
              <label className="text-lg font-semibold mb-2">Expense Name</label>
              <input
                type="text"
                value={newExpenseName}
                onChange={(e) => setNewExpenseName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter expense title"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-lg font-semibold mb-2">Expense Amount</label>
              <input
                type="number"
                value={newExpenseAmount}
                onChange={(e) => setNewExpenseAmount(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter expense amount"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-lg font-semibold mb-2">Expense Category</label>
              <select
                value={newExpenseCategory}
                onChange={(e) => setNewExpenseCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {expenseCategories.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAddExpense}
              className="w-full py-3 mt-4 text-white bg-gradient-to-r from-blue-500 to-blue-700 rounded-md shadow-lg hover:bg-blue-600 transition-all">
              Add Expense
            </button>
          </div>
          {/* Pass refreshExpenses and categories to ExpenseList */}
          <Expenses shouldRefresh={shouldRefreshExpenses} categories={categories} />
        </div>
      ):(
        <PayOut />
      )
    }

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
