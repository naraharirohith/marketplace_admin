import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import axios from "axios"

import Navigation from './components/Navigation'

import {toBase64} from './utils/utils'

import Marketplace from './abis/Marketplace.json'
import config from './config.json'

function App() {
  const [provider, setProvider] = useState(null)
  const [marketplace, setMarketplace] = useState(null)

  const [account, setAccount] = useState(null)

  const [item, setItem] = useState({})
  const [toggle, setToggle] = useState(false)
  const [items, setItems] = useState(null)

  const [selectedFile, setSelectedFile] = useState();

  const JWT = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyYTE4NzU4ZS01NTZiLTQ2NjYtYjdlYi1mYzczMDhkYWJmYWMiLCJlbWFpbCI6InJvaGl0Lm5hcmFoYXJpQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIxN2YwZmQ5NzhmOTRkNDdjYmIxYiIsInNjb3BlZEtleVNlY3JldCI6ImE0ZmU1NTI5Y2M3NTZhZTNlNDVhN2EyNzNiOWZhZmRkY2I3NzZjYTNlNTMzMzk1MTM4ZWUxY2U3ODYwMDY4YzkiLCJpYXQiOjE2ODIyNjExNzV9.xwhbXIGgQ7RqzTKAoRq8vDD7ytc4NHeXrz6yT7Tv2fw`

  const togglePop = (item) => {
    setItem(item)
    toggle ? setToggle(false) : setToggle(true)
  }

  const addItemToMarketplace = async (name, category, description, price, supply, imageFile) => {
    // Convert the image file to a base64 string
    const image = await toBase64(imageFile);
  
    // Create the metadata object
    // const metadata = {
    //   name,
    //   description,
    //   image,
    //   category,
    //   price,
    //   supply,
    // };

    const formData = new FormData();
    
    formData.append('file', selectedFile)

    const metadata = JSON.stringify({
      name: 'File name',
    });
    formData.append('pinataMetadata', metadata);
    
    const options = JSON.stringify({
      cidVersion: 0,
    })
    formData.append('pinataOptions', options);

    try{
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: "Infinity",
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: JWT
        }
      });
      console.log(res.data.IpfsHash);

      // Get the IPFS hash of the metadata
      const ipfsHash = res.data.IpfsHash;

      const signer = await provider.getSigner()
  
      // Add the item to the marketplace contract
      const addItemTx = await marketplace.connect(signer).addItem(name, category, description, ipfsHash, price, supply);
  
      // Wait for the transaction to be confirmed
      await addItemTx.wait();
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log(event)
  
    const formData = new FormData(event.target);
  
    const name = formData.get('name');
    const category = formData.get('category');
    const description = formData.get('description');
    const price = ethers.utils.parseEther(formData.get('price'));
    const supply = ethers.utils.parseUnits(formData.get('supply'), 0);
    const imageFile = formData.get('image');

    console.log(name, category, description, price, supply, imageFile)
  
    await addItemToMarketplace(name, category, description, price, supply, imageFile);
  };
  

  const handleImageChange = async (event) => {
    console.log("IN handle image change")
    setSelectedFile(event.target.files[0]);
  }
 
  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)
    const network = await provider.getNetwork()

    const marketplace = new ethers.Contract(config[network.chainId].marketplace.address, Marketplace, provider)
    setMarketplace(marketplace)

    setItems(items)
  }
  useEffect(() => {
    loadBlockchainData()
  }, [])

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />

      <header className="App-header">
        <h1>Marketplace Admin Panel! Please Add new product details</h1>
        
      </header>
      <div className="App">
  <form onSubmit={handleSubmit}>
    
    <label>
      Name:
      <input type="text" name="name" value={item.name} required />
    </label>
    <br />
    <label>
      Category:
      <input type="text" name="category" value={item.category} required />
    </label>
    <br />
    <label>
      Description:
      <input type="text" name="description" value={item.description} required />
    </label>
    <br />
    <label>
      Image:
      <input type="file" name="image" onChange={handleImageChange} required />
    </label>
    <br />
    <label>
      Price (in Wei):
      <input type="number" name="price" value={item.price} required />
    </label>
    <br />
    <label>
      Supply:
      <input type="number" name="supply" value={item.supply} required />
    </label>
    <br />
    <button type="submit">Add Item</button>
  </form>
  <hr />

    </div>
    </div>
  );
}

export default App;
