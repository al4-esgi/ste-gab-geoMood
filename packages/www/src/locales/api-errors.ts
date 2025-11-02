import { ErrorCodes } from '@/vars/ErrorCodesAttr';

type ErrorMessages = {
    [key: string]: string;
    [key: number]: string;
};

export const API_ERRORS: Record<string, ErrorMessages> = {
    fr: {
        [ErrorCodes.UNAUTHORIZED]:
            "Vous n'êtes pas autorisé à accéder à cette ressource",
        [ErrorCodes.FORBIDDEN]:
            "Vous n'avez pas la permission d'accéder à cette ressource",
        [ErrorCodes.BAD_REQUEST]:
            "La requête n'a pas pu être traitée en raison d'une erreur du client",
        [ErrorCodes.INTERNAL_SERVER_ERROR]:
            'Erreur interne du serveur. Veuillez réessayer plus tard',
        [ErrorCodes.NOT_FOUND]: 'La ressource demandée est introuvable',
        [ErrorCodes.CONFLICT]:
            "L'opération n'a pas pu être effectuée en raison d'un conflit avec l'état actuel de la ressource",
        [ErrorCodes.GONE]: "La ressource demandée n'est plus disponible",
        [ErrorCodes.UNKNOWN_ERROR]:
            'Une erreur inconnue est survenue. Veuillez réessayer plus tard',
    },
};
