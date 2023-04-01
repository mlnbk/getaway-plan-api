FROM node:alpine3.17

WORKDIR /usr/src/getaway-plan-api

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

# Start the app
CMD ["npm", "start"]
