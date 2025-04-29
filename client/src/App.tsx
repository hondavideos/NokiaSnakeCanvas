import { useState, useEffect } from 'react';
import NokiaScreen from './components/NokiaScreen';
import './index.css';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time to ensure assets are ready
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app-container">
      {loading ? (
        <div className="loading">
          <p>Loading Snake Game...</p>
        </div>
      ) : (
        <NokiaScreen />
      )}
    </div>
  );
}

export default App;
