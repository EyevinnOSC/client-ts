FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm ci --include=optional
RUN npm run build
RUN cd packages/cli/ && npm install -g

ENTRYPOINT [ "osc" ]
