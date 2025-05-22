import React from 'react';
import ModelViewer from './components/ModelViewer';
import './App.css';

function App() {
  const handleViewChange = (view: string) => {
    console.log('View changed:', view);
  };

  return (
    <div className="App">
      <ModelViewer onViewChange={handleViewChange} />
    </div>
  );
}

export default App;
