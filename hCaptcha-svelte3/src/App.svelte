<script>
    import { writable } from 'svelte/store'
    import { onMount, onDestroy } from 'svelte'
    import { HCAPTCHA_SITE_KEY } from '../properties.js'

    export let props = {}

    $: {
        if (props) {
            removeCaptcha()
            renderCaptcha()
        }
    }
    // Borrowed from https://github.com/ai/nanoid/blob/3.0.2/non-secure/index.js
    // This alphabet uses `A-Za-z0-9_-` symbols. A genetic algorithm helped
    // optimize the gzip compression for this alphabet.
    const urlAlphabet =
        'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW'

    const nanoid = (size = 21) => {
        let id = ''
        // A compact alternative for `for (var i = 0; i < step; i++)`.
        let i = size
        while (i--) {
            // `| 0` is more compact and faster than `Math.floor()`.
            id += urlAlphabet[(Math.random() * 64) | 0]
        }
        return id
    }

    const state = writable({
        isApiReady: typeof hcaptcha !== 'undefined',
        isRemoved: false,
        elementId: props.id || `hcaptcha-${nanoid()}`,
        captchaId: '',
    })

    // Create script to init hCaptcha
    const CaptchaScript = (cb, hl) => {
        let script = document.createElement('script')

        window.hcaptchaOnLoad = cb
        script.src =
            'https://hcaptcha.com/1/api.js?render=explicit&onload=hcaptchaOnLoad'
        script.async = true

        if (hl) {
            script.src += `&hl=${hl}`
        }

        return script
    }

onMount(function() {
const { languageOverride } = props;
const { isApiReady, elementId } = $state

        if (!isApiReady) {
            //Check if hCaptcha has already been loaded, if not create script tag and wait to render captcha elementID - hCaptcha
            let script = CaptchaScript(handleOnLoad, languageOverride)
            document.getElementById(elementId).appendChild(script)
        } else {
            renderCaptcha()
        }
    })

    onDestroy(function() {
        const { isApiReady, isRemoved, captchaId } = $state
        if (!isApiReady || isRemoved) return

        // Reset any stored variables / timers when unmounting
        hcaptcha.reset(captchaId)
        hcaptcha.remove(captchaId)
    })

    function renderCaptcha() {
        const { isApiReady, elementId } = $state
        if (!isApiReady) return

        //Render hCaptcha widget and provide neccessary callbacks - hCaptcha
        const captchaId = hcaptcha.render(document.getElementById(elementId), {
            ...props,
            'error-callback': handleError,
            'expired-callback': handleExpire,
            callback: handleSubmit,
        })

        $state.isRemoved = false
        $state.captchaId = captchaId
    }

    function resetCaptcha() {
        const { isApiReady, isRemoved, captchaId } = $state

        if (!isApiReady || isRemoved) return
        // Reset captcha state, removes stored token and unticks checkbox
        hcaptcha.reset(captchaId)
    }

    function removeCaptcha() {
        const { isApiReady, isRemoved, captchaId } = $state

        if (!isApiReady || isRemoved) return

        $state.isRemoved = true
        hcaptcha.remove(captchaId)
    }

    function handleOnLoad() {
        $state.isApiReady = true
        renderCaptcha()
    }

    function handleSubmit(event) {
        const { onVerify } = props
        const { isRemoved, captchaId } = $state

        if (typeof hcaptcha === 'undefined' || isRemoved) return

        const token = hcaptcha.getResponse(captchaId) //Get response token from hCaptcha widget - hCaptcha
        onVerify(token) //Dispatch event to verify user response
    }

    function handleExpire() {
        const { onExpire } = props
        const { isApiReady, isRemoved, captchaId } = $state

        if (!isApiReady || isRemoved) return
        hcaptcha.reset(captchaId) // If hCaptcha runs into error, reset captcha - hCaptcha

        if (onExpire) onExpire()
    }

    function handleError(event) {
        const { onError } = props
        const { isApiReady, isRemoved, captchaId } = $state

        if (!isApiReady || isRemoved) return

        hcaptcha.reset(captchaId) // If hCaptcha runs into error, reset captcha - hCaptcha
        if (onError) onError(event)
    }

    function execute() {
        const { isApiReady, isRemoved, captchaId } = $state

        if (!isApiReady || isRemoved) return

        hcaptcha.execute(captchaId)
    }
</script>

<div
    id="{$state.elementId}"
    class="h-captcha"
    data-site-key="{HCAPTCHA_SITE_KEY}"
></div>
