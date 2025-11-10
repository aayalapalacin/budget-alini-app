"use client";

import { useState, useEffect } from "react";
import { fetchCategories } from "@/assets/fetch";
import { Category } from "@/assets/types";


interface PurchaseInputProps {
  totalIncome: number;
  totalExpenses: number;
  handleDeletePurchaseExpenses: () => Promise<void>;
  onPurchaseAdded: (
    name: string,
    amount: number,
    category: string,
    date?: Date
  ) => void;
}

const PurchaseInput: React.FC<PurchaseInputProps> = ({
  totalIncome,
  totalExpenses,
  onPurchaseAdded,
  handleDeletePurchaseExpenses,
}) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(""); // Keep as string for input
  const [category, setCategory] = useState<Category>({id:"0",name:""});
  const [categories, setCategories] = useState<Category[]>([]);

  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
  });

  // const categories = [
  //   "alex",
  //   "lina",
  //   "home",
  //   "joaquin",
  //   "gasoline",
  //   "groceries",
  // ];

  const handleAddPurchase = () => {
    // Validate amount: ensure it's a valid number and not empty
    const parsedAmount = parseFloat(amount);
    if (!name || isNaN(parsedAmount)) {
      alert("Please enter a name and a valid amount.");
      return;
    }

    const parsedDate = date ? new Date(date) : new Date(); // fallback to now if something's wrong

    // Pass the parsed number to the parent
    onPurchaseAdded(name, parsedAmount, `${category} purchase`, parsedDate);

    // Reset form fields
    setName("");
    setAmount("");
    setCategory({id:"0",name:""});
    setDate(new Date().toISOString().split("T")[0]);
  };

  const remainingBalance = totalIncome - totalExpenses;

  // Function to format currency
  const formatCurrency = (value: number) => {
    return value.toFixed(2); // Always format to 2 decimal places
  };

  const balanceColorClass =
    remainingBalance >= 0 ? "text-green-600" : "text-red-600";
    useEffect(   () =>{
      const getPurchaseCategories = async ()=>{

        const allCategories :Category[] = await fetchCategories(setCategories)
        const purchaseCategories :Category[] = allCategories.filter((cat)=> cat.name.includes("purchase"))
        setCategories(purchaseCategories);
        setCategory(purchaseCategories[0])
      }
      getPurchaseCategories()
    },[])
    
  

  return (
    <div className="mt-6 p-4 border border-gray-300 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Add Purchase</h2>

      <div className="mb-4">
        <label htmlFor="purchase-name" className="block text-sm font-bold mb-2">
          Name:
        </label>
        <input
          type="text"
          id="purchase-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Groceries"
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="amount" className="block text-sm font-bold mb-2">
          Amount:
        </label>
        <input
          type="number" // Use type="number" to get browser's numeric input features
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount (e.g., 2.50)"
          step="0.01" // Important: Allows decimal steps in the input
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="category" className="block text-sm font-bold mb-2">
          Category:
        </label>
        <select
          id="category"
          value={category.name}
          onChange={(e) => setCategory({id:"0",name:e.target.value})}
          className="w-full p-2 border rounded"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{`${cat.name} `}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="purchase-date" className="block text-sm font-bold mb-2">
          Date:
        </label>
        <input
          type="date"
          id="purchase-date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4 p-4 border border-gray-300 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold">Remaining Balance</h2>
        <p className={`font-bold ${balanceColorClass}`}>
          ${formatCurrency(remainingBalance)} {/* Apply formatting here */}
        </p>
      </div>

      <button
        onClick={handleAddPurchase}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
      >
        Add Purchase
      </button>
      <button
        onClick={handleDeletePurchaseExpenses}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 my-5 rounded w-full"
      >
        Delete All Purchases
      </button>
    </div>
  );
};

export default PurchaseInput;
