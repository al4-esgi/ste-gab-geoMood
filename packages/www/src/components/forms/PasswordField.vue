<script setup lang="ts">
import { RouteName } from '@/vars/RouteAttr';
import { useField } from 'vee-validate';
import { computed, ref, useAttrs, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import GhostButton from '../ui/GhostButton.vue';
import { Divider, InputIcon, IconField, Password } from 'primevue';

type ModelValue = string | undefined;

type Props = {
    name: string;
    iconLeft?: string;
    iconRight?: string;
    fluid?: boolean;
    label?: string;
    toggleMask?: boolean;
    feedback?: boolean;
    showForgotPassword?: boolean;
    rules?: string | Record<string, any>;
};

const props = withDefaults(defineProps<Props>(), {
    iconLeft: '',
    iconRight: '',
    fluid: true,
    label: '',
    toggleMask: true,
    feedback: true,
    showForgotPassword: true,
    rules: '',
});

defineEmits<{
    (e: 'update:modelValue', value?: ModelValue): void;
    (e: 'iconLeftClick'): void;
    (e: 'iconRightClick'): void;
}>();

const fieldNameToConfirm = ref('');

const attrs = useAttrs();
const { t } = useI18n();

const validationRules = computed(() => {
    const rules: {
        required?: boolean;
        password_min?: boolean;
        password_uppercase?: boolean;
        password_number?: boolean;
        password_special?: boolean;
    } = {};

    if (props.rules?.includes('required')) {
        rules.required = true;
    }

    if (props.feedback) {
        rules.password_min = true;
        rules.password_uppercase = true;
        rules.password_number = true;
        rules.password_special = true;
    }

    return rules;
});

const {
    value: fieldValue,
    errorMessage,
    handleBlur,
    handleChange,
    setErrors,
} = useField(props.name, validationRules, {
    initialValue: '',
});
const { value: confirmPasswordValue } = useField(fieldNameToConfirm);

const hasLeftIcon = computed(() => !!props.iconLeft);
const hasRightIcon = computed(() => !!props.iconRight);
const required = computed(() => validationRules.value.required);

const fieldAttrs = computed(() => ({
    value: fieldValue.value,
    onBlur: handleBlur,
    'onUpdate:modelValue': (val: any) => {
        fieldValue.value = val;
        handleChange(val);
    },
    ...attrs,
}));

const confirmPassword = computed(() => {
    if (props.rules.includes('confirmed')) {
        fieldNameToConfirm.value = props.rules.split(':')[1];
        return true;
    }
    return false;
});

const isSamePassword = computed(() => {
    if (
        confirmPassword.value &&
        fieldValue.value !== confirmPasswordValue.value
    ) {
        setErrors(t('forms.password.errors.not_match'));
    }
});

const passwordRequirements = computed(() => {
    if (!fieldValue.value && props.feedback) {
        return {
            minLength: false,
            uppercase: false,
            numeric: false,
            special: false,
        };
    }

    return {
        minLength: fieldValue.value.length >= 8,
        uppercase: /[A-Z]/.test(fieldValue.value),
        numeric: /\d/.test(fieldValue.value),
        special: /[@$!%*?&]/.test(fieldValue.value),
    };
});

watch(confirmPasswordValue, () => {
    if (
        confirmPassword.value &&
        confirmPasswordValue.value !== fieldValue.value
    ) {
        setErrors(t('forms.password.errors.not_match'));
    } else {
        setErrors('');
    }
});
</script>

<template>
    <div class="password-field">
        <div class="password-field__label-container">
            <label
                :for="name"
                class="text-sm"
                :class="required ? 'password-field__label--required' : ''"
            >
                <slot>{{ label }}</slot>
            </label>
        </div>

        <IconField v-if="hasLeftIcon || hasRightIcon">
            <InputIcon
                v-if="hasLeftIcon"
                :class="iconLeft"
                position="left"
                @click="$emit('iconLeftClick')"
            />
            <Password
                v-bind="fieldAttrs"
                :class="{ 'p-invalid': errorMessage || isSamePassword }"
                :feedback="feedback"
                :toggleMask="toggleMask"
                :promptLabel="t('forms.password.prompt_label')"
                :weakLabel="t('forms.password.weak_label')"
                :mediumLabel="t('forms.password.medium_label')"
                :strongLabel="t('forms.password.strong_label')"
                :fluid="fluid"
                type="password"
            >
                <template v-if="feedback" #footer>
                    <Divider />
                    <ul class="password-field__rules text-sm">
                        <li
                            :class="{
                                'password-field__rule--valid':
                                    passwordRequirements.minLength &&
                                    fieldValue,
                                'password-field__rule--invalid':
                                    !passwordRequirements.minLength &&
                                    fieldValue,
                            }"
                        >
                            {{ t('forms.password.min_length') }}
                        </li>
                        <li
                            :class="{
                                'password-field__rule--valid':
                                    passwordRequirements.uppercase &&
                                    fieldValue,
                                'password-field__rule--invalid':
                                    !passwordRequirements.uppercase &&
                                    fieldValue,
                            }"
                        >
                            {{ t('forms.password.uppercase') }}
                        </li>
                        <li
                            :class="{
                                'password-field__rule--valid':
                                    passwordRequirements.numeric && fieldValue,
                                'password-field__rule--invalid':
                                    !passwordRequirements.numeric && fieldValue,
                            }"
                        >
                            {{ t('forms.password.numeric') }}
                        </li>
                        <li
                            :class="{
                                'password-field__rule--valid':
                                    passwordRequirements.special && fieldValue,
                                'password-field__rule--invalid':
                                    !passwordRequirements.special && fieldValue,
                            }"
                        >
                            {{ t('forms.password.special') }}
                        </li>
                    </ul>
                </template>
            </Password>
            <InputIcon
                v-if="hasRightIcon"
                :class="iconRight"
                class="password-field__pointer"
                position="right"
                @click="$emit('iconRightClick')"
            />
        </IconField>

        <Password
            v-else
            v-bind="fieldAttrs"
            :class="{ 'p-invalid': errorMessage }"
            :feedback="feedback"
            :toggleMask="toggleMask"
            :promptLabel="t('forms.password.prompt_label')"
            :weakLabel="t('forms.password.weak_label')"
            :mediumLabel="t('forms.password.medium_label')"
            :strongLabel="t('forms.password.strong_label')"
            :fluid="fluid"
            type="password"
        >
            <template v-if="feedback" #footer>
                <Divider />
                <ul class="password-field__rules text-sm">
                    <li
                        :class="{
                            'password-field__rule--valid':
                                passwordRequirements.minLength && fieldValue,
                            'password-field__rule--invalid':
                                !passwordRequirements.minLength && fieldValue,
                        }"
                    >
                        {{ t('forms.password.min_length') }}
                    </li>
                    <li
                        :class="{
                            'password-field__rule--valid':
                                passwordRequirements.uppercase && fieldValue,
                            'password-field__rule--invalid':
                                !passwordRequirements.uppercase && fieldValue,
                        }"
                    >
                        {{ t('forms.password.uppercase') }}
                    </li>
                    <li
                        :class="{
                            'password-field__rule--valid':
                                passwordRequirements.numeric && fieldValue,
                            'password-field__rule--invalid':
                                !passwordRequirements.numeric && fieldValue,
                        }"
                    >
                        {{ t('forms.password.numeric') }}
                    </li>
                    <li
                        :class="{
                            'password-field__rule--valid':
                                passwordRequirements.special && fieldValue,
                            'password-field__rule--invalid':
                                !passwordRequirements.special && fieldValue,
                        }"
                    >
                        {{ t('forms.password.special') }}
                    </li>
                </ul>
            </template>
        </Password>
        <span v-if="errorMessage" class="password-field__error">
            {{ errorMessage }}
        </span>
    </div>
