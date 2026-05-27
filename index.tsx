import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './src/pages/Login';
import Register from './src/pages/Register';
import Dashboard from './src/pages/Dashboard';
import Expenses from './src/pages/Expenses';
import Debts from './src/pages/Debts';
import Charts from './src/pages/Charts';
import Chatbot from './src/pages/Chatbot';
import Budget from './src/pages/Budget';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/debts" element={<Debts />} />
        <Route path="/charts" element={<Charts />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/budget" element={<Budget />} />
      </Routes>
    </Router>
  );
};

export default App;
