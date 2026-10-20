import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import HomePage from "../pages/Home";
import CompanyPage from "../pages/Company";
import ContractPage from "../pages/Contract";
import SellerPage from "../pages/Seller";

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/empresas" element={<CompanyPage />} />
                <Route path="/contratos" element={<ContractPage />} />
                <Route path="/vendedores" element={<SellerPage />} />
            </Routes>
        </Router>
    )
}

export default AppRoutes;