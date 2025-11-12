# Use Node.js 18 Alpine as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY packages/ ./packages/

# Install dependencies with workspaces support
RUN npm install -g npm@latest && \
    npm install --legacy-peer-deps --workspaces

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=development

# Set the working directory to the main package
WORKDIR /app/packages/app

# Start the application
CMD ["sh", "-c", "npm install -g npm@11.6.2 && npm start"]