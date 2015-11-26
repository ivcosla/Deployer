FROM ubuntu

# Enable Extra Packages for Enterprise Linux (EPEL) for CentOS
RUN   apt-get update
# Install Node.js and npm

RUN   apt-get install -y curl
RUN   curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
RUN   apt-get install -y nodejs
RUN   apt-get install -y build-essential
RUN   apt-get install -y libzmq-dev
RUN   apt-get install -y python
RUN   npm install zmq

# Bundle app source
# COPY . /src
RUN mkdir component
COPY . /component/
RUN cd /component/code

# Install app dependencies. Package.json de deployer no es para npm
# RUN npm install

#Backend por defecto con deployer.js
EXPOSE 8000

CMD ["nodejs", "component.js"]




