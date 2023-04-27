const { ethers } = require('ethers');
require('dotenv').config();

const Marketplace = require('./abis/Marketplace.json')
const data = require('./items.json');

async function addProducts() {
    
    // Mumbai
    const marketplaceAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
    const privateKey = process.env.PRIVATE_KEY

    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/')
    const wallet = new ethers.Wallet(privateKey);
    const signer = wallet.connect(provider);
  
    const marketplace = new ethers.Contract(marketplaceAddress, Marketplace, provider);

    for(let i=0; i<9; i++) {
      await marketplace.connect(signer).addItem(
        data.items[i].name, 
        data.items[i].category, 
        data.items[i].description, 
        data.items[i].image, 
        data.items[i].price, 
        data.items[i].supply
      );
      console.log("Item added to the marketplace with itemId - ", i);
    }


  }
  
  addProducts();