import type { DirectiveBinding } from 'vue';

const scriptTagsRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gim;

export function vSafeHtml(el: HTMLElement, binding: DirectiveBinding<string>) {
    el.innerHTML = binding.value?.replace(scriptTagsRegex, '');
}
