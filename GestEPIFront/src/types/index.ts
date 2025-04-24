export enum StatutControleEnum {
    OPERATIONNEL = 1,
    A_REPARER = 2,
    MIS_AU_REBUT = 3
}

export interface TypeEpi {
    id?: number;
    libelle: string;
    periodicite_controle: number;
    est_textile: boolean;
}

export interface Epi {
    id?: number;
    identifiant_perso: string;
    marque: string;
    modele: string;
    numero_serie: string;
    taille?: string;
    couleur?: string;
    date_achat?: Date | string;
    date_fabrication?: Date | string;
    date_mise_service?: Date | string;
    periodicite_controle?: number;
    type_epi_id: number;
    type_epi?: TypeEpi;
    dernier_controle?: Date | string;
}

export interface Gestionnaire {
    id?: number;
    nom: string;
    prenom: string;
    email: string;
    password: string;
    created_at?: Date | string;
}

export interface StatutControle {
    id?: number;
    libelle: string;
}

export interface Controle {
    id?: number;
    date_controle: Date | string;
    remarques?: string;
    gestionnaire_id: number;
    epi_id: number;
    statut_id: number;
    created_at?: Date | string;
    gestionnaire?: Gestionnaire;
    epi?: Epi;
    statut?: StatutControle;
}