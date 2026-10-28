import { Helmet } from 'react-helmet-async';
import ContractForm from '../components/contract/ContractForm';

export default function ContractPage() {
    return (
        <div>
            <Helmet>
                <title>{'EducadoraGC - Contratos'}</title>
            </Helmet>

            <ContractForm />
        </div>
    );
}
