"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PurchaseInput from "../components/PurchaseInput";
import { firestore } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import Overview from "@/components/Overview";
import PurchaseView from "@/components/PurchaseView";
import { Category, Expense } from "@/assets/types";
import { fetchCategories, fetchExpenses, fetchIncomes } from "@/assets/fetch";



function formatDateForInput(date?: Date): string {
  if (!date) return "";
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(date?: Date): string {
  return date ? date.toLocaleDateString() : "No date";
}

export default function Home() {
  const [income, setIncome] = useState({ alex: 0, lina: 0 });
  const [expenses, setExpenses] = useState<Expense[]>([]);
    const [alexDocId, setAlexDocId] = useState<string | null>(null); // To store Alex's Firebase doc ID
  const [linaDocId, setLinaDocId] = useState<string | null>(null); // To store Lina's Firebase doc ID
  const [selectedPurchaseCategory, setSelectedPurchaseCategory] =
    useState("all purchase");
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [tempEditedExpense, setTempEditedExpense] =
    useState<Partial<Expense> | null>(null);
  const [activeView, setActiveView] = useState<
    "overview" | "purchase" | "admin" | null
  >(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editablePersonCategories, setEditablePersonCategories] = useState<string[]>([]);


  useEffect(() => {
    

    fetchExpenses(setExpenses)
    fetchIncomes( setAlexDocId,setLinaDocId,setIncome)
     const getPurchaseCategories = async ()=>{

        const allCategories :Category[] = await fetchCategories(setCategories)
        const purchaseCategories :Category[] = allCategories.filter((cat)=> cat.name.includes("purchase"))
        const purchaseCatNames = purchaseCategories.map((item)=> item.name)
        setEditablePersonCategories(purchaseCatNames);
      }
      getPurchaseCategories()
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
    const updatedList = snapshot.docs.map((doc) => {
      const data = doc.data();
      const timestamp =
        data.timestamp instanceof Timestamp
          ? data.timestamp.toDate()
          : undefined;
      return {
        id: doc.id,
        name: data.name,
        amount: data.amount,
        category: data.category,
        timestamp,
      };
    });

    updatedList.sort(
      (a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0)
    );
    setExpenses(updatedList);
  };

 

  const purchaseExpenses = expenses.filter((exp) =>
    exp.category.toLowerCase().includes("purchase")
  );
  const filteredExpenses =
    selectedPurchaseCategory === "all purchase"
      ? purchaseExpenses
      : purchaseExpenses.filter(
          (exp) => exp.category === selectedPurchaseCategory
        );

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPurchaseCategory(e.target.value);
  };

  const handleDeletePurchase = async (id: string) => {
    await deleteDoc(doc(firestore, "expenses", id));
    setExpenses(expenses.filter((exp) => exp.id !== id));
  };

  const handleStartEditPurchase = (expense: Expense) => {
    setEditingExpenseId(expense.id!);
    setTempEditedExpense({ ...expense });
  };

  const handleCancelEdit = () => {
    setEditingExpenseId(null);
    setTempEditedExpense(null);
  };

  const handleEditedValueChange = (
    field: keyof (Expense & { timestamp?: Date }),
    value: any
  ) => {
    setTempEditedExpense((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [field]: field === "timestamp" ? new Date(value) : value,
      };
    });
  };

  const handleSavePurchase = async (id: string) => {
  
    if (!id || !tempEditedExpense) return;
    await updateDoc(doc(firestore, "expenses", id), {
      name: tempEditedExpense.name,
      amount: tempEditedExpense.amount,
      category: tempEditedExpense.category,
      timestamp: tempEditedExpense.timestamp
        ? Timestamp.fromDate(tempEditedExpense.timestamp)
        : serverTimestamp(),
    });

    setExpenses(
      expenses.map((exp) =>
        exp.id === id ? { ...exp, ...tempEditedExpense, isEditing: false } : exp
      )
    );
    setEditingExpenseId(null);
    setTempEditedExpense(null);
  };

  const handleDeletePurchaseExpenses = async () => {
    if (!firestore) {
      console.error("Firestore instance not available.");
      return;
    }

    // 1. Identify items to delete based on the current 'expenses' state
    const purchaseExpensesToDelete = expenses.filter((exp) =>
      exp.category.toLowerCase().includes("purchase")
    );

    if (purchaseExpensesToDelete.length === 0) {
      console.log("No 'purchase' related expenses found to delete.");
      return;
    }

    console.log(
      `Found ${purchaseExpensesToDelete.length} 'purchase' expenses to delete.`
    );

    const batch = writeBatch(firestore);
    const expensesCollectionRef = collection(firestore, "expenses");

    // Add delete operations to the batch
    purchaseExpensesToDelete.forEach((exp) => {
      const docRef = doc(expensesCollectionRef, exp.id); // Get a document reference
      batch.delete(docRef); // Add the delete operation to the batch
    });

    try {
      await batch.commit(); // Commit the batch deletion
      console.log(
        "Successfully deleted all 'purchase' expenses from Firestore."
      );

      // 2. Update local state to reflect changes
      const updatedExpenses = expenses.filter(
        (exp) => !exp.category.toLowerCase().includes("purchase")
      );
      setExpenses(updatedExpenses);
      console.log("Local expenses state updated.");
    } catch (error) {
      console.error("Error deleting 'purchase' expenses:", error);
      // You might want to set an error state here or show a user notification
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto min-h-screen text-gray-900 bg-white shadow-xl rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Budget Dashboard</h1>

      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setActiveView("overview")}
          className="px-6 py-3 rounded-md shadow-md bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold"
        >
          Budget Overview
        </button>
        <button
          onClick={() => setActiveView("purchase")}
          className="px-6 py-3 rounded-md shadow-md bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold"
        >
          Add Purchase
        </button>
        <Link href="/admin">
          <button className="px-6 py-3 rounded-md shadow-md bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
            Go to Admin
          </button>
        </Link>
      </div>

      {activeView === "overview" && (
        <Overview
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          remainingBalance={remainingBalance}
        />
      )}

      {activeView === "purchase" && (
        <>
          <PurchaseInput
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            onPurchaseAdded={handleExpenseAdded}
            handleDeletePurchaseExpenses={handleDeletePurchaseExpenses}
          />

          <PurchaseView
            selectedPurchaseCategory={selectedPurchaseCategory}
            purchaseCategoriesFiltered={[...editablePersonCategories,"all purchase"]}
            filteredExpenses={filteredExpenses}
            editablePersonCategories={editablePersonCategories}
            editingExpenseId={editingExpenseId}
            tempEditedExpense={tempEditedExpense}
            handleCategoryChange={handleCategoryChange}
            handleDeletePurchase={handleDeletePurchase}
            handleStartEditPurchase={handleStartEditPurchase}
            handleCancelEdit={handleCancelEdit}
            handleEditedValueChange={handleEditedValueChange}
            handleSavePurchase={handleSavePurchase}
            formatDateForInput={formatDateForInput}
            formatDisplayDate={formatDisplayDate}
          />
        </>
      )}
    </div>
  );
}
