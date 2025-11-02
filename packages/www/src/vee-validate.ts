import { defineRule, configure } from 'vee-validate';
import {
    email,
    max,
    min,
    required,
    url,
    regex,
    confirmed,
    min_value,
    max_value,
} from '@vee-validate/rules';
import { localize, setLocale } from '@vee-validate/i18n';
import { Language } from '@/vars/LanguageAttr';

const fr = {
    code: Language.FR,
    messages: {
        _default: 'Le champ est invalide',
        alpha: 'Le champ ne peut contenir que des lettres',
        alpha_num:
            'Le champ ne peut contenir que des caractères alphanumériques',
        alpha_dash:
            'Le champ ne peut contenir que des caractères alphanumériques, des tirets ou des underscores',
        alpha_spaces:
            'Le champ ne peut contenir que des lettres ou des espaces',
        between: 'Le champ doit être compris entre {min} et {max}',
        confirmed: 'Les champs ne correspondent pas',
        digits: 'Le champ doit être un nombre avec exactement {length} chiffres',
        dimensions:
            'Le champ doit avoir une taille de {width} pixels par {height} pixels',
        email: 'Le champ doit être une adresse e-mail valide',
        excluded: 'Le champ doit être une valeur valide',
        ext: 'Le champ doit être un fichier valide',
        image: 'Le champ doit être une image',
        integer: 'Le champ doit être un nombre entier',
        length: 'Le champ doit contenir {length} caractères',
        max_value: 'Le champ doit avoir une valeur inférieure ou égale à {max}',
        max: 'Le champ ne peut pas contenir plus de {length} caractères',
        mimes: 'Le champ doit avoir un type MIME valide',
        min_value: 'Le champ doit avoir une valeur supérieure ou égale à {min}',
        min: 'Le champ doit contenir au moins {length} caractères',
        numeric: 'Le champ ne peut contenir que des chiffres',
        one_of: 'Le champ doit être une valeur valide',
        regex: 'Le champ est invalide',
        required: 'Le champ est obligatoire',
        required_if:
            'Le champ est obligatoire lorsque {target} possède cette valeur',
        size: 'Le champ doit avoir une taille inférieure à {size} Ko',
    },
};

// Vee-validate rules
defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('max', max);
defineRule('url', url);
defineRule('regex', regex);
defineRule('min_value', min_value);
defineRule('max_value', max_value);
defineRule('confirmed', confirmed);
defineRule('password_min', (value: string) => {
    if (!value) return true;
    return value.length >= 8;
});
defineRule('password_uppercase', (value: string) => {
    if (!value) return true;
    return /[A-Z]/.test(value);
});
defineRule('password_number', (value: string) => {
    if (!value) return true;
    return /\d/.test(value);
});
defineRule('password_special', (value: string) => {
    if (!value) return true;
    return /[@$!%*?&]/.test(value);
});

configure({
    generateMessage: localize({
        fr: {
            messages: {
                ...fr.messages,
            },
        },

    }),
});

setLocale(Language.FR);
