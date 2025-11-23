import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Saint E-commerce</h1>
            <p>Página principal (proximamente)</p>
            <div style={{ marginTop: '2rem' }}>
              <a href="/login" style={{ marginRight: '1rem' }}>Login</a>
              <a href="/register">Registro</a>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;