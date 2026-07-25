/**
 * sessionInterceptor.ts
 *
 * A fetch wrapper that intercepts 401 sessionRevoked responses
 * and automatically logs the admin user out.
 */

export async function adminFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const response = await fetch(url, options);

  if (response.status === 401) {
    try {
      const cloned = response.clone();
      const data = await cloned.json();
      if (data.sessionRevoked) {
        console.warn('🔒 Admin session revoked — logging out.');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.dispatchEvent(new CustomEvent('admin_session_revoked'));
        if (typeof window !== 'undefined') {
          window.location.href = '/login?session_expired=1';
        }
      }
    } catch {
      // ignore JSON parse errors
    }
  }

  return response;
}
