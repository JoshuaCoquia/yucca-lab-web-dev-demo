import { BrowserRouter, Routes, Route } from 'react-router'
import { LikesProvider } from './LikesContext'
import IndexPage from './pages/IndexPage'
import PostPage from './pages/PostPage'

export default function App() {
  return (
    <LikesProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/posts/:slug" element={<PostPage />} />
        </Routes>
      </BrowserRouter>
    </LikesProvider>
  )
}
