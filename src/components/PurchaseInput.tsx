// src/components/PurchaseInput.tsx
"use client";

import { useState, useEffect } from 'react';

interface PurchaseInputProps {
    totalIncome: number;
    totalExpenses: number;
    onPurchaseAdded: (name: string, amount: number, category: string) => void;
}

const PurchaseInput: React.FC<PurchaseInputProps> = ({ totalIncome, totalExpenses, onPurchaseAdded }) => {
    const [name, setName] = useState(''); // New state for the name
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('alex'); // Default to alex

    // Categories
    const categories = ['alex', 'lina', 'home', 'joaquin', 'gasoline', 'groceries'];

    // Dynamically generate dropdown options with "Purchase" suffix
    const purchaseCategories = categories.map(cat => `${cat} purchase`);

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCategory(e.target.value);
    };

    const handleAddPurchase = () => {
        if (!name || !amount || isNaN(Number(amount))) { // Added name validation
            alert('Please enter a name and a valid amount.');
            return;
        }
        // Call the prop function with name, amount, and category
        onPurchaseAdded(name, Number(amount), `${category} purchase`); // Pass name and add ' purchase' suffix

        // Clear the input fields
        setName('');
        setAmount('');
        setCategory('alex'); // Reset category dropdown
    };
      const remainingBalance = totalIncome - totalExpenses
        const balanceColorClass = remainingBalance >= 0 ? "text-green-600" : "text-red-600"
    return (
        <div className="mt-6 p-4 border border-gray-300 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Add Purchase</h2>
             <div className="mb-4 p-4 border border-gray-300 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold">Remaining Balance</h2>
            <p className={`font-bold ${remainingBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${remainingBalance}
            </p>
          </div>
            {/* New Name Input */}
            <div className="mb-4">
                <label htmlFor="purchase-name" className="block text-gray-700 text-sm font-bold mb-2">
                    Name:
                </label>
                <input
                    type="text"
                    id="purchase-name"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g., Groceries from Stop & Shop"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">
                    Amount:
                </label>
                <input
                    type="number" // Use type="number" for better mobile keyboards and input validation
                    id="amount"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="Enter amount"
                />
            </div>
            <div className="mb-4">
                <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
                    Category:
                </label>
                <select
                    id="category"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={category} // Bind to the base category name (e.g., 'alex')
                    onChange={handleCategoryChange}
                >
                    {categories.map(baseCategory => ( // Map over base categories
                        <option key={baseCategory} value={baseCategory}>{`${baseCategory} purchase`}</option> // Display with suffix, but value is base
                    ))}
                </select>
            </div>
            <button
                onClick={handleAddPurchase}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="button"
            >
                Add Purchase
            </button>
        </div>
    );
};

export default PurchaseInput;
