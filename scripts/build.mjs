import { execSync } from 'child_process'

const hasTinaCredentials =
  process.env.NEXT_PUBLIC_TINA_CLIENT_ID &&
  process.env.TINA_TOKEN

if (hasTinaCredentials) {
  console.log('Tina credentials found — building CMS admin...')
  execSync('npx tinacms build', { stdio: 'inherit' })
} else {
  console.log('No Tina credentials — skipping CMS admin build.')
}

execSync('next build', { stdio: 'inherit' })
