# ---- Stage 1: Build the Next.js app ----
FROM node:20-alpine AS builder

# Set working directory inside the container
WORKDIR /app

# Copy only package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of your source code
COPY . .

# Build the Next.js app for production
RUN npm run build

# ---- Stage 2: Run the Next.js app ----
FROM node:20-alpine AS runner

WORKDIR /app

# Copy built files from previous stage
COPY --from=builder /app ./

# Expose the port Next.js runs on (default 3000)
EXPOSE 3000

# Start the production server
CMD ["npm", "start"]
