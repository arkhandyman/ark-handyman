import { defineConfig } from 'tinacms'

export default defineConfig({
  branch: process.env.GITHUB_BRANCH ?? process.env.VERCEL_GIT_COMMIT_REF ?? 'main',
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID ?? '',
  token: process.env.TINA_TOKEN ?? '',

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },

  media: {
    tina: {
      mediaRoot: 'uploads',
      publicFolder: 'public',
    },
  },

  schema: {
    collections: [
      {
        name: 'post',
        label: 'Blog Posts',
        path: 'content/blog',
        format: 'md',
        ui: {
          filename: {
            readonly: false,
            slugify: (values) =>
              (values?.title ?? '')
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-'),
          },
        },
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Title',
            isTitle: true,
            required: true,
          },
          {
            type: 'datetime',
            name: 'date',
            label: 'Publish Date',
            required: true,
            ui: {
              dateFormat: 'YYYY-MM-DD',
            },
          },
          {
            type: 'string',
            name: 'description',
            label: 'Short Description (shown in blog list & Google)',
            ui: { component: 'textarea' },
          },
          {
            type: 'string',
            name: 'category',
            label: 'Category',
            options: [
              'Home Maintenance',
              'Drywall Tips',
              'Painting Tips',
              'Tile Tips',
              'Local Community',
            ],
          },
          {
            type: 'image',
            name: 'image',
            label: 'Featured Image',
          },
          {
            type: 'string',
            name: 'imageAlt',
            label: 'Image Alt Text (describe the image for Google)',
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Post Content',
            isBody: true,
          },
        ],
      },
    ],
  },
})
