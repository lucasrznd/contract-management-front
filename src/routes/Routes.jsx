import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import HomePage from "../pages/Home";
import CompanyPage from "../pages/Company";
import ContractPage from "../pages/Contract";

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/empresas" element={<CompanyPage />} />
                <Route path="/contratos" element={<ContractPage />} />
            </Routes>
        </Router>
    )
}

export default AppRoutes;