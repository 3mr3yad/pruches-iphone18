# ---------- الـ build ----------
FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# (هنضيف هنا المتغيرات لما تبعتلي أسماءها)
RUN npm run build

# ---------- الـ image النهائية ----------
FROM nginxinc/nginx-unprivileged:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/out /usr/share/nginx/html
EXPOSE 8080

ARG NEXT_PUBLIC_API_BASE
ARG NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_MOYASAR_METHODS=creditcard
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE \
    NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY=$NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY \
    NEXT_PUBLIC_MOYASAR_METHODS=$NEXT_PUBLIC_MOYASAR_METHODS
RUN npm run build