FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 6969

# Exponemos el servidor dev al puerto de Vite por defecto que cambiamos en vite.config.js
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "6969"]
