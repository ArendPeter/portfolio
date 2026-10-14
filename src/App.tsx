import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { Stylebook } from './pages/Stylebook'
import { BlogIndex } from './pages/posts/BlogIndex'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/stylebook" element={<Stylebook />} />
        <Route path="/blog" element={<BlogIndex />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
