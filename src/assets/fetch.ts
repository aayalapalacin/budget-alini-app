import { Expense } from "./types";
import { collection, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";


export const fetchExpenses = async (  setter: React.Dispatch<React.SetStateAction<Expense[]>>) => {
      try {
        const expensesCollection = collection(firestore, 'expenses');
        const expensesSnapshot = await getDocs(expensesCollection);

        const expensesList = expensesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            amount: data.amount || 0,
            category: data.category || ''
          } as Expense;
        });



        setter(expensesList);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };