import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Seed mock users for Admin/Partner demo if empty
if (!localStorage.getItem('usersDB')) {
  const mockUsers = [
    { fullName: 'Rahul Sharma', email: 'rahul@example.com', role: 'user', joinedAt: new Date().toISOString() },
    { fullName: 'Mysore Karanji Official', email: 'partner@test.com', role: 'partner', joinedAt: new Date().toISOString() },
    { fullName: 'Guru Raja', email: 'guru@example.com', role: 'partner', joinedAt: new Date().toISOString() }
  ];
  localStorage.setItem('usersDB', JSON.stringify(mockUsers));
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)