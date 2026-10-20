import { Helmet } from 'react-helmet-async';
import HomeBody from '../components/home/HomeBody';

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
