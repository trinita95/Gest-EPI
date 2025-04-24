export interface QueryResult {
    affectedRows?: number;
    insertId?: number,
    warningStatus?: number
}

/**
 * Interface pour les options de validations d'une requête
 */
export interface ValidationOptions {
    minLength?: number;
    exactLength?: number;
    maxLength?: number;
}

// Tous les types de requête geré 
export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';