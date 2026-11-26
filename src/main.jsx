import React from 'react';
import ReactDOM from 'react-dom/client';
import './amplify-config';
import AuthGate from './Auth';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthGate>
      <App />
    </AuthGate>
  </React.StrictMode>
);
