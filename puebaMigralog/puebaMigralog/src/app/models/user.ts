import { Incident } from './incident';

export class User {
    id: number;
    name: string;
    last_name: string;
    email: string;
    phone: string;
    password: string;
    incidents: Incident[]; // Agregar la lista de incidentes
}
