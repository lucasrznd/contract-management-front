import AppFooter from "../components/footer/AppFooter";
import AppMenu from "../components/menu/AppMenu";

export default function CompanyPage() {
    return <div>
        <AppMenu />

        <div className="flex align-items-center justify-content-center">
            <h1>Company Page</h1>
        </div>

        <AppFooter />
    </div>
}