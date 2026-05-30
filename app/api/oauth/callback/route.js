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

    return htmlResponse('success', JSON.stringify({ token: data.access_token, provider: 'github' }))
  } catch (err) {
    return htmlResponse('error', 'OAuth exchange failed')
  }
}

function htmlResponse(status, content) {
  const message =
    status === 'success'
      ? `authorization:github:success:${content}`
      : `authorization:github:error:${content}`

  const html = `<!doctype html>
<html>
<head><title>Authenticating…</title></head>
<body>
<script>
  (function () {
    var msg = ${JSON.stringify(message)};
    function receiveMessage(e) {
      if (window.opener) {
        window.opener.postMessage(msg, '*');
      }
      window.removeEventListener('message', receiveMessage);
      setTimeout(function () { window.close(); }, 500);
    }
    window.addEventListener('message', receiveMessage, false);
    if (window.opener) {
      window.opener.postMessage('authorizing:github', '*');
    }
  })();
</script>
<p>Completing login… you can close this window.</p>
</body>
</html>`

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  })
}
