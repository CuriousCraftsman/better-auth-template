import { auth } from "$lib/server/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { securityHandler } from "$lib/server/security"

export async function handle({ event, resolve }) {

    const isProtectedRoute = event.url.pathname.startsWith('/protected') ||
        event.url.pathname.startsWith('/admin') ||
        event.url.pathname.startsWith('/account');

    try {
        const session = await auth.api.getSession({
            headers: event.request.headers
        })

        event.locals.session = session

    } catch (error) {
        console.log(error)

        if (isProtectedRoute) {
            // Redirect to login or show an error
            return new Response('Unauthorized', {
                status: 401,
                headers: {
                    'Location': '/login'  // Optional redirect
                }
            });
        }
    }

    // // adds the security functions to locals to make it accessible in other server side code
    event.locals.security = securityHandler(event)

    return svelteKitHandler({ event, resolve, auth });
}