// Ficheiro: src/App.js

import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import './App.css';

// 1. Importar o BrowserRouter
import { BrowserRouter } from 'react-router-dom';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="App">
      {!session ? (
        <LoginPage />
      ) : (
        // 2. Envolver o DashboardPage com o BrowserRouter
        <BrowserRouter>
          <DashboardPage session={session} />
        </BrowserRouter>
      )}
    </div>
  );
}

export default App;