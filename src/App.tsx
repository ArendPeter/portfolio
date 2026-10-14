import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { Stylebook } from './pages/Stylebook'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/stylebook" element={<Stylebook />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
