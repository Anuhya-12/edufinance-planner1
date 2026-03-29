FROM node:18

WORKDIR /app

# copy package files
COPY package.json package-lock.json ./

RUN npm install

# copy project files
COPY . .

# build React app
RUN npm run build

# serve app
RUN npm install -g serve

CMD ["serve", "-s", "dist", "-l", "3000"]