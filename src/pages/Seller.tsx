import { Helmet } from 'react-helmet-async';
import SellerForm from '../components/seller/SellerForm';

export default function SellerPage() {
    return (
        <div>
            <Helmet>
                <title>{'EducadoraGC - Vendedores'}</title>
            </Helmet>

            <SellerForm />
        </div>
    );
}
