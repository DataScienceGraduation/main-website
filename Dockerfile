# Dockerfile

# Base image for building the frontend
FROM node:20-slim AS base

# Install dependencies
RUN apt-get update && apt-get install -y openssl

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json ./
COPY package-lock.json ./
COPY .env.production.local ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:20-slim AS production

# Set working directory
WORKDIR /app

# Copy the built application from the build stage
COPY --from=base /app/.next ./.next
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/public ./public

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
