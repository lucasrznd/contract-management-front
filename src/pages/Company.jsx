import { Helmet, HelmetProvider } from "react-helmet-async";
import AppFooter from "../components/footer/AppFooter";
import AppMenu from "../components/menu/AppMenu";
import CompanyForm from "../components/company/CompanyForm";

export default function CompanyPage() {
    return <div>
        <HelmetProvider>
            <Helmet>
                <title>{"EducadoraGC - Empresas"}</title>
            </Helmet>
        </HelmetProvider>

        <AppMenu />

        <CompanyForm />

        <AppFooter />
    </div>
}