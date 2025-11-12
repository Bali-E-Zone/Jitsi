# Use Node.js 22 with a full Debian-based image (includes make)
FROM node:22-bookworm

# Set the working directory
WORKDIR /app

# Install make and other build tools
RUN apt-get update && apt-get install -y make

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# Start the application
CMD ["npm", "start"]