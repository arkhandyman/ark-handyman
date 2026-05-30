import { redirect } from 'next/navigation'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const provider = searchParams.get('provider')

  if (provider !== 'github') {
    return new Response('Unsupported provider', { status: 400 })
  }

  const clientId = process.env.GITHUB_CLIENT_ID
  if (!clientId) {
    return new Response('GITHUB_CLIENT_ID not configured', { status: 500 })
  }

  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'repo,user',
    state: searchParams.get('state') ?? '',
  })

  return redirect(`https://github.com/login/oauth/authorize?${params}`)
}
