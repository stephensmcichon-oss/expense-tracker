// App.js
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    amount: '',
    category: 'Food',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [activeTab, setActiveTab] = useState('daily');
  const [totalBudget, setTotalBudget] = useState(1000);

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    const savedBudget = localStorage.getItem('totalBudget');
    
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
    if (savedBudget) {
      setTotalBudget(parseFloat(savedBudget));
    }
  }, []);

  // Save to localStorage whenever expenses or budget changes
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('totalBudget', totalBudget);
  }, [totalBudget]);

  const addExpense = (e) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.description) return;

    const expense = {
      id: Date.now(),
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      description: newExpense.description,
      date: newExpense.date
    };

    setExpenses([...expenses, expense]);
    setNewExpense({
      amount: '',
      category: 'Food',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const getFilteredExpenses = (period) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      
      switch(period) {
        case 'daily':
          const expenseDay = new Date(expenseDate.getFullYear(), expenseDate.getMonth(), expenseDate.getDate());
          return expenseDay.getTime() === today.getTime();
        
        case 'weekly':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return expenseDate >= weekAgo && expenseDate <= today;
        
        case 'monthly':
          return expenseDate.getMonth() === now.getMonth() && 
                 expenseDate.getFullYear() === now.getFullYear();
        
        default:
          return true;
      }
    });
  };

  const getTotalForPeriod = (period) => {
    return getFilteredExpenses(period).reduce((total, expense) => total + expense.amount, 0);
  };

  const getCategoryBreakdown = (period) => {
    const filtered = getFilteredExpenses(period);
    const breakdown = {};
    
    filtered.forEach(expense => {
      if (breakdown[expense.category]) {
        breakdown[expense.category] += expense.amount;
      } else {
        breakdown[expense.category] = expense.amount;
      }
    });
    
    return breakdown;
  };

  const categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Other'];
  
  const getBudgetColor = (spent, budget) => {
    const percentage = (spent / budget) * 100;
    if (percentage > 100) return '#dc3545';
    if (percentage > 80) return '#ffc107';
    return '#28a745';
  };

  const currentTotal = getTotalForPeriod(activeTab);
  const categoryBreakdown = getCategoryBreakdown(activeTab);

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>💰 Expense Tracker</h1>
          <div className="budget-control">
            <label>Monthly Budget: $</label>
            <input
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(parseFloat(e.target.value) || 0)}
              className="budget-input"
            />
          </div>
        </header>

        {/* Budget Overview */}
        <div className="budget-overview">
          <div className="budget-card">
            <h3>Current {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Spending</h3>
            <div className="budget-amount" style={{ color: getBudgetColor(currentTotal, totalBudget) }}>
              ${currentTotal.toFixed(2)}
            </div>
            <div className="budget-bar">
              <div 
                className="budget-fill" 
                style={{ 
                  width: `${Math.min((currentTotal / totalBudget) * 100, 100)}%`,
                  backgroundColor: getBudgetColor(currentTotal, totalBudget)
                }}
              ></div>
            </div>
            <div className="budget-remaining">
              {currentTotal > totalBudget 
                ? `Over budget by $${(currentTotal - totalBudget).toFixed(2)}`
                : `$${(totalBudget - currentTotal).toFixed(2)} remaining`
              }
            </div>
          </div>
        </div>

        {/* Add Expense Form */}
        <div className="expense-form">
          <h2>Add New Expense</h2>
          <form onSubmit={addExpense}>
            <div className="form-grid">
              <input
                type="number"
                placeholder="Amount"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                step="0.01"
                min="0"
                required
              />
              <select
                value={newExpense.category}
                onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Description"
                value={newExpense.description}
                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                required
              />
              <input
                type="date"
                value={newExpense.date}
                onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="add-button">Add Expense</button>
          </form>
        </div>

        {/* Category Breakdown */}
        <div className="category-breakdown">
          <h2>Category Breakdown ({activeTab})</h2>
          <div className="category-grid">
            {categories.map(category => {
              const amount = categoryBreakdown[category] || 0;
              const percentage = currentTotal > 0 ? (amount / currentTotal) * 100 : 0;
              
              return (
                <div key={category} className="category-card">
                  <div className="category-header">
                    <span className="category-name">{category}</span>
                    <span className="category-amount">${amount.toFixed(2)}</span>
                  </div>
                  <div className="category-bar">
                    <div 
                      className="category-fill"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="category-percentage">{percentage.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expense List with Tabs */}
        <div className="expense-list">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'daily' ? 'active' : ''}`}
              onClick={() => setActiveTab('daily')}
            >
              Daily
            </button>
            <button 
              className={`tab ${activeTab === 'weekly' ? 'active' : ''}`}
              onClick={() => setActiveTab('weekly')}
            >
              Weekly
            </button>
            <button 
              className={`tab ${activeTab === 'monthly' ? 'active' : ''}`}
              onClick={() => setActiveTab('monthly')}
            >
              Monthly
            </button>
          </div>

          <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Expenses</h2>
          <div className="expenses-total">
            Total: ${currentTotal.toFixed(2)}
          </div>

          {getFilteredExpenses(activeTab).length === 0 ? (
            <p className="no-expenses">No expenses for this period</p>
          ) : (
            <div className="expense-items">
              {getFilteredExpenses(activeTab).map(expense => (
                <div key={expense.id} className="expense-item">
                  <div className="expense-info">
                    <span className="expense-description">{expense.description}</span>
                    <span className="expense-category">{expense.category}</span>
                    <span className="expense-date">{expense.date}</span>
                  </div>
                  <div className="expense-amount">
                    <span className="amount">${expense.amount.toFixed(2)}</span>
                    <button 
                      onClick={() => deleteExpense(expense.id)}
                      className="delete-button"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;