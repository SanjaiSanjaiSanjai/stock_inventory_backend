import {BrowserRouter,Routes,Route} from "react-router-dom"

// import pages file
import Signup from "./pages/Signup"
import Home from "./pages/Home"
import Login from "./pages/Login"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"
import AddProduct from "./pages/AddProduct"
import Dashboard from "./pages/Dashboard"

// import images from assets folder
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'


// app css file import
import './App.css'

function App() {

  return (
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Signup/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home/>
          </ProtectedRoute>
        }
      />
      <Route path="/add-product" element={<AdminRoute><AddProduct/></AdminRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
    </Routes>
    </BrowserRouter>
  )
}

export default App
