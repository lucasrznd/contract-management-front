import { Helmet } from 'react-helmet-async';
import HomeBody from '@/features/home/components/HomeBody';

export default function HomePage() {
    return (
        <div>
            <Helmet>
                <title>{'EducadoraGC - Home'}</title>
            </Helmet>

            <HomeBody />
        </div>
    );
}
