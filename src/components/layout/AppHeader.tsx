import type { ComponentType } from 'react';
import { Link, NavLink } from 'react-router-dom';
import logo from '../../assets/images/logo-header.png';
import { BuildingIcon, FolderIcon, UsersIcon, type IconProps } from '../icons';
import styles from './AppHeader.module.css';

const navItems: { to: string; label: string; icon: ComponentType<IconProps> }[] = [
    { to: '/contratos', label: 'Contratos', icon: FolderIcon },
    { to: '/empresas', label: 'Empresas', icon: BuildingIcon },
    { to: '/vendedores', label: 'Vendedores', icon: UsersIcon },
];

export default function AppHeader() {
    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <Link to="/" className={styles.brand}>
                    <img src={logo} alt="Rádio Educadora" className={styles.logo} />
                </Link>

                <nav className={styles.nav} aria-label="Principal">
                    {navItems.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
                        >
                            <Icon size={18} />
                            {label}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </header>
    );
}
