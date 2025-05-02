"use client";

import { useState, useEffect } from 'react';

interface PurchaseInputProps {
  totalIncome: number;
  totalExpenses: number;
  onPurchaseAdded: (name: string, amount: number, category: string, date?: Date) => void;
}

const PurchaseInput: React.FC<PurchaseInputProps> = ({ totalIncome, totalExpenses, onPurchaseAdded }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('alex');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  });

  const categories = ['alex', 'lina', 'home', 'joaquin', 'gasoline', 'groceries'];

  const handleAddPurchase = () => {
    if (!name || !amount || isNaN(Number(amount))) {
      alert('Please enter a name and a valid amount.');
      return;
    }

    const parsedDate = date ? new Date(date) : new Date(); // fallback to now if something's wrong
    onPurchaseAdded(name, Number(amount), `${category} purchase`, parsedDate);

    setName('');
    setAmount('');
    setCategory('alex');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const remainingBalance = totalIncome - totalExpenses;
  const balanceColorClass = remainingBalance >= 0 ? "text-green-600" : "text-red-600";

  return (
    <div className="mt-6 p-4 border border-gray-300 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Add Purchase</h2>
    

      <div className="mb-4">
        <label htmlFor="purchase-name" className="block text-sm font-bold mb-2">Name:</label>
        <input
          type="text"
          id="purchase-name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g., Groceries"
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="amount" className="block text-sm font-bold mb-2">Amount:</label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="category" className="block text-sm font-bold mb-2">Category:</label>
        <select
          id="category"
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full p-2 border rounded"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{`${cat} purchase`}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="purchase-date" className="block text-sm font-bold mb-2">Date:</label>
        <input
          type="date"
          id="purchase-date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4 p-4 border border-gray-300 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold">Remaining Balance</h2>
        <p className={`font-bold ${balanceColorClass}`}>
          ${remainingBalance}
        </p>
      </div>

      <button
        onClick={handleAddPurchase}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
      >
        Add Purchase
      </button>

    </div>
  );
};

export default PurchaseInput;
