FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 5050

CMD ["npm", "start"]
