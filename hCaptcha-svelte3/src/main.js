import App from './App.svelte'

const app = new App({
    target: document.body,
    props: {
        props: {
            languageOverride: 'world',
            endpoint: ``,
            sitekey: `e3fc726f-2141-4dad-84ea-88cdf0e8d5ea`,
            size: ``,
            theme: ``,
            tabindex: ``,
        },
    },
})

export default app
