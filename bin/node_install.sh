#!/bin/sh

## Node installer script for linux.
## It downloads, extracts and places files in "/var/node-NODE_VERSION/".

NODE_VERSION=v0.10.33
NODE_DIR=/var/node-$NODE_VERSION

KERNEL_ARCH_BIT=`getconf LONG_BIT`

NODE_PACKAGE_32=node-$NODE_VERSION-linux-x86.tar.gz
NODE_PACKAGE_64=node-$NODE_VERSION-linux-x64.tar.gz
NODE_PACKAGE_ADDRESS=nodejs.org/dist/v0.10.33/
if [ "$KERNEL_ARCH_BIT" -eq "64" ];
then
    NODE_PACKAGE_CURRENT=$NODE_PACKAGE_64
    NODE_PACKAGE_DIR=node-$NODE_VERSION-linux-x64
else
    NODE_PACKAGE_CURRENT=$NODE_PACKAGE_32
    NODE_PACKAGE_DIR=node-$NODE_VERSION-linux-x86
fi

download_node()
{
    echo "Downloading Node.js for "$KERNEL_ARCH_BIT" bits system: $NODE_PACKAGE_CURRENT..."
    wget --quiet $NODE_PACKAGE_ADDRESS$NODE_PACKAGE_CURRENT -O $NODE_PACKAGE_CURRENT
}

install_node()
{
    echo "Installing Node.js..."
    
    if [ -f $NODE_PACKAGE_CURRENT ];
    then
	tar -xf $NODE_PACKAGE_CURRENT
	if ! [ -d $NODE_DIR ];
	then
	    mkdir $NODE_DIR
	fi
	mv $NODE_PACKAGE_DIR/* $NODE_DIR
	rm -rf $NODE_PACKAGE_DIR
	rm -rf $NODE_PACKAGE_CURRENT
	ln -sf "$NODE_DIR/bin/node" /usr/local/sbin/node
	ln -sf "$NODE_DIR/lib/node_modules/npm/bin/npm-cli.js" /usr/local/sbin/npm
    fi
}

if ! command -v node >/dev/null
then
    download_node
    install_node
fi

echo "Node is installed."
exit 0
