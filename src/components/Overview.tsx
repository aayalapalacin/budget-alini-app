import React from "react";

interface OverviewProps {
  totalIncome: number;
  totalExpenses: number;
  remainingBalance: number;
}

const Overview: React.FC<OverviewProps> = ({ totalIncome, totalExpenses, remainingBalance }) => (
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
);

export default Overview;
