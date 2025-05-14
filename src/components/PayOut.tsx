"use client";
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "@/lib/firebase";

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
console.log(expenses,"expenses")
  expenses.forEach((expense) => {

    
    if (['home', 'gasoline', 'eating out', 'groceries', 'joaquin'].includes(expense.category)) {
      // Split these bills in half
      const halfAmount = expense.amount / 2;
      if (expense.purchaser === 'alex') {
        linaOwesAlex += halfAmount;
      } else if (expense.purchaser === 'lina') {
        alexOwesLina += halfAmount;
      }
    } else if (expense.category === 'alex debit') {
      // Lina pays Alex for half the amount
      linaOwesAlex += expense.amount / 2;
    } else if (expense.category === 'lina debit') {
      // Alex pays Lina for half the amount
      alexOwesLina += expense.amount / 2;
    } else if (expense.category === 'lina purchase' || expense.category === 'lina expense'){
      // Lina pays Alex the full amount
      linaOwesAlex += expense.amount;
    }
    // We can add more categories and rules here as needed
  });

  return { linaToAlex: parseFloat(linaOwesAlex.toFixed(2)), alexToLina: parseFloat(alexOwesLina.toFixed(2)) };
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
      <h2 className="text-xl font-semibold mb-4">{currentMonthYear} Pay Out</h2>
      {payoutResult ? (
        <div>
          {payoutResult.linaToAlex > payoutResult.alexToLina ? (
            <p className="text-lg">
              Lina to pay Alex: <span className="font-bold">${(payoutResult.linaToAlex - payoutResult.alexToLina).toFixed(2)}</span>
            </p>
          ) : payoutResult.alexToLina > payoutResult.linaToAlex ? (
            <p className="text-lg">
              Alex to pay Lina: <span className="font-bold">${(payoutResult.alexToLina - payoutResult.linaToAlex).toFixed(2)}</span>
            </p>
          ) : (
            <p className="text-lg">All settled for this month!</p>
          )}
        </div>
      ) : (
        <p>Loading payout information...</p>
      )}
      <div>
          <h3 className="text-lg font-medium mb-2">Monthly Totals by Category:</h3>
          <p>Home: ${totalHome.toFixed(2)}</p>
          <p>Gasoline: ${totalGasoline.toFixed(2)}</p>
          <p>Eating Out: ${totalEatingOut.toFixed(2)}</p>
          <p>Groceries: ${totalGroceries.toFixed(2)}</p>
          <p>Joaquin: ${totalJoaquin.toFixed(2)}</p>
          <p>Lina : ${totalLina.toFixed(2)}</p>
      </div>
    </div>
  );
};