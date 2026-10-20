import type { MouseEvent } from 'react';
import { MegaMenu } from 'primereact/megamenu';
import type { MenuItem, MenuItemCommandEvent } from 'primereact/menuitem';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo-horizontal.png';

export default function AppMenu() {
    const navigate = useNavigate();

    // Keeps the href (open in new tab, copy link) but navigates without reloading the app.
    const navigateTo = (path: string): Pick<MenuItem, 'url' | 'command'> => ({
        url: path,
        command: ({ originalEvent: e }: MenuItemCommandEvent) => {
            const event = e as MouseEvent;
            if (event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            e.preventDefault();
            navigate(path);
        },
    });

    const items: MenuItem[] = [
        {
            label: 'Contratos',
            icon: 'pi pi-folder-open',
            ...navigateTo('/contratos'),
        },
        {
            label: 'Empresas',
            icon: 'pi pi-building',
            ...navigateTo('/empresas'),
        },
        {
            label: 'Vendedores',
            icon: 'pi pi-users',
            ...navigateTo('/vendedores'),
        },
    ];

    const start = (
        <Link to="/">
            <img alt="logo" src={logo} height={60} className="mr-2" />
        </Link>
    );

    return (
        <div className="card">
            <MegaMenu
                model={items}
                orientation="horizontal"
                start={start}
                breakpoint="600px"
                className="p-3 surface-0 shadow-2 mb-2"
                style={{ borderRadius: '1rem' }}
            />
        </div>
    );
}
