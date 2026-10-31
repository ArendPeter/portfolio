import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AboutPage } from './pages/AboutPage'
import { Stylebook } from './pages/Stylebook'
import { PostPage } from './pages/PostPage'
import { BlogIndex } from './pages/posts/BlogIndex'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Homepage: to swap it, change this element and the matching line in postsPlugin.ts */}
        <Route path="/" element={<BlogIndex />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/stylebook" element={<Stylebook />} />
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/:slug" element={<PostPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
