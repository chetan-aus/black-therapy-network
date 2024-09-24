# Base image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Install pm2 globally
RUN npm install pm2 -g

# Install ts-node globally
RUN npm install -g ts-node typescript

# Expose the application port
EXPOSE 8000

# Start the application with pm2 using ts-node
CMD ["pm2-runtime", "start", "src/app.ts", "--interpreter", "ts-node"]
