import { useState, useEffect } from 'react';
import api from './api/client';
import './App.css';

function App() {
  const [statusMessage, setStatusMessage] = useState('Connecting to backend...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if backend api is reachable
    api.get('/api/health/')
      .then((response) => {
        if (response.data.status === 'ok') {
          setStatusMessage('Backend connected');
        } else {
          setStatusMessage('Backend returned unexpected response');
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error connecting to backend:', error);
        setStatusMessage('Backend not connected');
        setLoading(false);
      });
  }, []);

  return (
    <div className="card">
      <h1>Syllabus-based Smart Library &amp; Learning Platform</h1>
      <p>Status: {loading ? 'Loading...' : statusMessage}</p>
    </div>
  );
}

export default App;
