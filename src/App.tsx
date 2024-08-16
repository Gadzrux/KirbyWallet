import { Route, Routes, BrowserRouter } from "react-router-dom"
import LandingPage from "./pages/LandingPage"
import WalletPage from "./pages/WalletPage"
function App() : JSX.Element {
  // const userExists:boolean = (localStorage.getItem("mnemonics")!= null);
  const userExists:boolean = false
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
