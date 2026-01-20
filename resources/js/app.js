import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/vue3';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { i18nVue } from 'laravel-vue-i18n';
import DefaultLayout from './layouts/DefaultLayout.vue';

createInertiaApp({
    title: (title) => title ? `FindMyAisle - ${title}` : 'FindMyAisle',
    resolve: (name) => {
        const page = resolvePageComponent(`./pages/${name}.vue`, import.meta.glob('./pages/**/*.vue'));
        // Apply default layout to all pages unless they specify their own
        page.then((module) => {
            module.default.layout = module.default.layout || DefaultLayout;
        });
        return page;
    },
    setup({ el, App, props, plugin }) {
        createApp({ render: () => h(App, props) })
            .use(plugin)
            .use(i18nVue, {
                resolve: async lang => {
                    const langs = import.meta.glob('../../lang/*.json');
                    return await langs[`../../lang/${lang}.json`]();
                },
            })
            .mount(el);
    },
});