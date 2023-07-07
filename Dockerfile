FROM node:20-alpine AS build-env

ENV NEXT_TELEMETRY_DISABLED 1
WORKDIR /app
COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build
RUN npm ci --only=production

FROM gcr.io/distroless/nodejs20-debian11:nonroot

WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=build-env /app/next.config.js ./
COPY --from=build-env /app/.next /app/.next
COPY --from=build-env /app/node_modules /app/node_modules
COPY --from=build-env /app/public /app/public


CMD ["./node_modules/next/dist/bin/next", "start"]
