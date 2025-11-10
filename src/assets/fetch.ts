import { Expense, Category } from "./types";
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

  export const fetchCategories = async (setter: React.Dispatch<React.SetStateAction<Category[]>>) => {
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

        setter(categoryList);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
      
    export const fetchIncomes = async (
      setAlexDocId: React.Dispatch<React.SetStateAction<string | null>>,
      setLinaDocId: React.Dispatch<React.SetStateAction<string | null>>,
      setIncome:React.Dispatch<React.SetStateAction<{ alex: string; lina: string }>>) => {
      try {
        const usersCollection = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersCollection);

        let alexIncome = "0";
        let linaIncome = "0";

        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
           console.log(doc.id,"userData")
          if (userData.name === "Alex") {
            setAlexDocId(doc.id)
            alexIncome = userData.income ? userData.income.toString() : "0";
          } else if (userData.name === "Lina") {
            setLinaDocId(doc.id)
            linaIncome = userData.income ? userData.income.toString() : "0";
          }
        });

        setIncome({ alex: alexIncome, lina: linaIncome });

      } catch (error) {
        console.error("Error fetching incomes:", error);
      }
    };