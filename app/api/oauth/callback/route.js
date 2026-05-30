export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return Response.redirect(new URL('/admin?error=no_code', request.url))
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })

    const data = await tokenRes.json()

    if (data.error || !data.access_token) {
      return Response.redirect(new URL(`/admin?error=${encodeURIComponent(data.error_description ?? 'auth_failed')}`, request.url))
    }

    const dest = new URL('/admin', request.url)
    dest.hash = `token=${data.access_token}`
    return Response.redirect(dest.toString(), 302)
  } catch {
    return Response.redirect(new URL('/admin?error=server_error', request.url))
  }
}
