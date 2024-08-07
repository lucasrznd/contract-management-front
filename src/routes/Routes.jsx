import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import HomePage from "../pages/Home";
import CompanyPage from "../pages/Company";

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/empresas" element={<CompanyPage />} />
            </Routes>
        </Router>
    )
}

export default AppRoutes;