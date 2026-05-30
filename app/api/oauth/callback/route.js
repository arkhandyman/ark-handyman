export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  if (!code) {
    return htmlResponse('error', 'No code received from GitHub')
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        state,
      }),
    })

    const data = await tokenRes.json()

    if (data.error || !data.access_token) {
      return htmlResponse('error', data.error_description ?? 'Failed to get access token')
    }

    return htmlResponse('success', data.access_token)
  } catch (err) {
    return htmlResponse('error', 'OAuth exchange failed')
  }
}

function htmlResponse(status, token) {
  const msg =
    status === 'success'
      ? `authorization:github:success:{"token":"${token}","provider":"github"}`
      : `authorization:github:error:${token}`

  const html = `<!doctype html><html><body><script>
  (function() {
    function receiveMessage(e) {
      window.opener.postMessage('${msg}', e.origin);
    }
    window.addEventListener('message', receiveMessage, false);
    window.opener.postMessage('authorizing:github', '*');
  })();
</scr` + `ipt></body></html>`

  return new Response(html, { headers: { 'Content-Type': 'text/html' } })
}
