import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import Expenses from './Expenses';
import Debts from './Debts';
import Charts from './Charts';
import Chatbot from './Chatbot';
import Budget from './Budget';

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
