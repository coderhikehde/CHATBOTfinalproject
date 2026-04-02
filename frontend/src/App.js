import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import ChatSidebar from './components/ChatSidebar';
import ChatView from './components/ChatView';
import DashboardView from './components/DashboardView';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [activeView, setActiveView] = useState('chat');

  const handleLogin = (user) => {
    setUsername(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex bg-[#020205] text-white min-h-screen">
      <ChatSidebar 
        username={username} 
        activeView={activeView} 
        onViewChange={setActiveView} 
        onLogout={handleLogout} 
      />
      <main className="flex-1">
        {activeView === 'chat' ? (
          <ChatView username={username} />
        ) : (
          <DashboardView username={username} />
        )}
      </main>
    </div>
  );
}

export default App;
