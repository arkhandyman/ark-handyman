import { execSync, spawnSync } from 'child_process'

const hasTinaCredentials =
  process.env.NEXT_PUBLIC_TINA_CLIENT_ID &&
  process.env.TINA_TOKEN

if (hasTinaCredentials) {
  console.log('Tina credentials found — building CMS admin...')
  console.log('Client ID:', process.env.NEXT_PUBLIC_TINA_CLIENT_ID)

  const result = spawnSync('npx', ['tinacms', 'build'], {
    stdio: 'inherit',
    shell: true,
  })

  if (result.status !== 0) {
    console.error('⚠️  Tina build failed — site will build without /admin.')
    console.error('Exit code:', result.status)
  } else {
    console.log('✅ Tina admin built successfully.')
  }
} else {
  console.log('No Tina credentials — skipping CMS admin build.')
}

execSync('next build', { stdio: 'inherit' })
