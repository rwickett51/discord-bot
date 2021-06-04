FROM node:lts

WORKDIR /app

RUN npm install -g nodemon

# Install npm
COPY package.json ./

RUN npm i --production \
    && npm cache clean --force \
    && mv /app/node_modules /node_modules

COPY . .

CMD ["nodemon", "-L", "."]
