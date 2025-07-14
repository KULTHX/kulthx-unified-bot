FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json for main project
COPY package.json ./ 
COPY package-lock.lock ./ 

# Install main project dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Install dependencies for sub-projects and build frontend
RUN npm run install-deps
RUN npm run build

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD ["npm", "start"]

