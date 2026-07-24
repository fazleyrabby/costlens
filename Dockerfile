FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install
COPY . .
RUN pnpm build

FROM node:20-alpine AS run
WORKDIR /app
RUN corepack enable
COPY --from=build /app /app
ENV HOST=0.0.0.0 PORT=4321
EXPOSE 4321
CMD ["pnpm", "start"]
