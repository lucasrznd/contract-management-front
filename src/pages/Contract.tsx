import { Helmet, HelmetProvider } from "react-helmet-async";
import AppFooter from "../components/footer/AppFooter";
import AppMenu from "../components/menu/AppMenu";
import ContractForm from "../components/contract/ContractForm";

export default function ContractPage() {
    return <div>
        <HelmetProvider>
            <Helmet>
                <title>{"EducadoraGC - Contratos"}</title>
            </Helmet>
        </HelmetProvider>

        <AppMenu />

        <ContractForm />

        <AppFooter />
    </div>
}