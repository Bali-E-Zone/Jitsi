# Use Node.js 18 Alpine as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=development

# Install dependencies and start the application
CMD ["sh", "-c", "npm install -g npm@11.6.2 && npm start"]
