import { BrowserRouter, Routes, Route } from 'react-router'
import IndexPage from './pages/IndexPage'
import PostPage from './pages/PostPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/posts/:slug" element={<PostPage />} />
      </Routes>
    </BrowserRouter>
  )
}
