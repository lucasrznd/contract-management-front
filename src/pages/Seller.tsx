import { Helmet, HelmetProvider } from "react-helmet-async";
import AppFooter from "../components/footer/AppFooter";
import AppMenu from "../components/menu/AppMenu";
import SellerForm from "../components/seller/SellerForm";

export default function SellerPage() {
    return <div>
        <HelmetProvider>
            <Helmet>
                <title>{"EducadoraGC - Vendedores"}</title>
            </Helmet>
        </HelmetProvider>

        <AppMenu />

        <SellerForm />

        <AppFooter />
    </div>
}