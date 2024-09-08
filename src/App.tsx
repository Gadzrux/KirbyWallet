import { Route, Routes, BrowserRouter } from "react-router-dom"
import LandingPage from "./pages/LandingPage"
import WalletPage from "./pages/WalletPage"

console.log("hello world")

function App() : JSX.Element {
  const userExists:boolean = (localStorage.getItem("mnemonics")!= null);
  return (
   <BrowserRouter>
    <Routes>
      <Route path ="/" element={userExists?<WalletPage/>:<LandingPage/>}/>
      <Route path ="/wallet" element={<WalletPage/>}/>
    </Routes>
   </BrowserRouter>
  )
}

export default App
