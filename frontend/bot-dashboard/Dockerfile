FROM node:lts-alpine

# Install npm
COPY package.json /data/

WORKDIR /data/

RUN npm install -g nodemon

RUN npm install --production \
    && npm cache clean --force

ENV PATH /data/node_modules/.bin:$PATH

COPY . /data/app

WORKDIR /data/app

EXPOSE 3000

CMD ["npm", "start"]

# ENTRYPOINT ["tail"]
# CMD ["-f","/dev/null"]
