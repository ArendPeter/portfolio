import { HashRouter, Route, Routes } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { Stylebook } from './pages/Stylebook'
// PROTOTYPE � throwaway routes for issue #54
import { PostPagePrototype } from './pages/prototype/PostPagePrototype'
import { BlogIndexPrototype } from './pages/prototype/BlogIndexPrototype'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/stylebook" element={<Stylebook />} />
        <Route path="/prototype/post" element={<PostPagePrototype />} />
        <Route path="/prototype/blog" element={<BlogIndexPrototype />} />
      </Routes>
    </HashRouter>
  )
}

export default App
