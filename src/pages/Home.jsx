import { Helmet, HelmetProvider } from "react-helmet-async";
import AppFooter from "../components/footer/AppFooter";
import AppMenu from "../components/menu/AppMenu";
import HomeBody from "../components/home/HomeBody";

export default function HomePage() {
    return <div>
        <HelmetProvider>
            <Helmet>
                <title>{"EducadoraGC - Home"}</title>
            </Helmet>
        </HelmetProvider>

        <AppMenu />

        <HomeBody />

        <AppFooter />
    </div>
}