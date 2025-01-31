This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

# Class Project - Getting Started

For this project, you will need npm installed on your machine. You can find installation instructions here: [npm install docs](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

1. Copy the `.env.example` file to a new file named `.env`.
2. Go to the Discord developer portal (<https://discord.com/developers/applications>), create or open your application, then copy the "Client ID" and "Client Secret" from the "General Information" tab. If you haven't created an application yet, click "New Application" first.
3. Replace the placeholders in the `.env` file with your Discord credentials.
4. Install dependencies:
   ```bash
   npm install
   ```
5. Push database changes:
   ```bash
   npm run db:push
   ```
6. Run in development mode:
   ```bash
   npm run dev
   ```



## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
