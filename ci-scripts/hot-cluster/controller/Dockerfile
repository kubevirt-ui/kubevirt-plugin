FROM registry.access.redhat.com/ubi9/nodejs-22-minimal:latest AS builder

WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci --ignore-scripts
COPY src/ src/
RUN npm run build

FROM registry.access.redhat.com/ubi9/nodejs-22-minimal:latest

RUN microdnf install -y httpd-tools && microdnf clean all

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/

WORKDIR /app

USER 1001

CMD ["node", "dist/index.js"]
