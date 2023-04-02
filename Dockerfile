FROM ubuntu:lunar

WORKDIR /usr/src/getaway-plan-api

COPY package*.json ./

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev npm && npm install

COPY . .

EXPOSE 5000

# Start the app
CMD ["npm", "start"]