</template>

<style lang="scss" scoped>
.password-field {
    display: flex;
    flex-direction: column;
    gap: var(--scale-2r);

    &__label-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    &__label {
        &--required::after {
            content: '*';
            margin-left: 4px;
            color: red;
        }
    }

    &__error {
        font-size: 0.75em;
        color: red;
        margin-top: 0.25em;
    }

    &__pointer {
        cursor: pointer;
    }

    &__rules {
        color: var(--color-description);
        list-style-type: none;
        padding-left: 0;
        margin: 0.5rem 0;
    }

    &__rule {
        &--valid {
            color: var(--color-success, green);
            position: relative;
            padding-left: 1.5rem;

            &:before {
                content: '✓';
                position: absolute;
                left: 0;
            }
        }

        &--invalid {
            color: var(--color-danger, red);
            position: relative;
            padding-left: 1.5rem;

            &:before {
                content: '✗';
                position: absolute;
                left: 0;
            }
        }
    }
}

::v-deep(.p-invalid) {
    .p-password-input,
    input {
        border-color: red !important;
    }
}
</style>

<i18n lang="json">
{
    "fr": {
        "forms": {
            "password": {
                "min_length": "Mínimo de 8 caracteres",
                "uppercase": "Pelo menos uma letra maiúscula",
                "numeric": "Pelo menos um número",
                "special": "Pelo menos um caractere especial",
                "forgot_password": "Esqueceu a senha?",
                "prompt_label": "Digite a senha",
                "weak_label": "Fraca",
                "medium_label": "Média",
                "strong_label": "Forte",
                "errors": {
                    "not_match": "As senhas não correspondem"
                }
            }
        }
    }
}
</i18n>
