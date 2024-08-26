import { MegaMenu } from "primereact/megamenu";
import React from "react";
import logo from "../../../src/assets/images/logo-horizontal.png";

export default function AppMenu() {
    const items = [
        {
            label: 'Contratos',
            icon: 'pi pi-folder-open',
            url: '/contratos'
        },
        {
            label: 'Empresas',
            icon: 'pi pi-building',
            url: '/empresas'
        },
        {
            label: 'Vendedores',
            icon: 'pi pi-users',
            url: '/vendedores'
        }
    ];

    const start = <a href="/"><img alt="logo" src={logo} height={60} className="mr-2" /></a>

    return (
        <div className="card">
            <MegaMenu model={items} orientation="horizontal" start={start} breakpoint="600px" className="p-3 surface-0 shadow-2 mb-2" style={{ borderRadius: '1rem' }} />
        </div>
    )
}