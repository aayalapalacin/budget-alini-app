import React from "react";

interface Expense {
  id?: string;
  name: string;
  amount: number;
  category: string;
  timestamp?: Date;
  isEditing?: boolean;
}

interface PurchaseViewProps {
  selectedPurchaseCategory: string;
  purchaseCategoriesFiltered: string[];
  filteredExpenses: Expense[];
  editablePersonCategories: string[];
  editingExpenseId: string | null;
  tempEditedExpense: Partial<Expense> | null;
  handleCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleDeletePurchase: (id: string) => void;
  handleStartEditPurchase: (expense: Expense) => void;
  handleCancelEdit: () => void;
  handleEditedValueChange: (field: keyof (Expense & { timestamp?: Date }), value: any) => void;
  handleSavePurchase: (id: string) => void;
  formatDateForInput: (date?: Date) => string;
  formatDisplayDate: (date?: Date) => string;
}

const PurchaseView: React.FC<PurchaseViewProps> = ({
  selectedPurchaseCategory,
  purchaseCategoriesFiltered,
  filteredExpenses,
  editablePersonCategories,
  editingExpenseId,
  tempEditedExpense,
  handleCategoryChange,
  handleDeletePurchase,
  handleStartEditPurchase,
  handleCancelEdit,
  handleEditedValueChange,
  handleSavePurchase,
  formatDateForInput,
  formatDisplayDate
}) => (
  <>
    <label htmlFor="category" className="block text-sm font-bold mt-4">
      Filter By Category:
    </label>
    <select
      id="category"
      className="w-full p-2 border rounded"
      value={selectedPurchaseCategory}
      onChange={handleCategoryChange}
    >
      {purchaseCategoriesFiltered.map(cat => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>
<div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">

    <ul>
      {filteredExpenses.map(expense => (
        <li key={expense.id} className="p-4 border-b">
          {editingExpenseId === expense.id ? (
            <div className="space-y-2">
              <input
                type="text"
                value={tempEditedExpense?.name || ""}
                onChange={e => handleEditedValueChange('name', e.target.value)}
                className="w-full p-2 border"
              />
              <input
                type="number"
                value={tempEditedExpense?.amount || 0}
                onChange={e => handleEditedValueChange('amount', parseFloat(e.target.value))}
                className="w-full p-2 border"
              />
              <select
                value={tempEditedExpense?.category || ""}
                onChange={e => handleEditedValueChange('category', e.target.value)}
                className="w-full p-2 border"
              >
                {editablePersonCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <input
                type="date"
                value={formatDateForInput(tempEditedExpense?.timestamp)}
                onChange={e => handleEditedValueChange('timestamp', e.target.value)}
                className="w-full p-2 border"
              />
              <div className="flex justify-end space-x-2">
                <button onClick={() => handleSavePurchase(expense.id!)} className="bg-green-500 text-white px-3 py-1 rounded">Save</button>
                <button onClick={handleCancelEdit} className="bg-gray-300 px-3 py-1 rounded">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold">{expense.name}</div>
                <div>Amount: ${expense.amount.toFixed(2)}</div>
                <div>Category: {expense.category}</div>
                <div>Date: {formatDisplayDate(expense.timestamp)}</div>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => handleStartEditPurchase(expense)} className="bg-blue-500 text-white px-3 py-1 rounded">Edit</button>
                <button onClick={() => handleDeletePurchase(expense.id!)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
</div>
  </>
);

export default PurchaseView;
