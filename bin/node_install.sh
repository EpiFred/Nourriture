#!/bin/sh

## Node v0.10.33 installer script for ubuntu.

NODE_VERSION=v0.10.33
NODE_DIR=node-$NODE_VERSION

KERNEL_ARCH_BIT=`getconf LONG_BIT`

NODE_PACKAGE_32=$NODE_DIR-linux-x86.tar.gz
NODE_PACKAGE_64=$NODE_DIR-linux-x64.tar.gz
NODE_PACKAGE_ADDRESS=nodejs.org/dist/v0.10.33/
if [ "$KERNEL_ARCH_BIT" -eq "64" ];
then
    NODE_PACKAGE_CURRENT=$NODE_PACKAGE_64
    NODE_PACKAGE_DIR=$NODE_DIR-linux-x64
else
    NODE_PACKAGE_CURRENT=$NODE_PACKAGE_32
    NODE_PACKAGE_DIR=$NODE_DIR-linux-x86
fi

CURRENT_DIR=`pwd`

download_node()
{
    rm -rf $NODE_PACKAGE_CURRENT
    echo "Downloading Node.js for "$KERNEL_ARCH_BIT" bits system: $NODE_PACKAGE_CURRENT..."
    wget --quiet $NODE_PACKAGE_ADDRESS$NODE_PACKAGE_CURRENT
}

install_node()
{
    echo "Installing Node.js..."
    
    if [ -f $NODE_PACKAGE_CURRENT ];
    then
	tar -xf $NODE_PACKAGE_CURRENT
	if [ -d $NODE_DIR ];
	then
	    rm -rf $NODE_DIR
	fi
	mkdir $NODE_DIR
	mv $NODE_PACKAGE_DIR/* $NODE_DIR
	rm -rf $NODE_PACKAGE_DIR $NODE_PACKAGE_CURRENT
	ln -s "$CURRENT_DIR/$NODE_DIR/bin/node" /usr/bin/node
	ln -s "$CURRENT_DIR/$NODE_DIR/lib/node_modules/npm/bin/npm-cli.js" /usr/bin/npm
    else
	if [ -d $NODE_DIR ];
	then
	    ln -s "$CURRENT_DIR/$NODE_DIR/bin/node" /usr/bin/node
	    ln -s "$CURRENT_DIR/$NODE_DIR/lib/node_modules/npm/bin/npm-cli.js" /usr/bin/npm
	fi
    fi
}

if ! command -v nodejs >/dev/null
then
    if [ -d $NODE_DIR ];
    then
	install_node
    else
	download_node
	install_node
    fi
fi

echo "Node is installed."
exit 0
