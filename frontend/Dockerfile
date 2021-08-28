FROM node:lts-alpine

########### CREATE FRONTEND BUILD ###########

# Install Dependencies
COPY ./bot-dashboard/package.json /data/
WORKDIR /data/
RUN npm install --production \
    && npm cache clean --force

# Copy code and build 
COPY ./bot-dashboard /data/
RUN npm run build

# Delete all but the production build (/data/build)
RUN rm -rf /data/public /data/node_modules /data/src /data/package.json /data/README.md /Dockerfile

# Should only be left with the production build (/data/build)

########### END FRONTEND BUILD ###########

########### CREATE BACKEND BUILD ###########

RUN mkdir -p /data/app

WORKDIR /data/app

RUN npm install -g nodemon
COPY ./dashboard-api/package.json /data/app

RUN npm i --production \
    && npm cache clean --force \
    && mv /data/app/node_modules /node_modules

COPY ./dashboard-api /data/app


CMD ["npm", "start"]