import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import '@fontsource-variable/geist';
import './styles/font.css';
import './styles/primereact-sizing.css';
import AppRoutes from './routes/Routes';

export default function App() {
    return (
        <div>
            <AppRoutes />
        </div>
    );
}
