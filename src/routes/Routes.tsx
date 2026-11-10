import {BrowserRouter, Route, Routes} from "react-router-dom"
import NotFound from "../pages/NotFound"
import Login from "../pages/Login"
import HeatMap from "../pages/HeatMap"
import Unauthorize from "../pages/Unauthorize"


function AppRoutes(){

    return (
        <BrowserRouter>
        <Routes>
            <Route path="/heatmap" element={<HeatMap/>}></Route>
            <Route path="/" element={<Login/>}></Route>
            <Route path="/unauthorize" element={<Unauthorize/>}></Route>
            <Route path="*" element={<NotFound/>}></Route>
        </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes