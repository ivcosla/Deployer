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



