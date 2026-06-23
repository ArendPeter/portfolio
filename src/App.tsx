import { HashRouter, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { Stylebook } from './pages/Stylebook'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/stylebook" element={<Stylebook />} />
      </Routes>
    </HashRouter>
  )
}

export default App
