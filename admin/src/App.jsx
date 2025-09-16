import React from 'react';
import Navbar from './Components/Navbar/Navbar';
import Admin from './pages/Admin/Admin';
import { Routes, Route } from 'react-router-dom';

const App = () => {
  return (
    <div>
      <Navbar />
      <Admin/>
    </div>
  );
};

export default App;
