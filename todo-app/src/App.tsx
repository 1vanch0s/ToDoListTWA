import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './styles.css';
import Tasks from './pages/Tasks';
import Rewards from './pages/Rewards';
import Profile from './pages/Profile';

const App: React.FC = () => {
  return (
    <Router>
      <div className="page">
        <h1>Геймифицированный To-Do List</h1>
        <nav>
          <button className="button">
            <a href="/tasks">Задания</a>
          </button>
          <button className="button">
            <a href="/rewards">Награды</a>
          </button>
          <button className="button">
            <a href="/profile">Профиль</a>
          </button>
        </nav>

        <Routes>
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;