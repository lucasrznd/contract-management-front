import { Helmet } from 'react-helmet-async';
import CompanyForm from '../components/company/CompanyForm';

export default function CompanyPage() {
    return (
        <div>
            <Helmet>
                <title>{'EducadoraGC - Empresas'}</title>
            </Helmet>

            <CompanyForm />
        </div>
    );
}
