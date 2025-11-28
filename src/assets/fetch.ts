import { Expense, Category } from "./types";
import { collection, getDocs, updateDoc, doc, deleteDoc,Timestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";


export const fetchExpenses = async (  setter: React.Dispatch<React.SetStateAction<Expense[]>>) => {
      try {
        const expensesCollection = collection(firestore, 'expenses');
        const expensesSnapshot = await getDocs(expensesCollection);

        const expensesList = expensesSnapshot.docs.map(doc => {
          const data = doc.data();
          const timestamp =
                    data.timestamp instanceof Timestamp
                      ? data.timestamp.toDate()
                      : undefined;
          return {
            id: doc.id,
            name: data.name || '',
            amount: data.amount || 0,
            category: data.category || '',
            timestamp
          } as Expense;
        });

 expensesList.sort(
        (a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0)
      );

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
        return categoryList;
      } catch (error) {
        console.error("Error fetching categories:", error);
        return []
      }
    };
      
    export const fetchIncomes = async (
      setAlexDocId: React.Dispatch<React.SetStateAction<string | null>>,
      setLinaDocId: React.Dispatch<React.SetStateAction<string | null>>,
      setIncome:React.Dispatch<React.SetStateAction<{ alex: number; lina: number }>>) => {
      try {
        const usersCollection = collection(firestore, 'users');
        const usersSnapshot = await getDocs(usersCollection);

        let alexIncome = 0;
        let linaIncome = 0;

        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.name === "Alex") {
            setAlexDocId(doc.id)
            alexIncome = userData.income ? userData.income : 0;
          } else if (userData.name === "Lina") {
            setLinaDocId(doc.id)
            linaIncome = userData.income ? userData.income : 0;
          }
        });

        setIncome({ alex: alexIncome, lina: linaIncome });

      } catch (error) {
        console.error("Error fetching incomes:", error);
      }
    };