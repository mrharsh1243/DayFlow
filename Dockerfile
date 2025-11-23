# 1. Base Image for Installing Dependencies
FROM node:18-slim AS deps
WORKDIR /app
COPY package.json ./
RUN npm install --frozen-lockfile

# 2. Builder Image
FROM node:18-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 3. Production Image
FROM node:18-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
# The Genkit dev server should not run in production.
# We set this to an empty string to prevent it from starting.
ENV GENKIT_ENV=""
# The Next.js app will run on port 9002 inside the container.
ENV PORT=9002

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 9002

CMD ["node", "server.js"]
