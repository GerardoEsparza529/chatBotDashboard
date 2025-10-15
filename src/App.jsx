import { useState } from 'react'
import Header from './components/Layout/Header'
import Dashboard from './components/Dashboard/Dashboard'
import './App.css'

function App() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simular carga
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  return (
    <div className="app">
      <Header onRefresh={handleRefresh} isRefreshing={isRefreshing} />
      <main className="main-content">
        <Dashboard onRefresh={handleRefresh} isRefreshing={isRefreshing} />
      </main>
    </div>
  )
}

export default App
