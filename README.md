# EzPark Backend

## Dev Config
1. Run `npm install`
2. Run `npm run start`
3. Open `http://localhost:5000`


## MongoDB via Docker
The command below will pull, build, and run a mongoDB, accessible only through localhost on port 27017


`docker run -d --name mongo -v ~/mongo/data:/data/db -p 127.0.0.1:27017:27017 mongo:latest`
