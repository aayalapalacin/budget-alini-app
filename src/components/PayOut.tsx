"use client";
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { Chart } from './Chart';

interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  purchaser: 'alex' | 'lina'; // Assuming your Firebase data includes the purchaser
}

interface CalculationResult {
  linaToAlex: number;
  alexToLina: number;
}

function calculatePayouts(expenses: Expense[]): CalculationResult {
  let linaOwesAlex = 0;
  let alexOwesLina = 0;

  expenses.forEach(expense => {
    const amount = expense.amount;

    switch (expense.category.toLowerCase()) {
      case 'home purchase':
      case 'gasoline purchase':
      case 'eating out purchase':
      case 'groceries purchase':
      case 'joaquin purchase':
        // Shared expenses, ignored in direct debts
      linaOwesAlex += amount / 2;
        break;

      case 'alex expense':
      case 'lina expense':
        // Purely personal, ignored in debt calculations
        break;

      case 'alex debit':
        // Lina owes Alex half
        linaOwesAlex += amount / 2;
        break;

      case 'lina debit':
        // Alex owes Lina half
        alexOwesLina += amount / 2;
        break;

      default:
        console.warn(`Unhandled category: ${expense.category}`);
    }
  });

  return {
    linaToAlex: parseFloat(linaOwesAlex.toFixed(2)),
    alexToLina: parseFloat(alexOwesLina.toFixed(2)),
  };
}


export const PayOut = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payoutResult, setPayoutResult] = useState<CalculationResult | null>(null);

  const [totalHome, setTotalHome] = useState(0);
  const [totalGasoline, setTotalGasoline] = useState(0);
  const [totalEatingOut, setTotalEatingOut] = useState(0);
  const [totalGroceries, setTotalGroceries] = useState(0);
  const [totalJoaquin, setTotalJoaquin] = useState(0);
  const [totalLina, setTotalLina] = useState(0); 


  const currentDate = new Date();
  const currentMonthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const expensesCollection = collection(firestore, 'expenses');
        const expensesSnapshot = await getDocs(expensesCollection);

        const expensesList = expensesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            amount: data.amount || 0,
            category: data.category || '',
            purchaser: data.purchaser || 'alex', // Assuming a default if not present
          } as Expense;
        });

        setExpenses(expensesList);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };

    fetchExpenses();
}, []);

 useEffect(() => {
    if (expenses && expenses.length > 0) {
      // Calculate Payouts (as you already have)
      const payouts = calculatePayouts(expenses);
      setPayoutResult(payouts);

      // --- Calculate and set category totals here ---
      let home = 0;
      let gasoline = 0;
      let eatingOut = 0;
      let groceries = 0;
      let joaquin = 0;
      let lina = 0;

      expenses.forEach((expense) => {
        switch (expense.category) {
          case 'home expense':
          case 'home purchase':
            home += expense.amount;
            break;
          case 'gasoline purchase':
            gasoline += expense.amount;
            break;
          case 'eating out purchase':
            eatingOut += expense.amount;
            break;
          case 'groceries purchase':
            groceries += expense.amount;
            break;
          case 'joaquin purchase':
            joaquin += expense.amount;
            break;
          case 'lina purchase':
            lina += expense.amount;
            break;
          // Add other categories if needed
        }
      });

      // Update the state variables
      setTotalHome(home);
      setTotalGasoline(gasoline);
      setTotalEatingOut(eatingOut);
      setTotalGroceries(groceries);
      setTotalJoaquin(joaquin);
      setTotalLina(lina);

      // --- End category total calculation ---

    } else {
        // Reset totals if expenses list is empty (e.g., data hasn't loaded or there are no expenses)
        setTotalHome(0);
        setTotalGasoline(0);
        setTotalEatingOut(0);
        setTotalGroceries(0);
        setTotalJoaquin(0);
        setTotalLina(0);
        setPayoutResult(null); // Also reset payout result
    }
  }, [expenses]); // This effect runs whenever the 'expenses' state changes

  useEffect(() => {
    if (expenses && expenses.length > 0) {
      const payouts = calculatePayouts(expenses);
      setPayoutResult(payouts);
    }
  }, [expenses]);

  return (
    <div className="bg-white p-6 rounded-md shadow-md">
  <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
    {currentMonthYear} <span className="text-blue-600">Pay Out</span>
  </h2>

  {payoutResult ? (
    <div className="mb-6">
      {payoutResult.linaToAlex > payoutResult.alexToLina ? (
        <p className="text-lg">
          Lina to pay Alex:{" "}
          <span className="font-bold text-green-600">
            ${(payoutResult.linaToAlex - payoutResult.alexToLina).toFixed(2)}
          </span>
        </p>
      ) : payoutResult.alexToLina > payoutResult.linaToAlex ? (
        <p className="text-lg">
          Alex to pay Lina:{" "}
          <span className="font-bold text-green-600">
            ${(payoutResult.alexToLina - payoutResult.linaToAlex).toFixed(2)}
          </span>
        </p>
      ) : (
        <p className="text-lg text-gray-600">All settled for this month!</p>
      )}
    </div>
  ) : (
    <p className="text-gray-500">Loading payout information...</p>
  )}

  <div className="mb-6">
    <h3 className="text-lg font-medium mb-2 text-gray-700">Monthly Totals by Category:</h3>
    <ul className="text-gray-600 space-y-1">
      <li>Home: ${totalHome.toFixed(2)}</li>
      <li>Gasoline: ${totalGasoline.toFixed(2)}</li>
      <li>Eating Out: ${totalEatingOut.toFixed(2)}</li>
      <li>Groceries: ${totalGroceries.toFixed(2)}</li>
      <li>Joaquin: ${totalJoaquin.toFixed(2)}</li>
      <li>Lina: ${totalLina.toFixed(2)}</li>
    </ul>
  </div>

  <div className="mt-8 border-t pt-6">
    <Chart
      totals={{
        home: totalHome,
        gasoline: totalGasoline,
        eatingOut: totalEatingOut,
        groceries: totalGroceries,
        joaquin: totalJoaquin,
        lina: totalLina,
      }}
    />
  </div>
</div>

  );
};