FROM node:20-alpine

# Install system build tools (required for compiling native Node modules like draco)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Ensure the uploads directory exists
RUN mkdir -p backend/uploads

# Expose the API port
EXPOSE 5050

# Start the application
CMD ["npm", "start"]
