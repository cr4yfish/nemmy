FROM node:20-alpine AS build-env

ARG NEXT_PUBLIC_DEFAULT_INSTANCE
ARG PORT
ARG DISABLE_IMAGE_OPTIMIZATION

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
ENV PORT $PORT
ENV NEXT_TELEMETRY_DISABLED 1
ENV NEXT_PUBLIC_DEFAULT_INSTANCE=$NEXT_PUBLIC_DEFAULT_INSTANCE
ENV DISABLE_IMAGE_OPTIMIZATION=$DISABLE_IMAGE_OPTIMIZATION

COPY --from=build-env /app/next.config.js ./
COPY --from=build-env /app/.next /app/.next
COPY --from=build-env /app/node_modules /app/node_modules
COPY --from=build-env /app/public /app/public


CMD ["./node_modules/next/dist/bin/next", "start"]
