const API_KEY=process.env.API_KEY;
const PRIVATE_KEY=process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS=process.env.CONTRACT_ADDRESS;

const {ethers, network} =require("hardhat");
const contract = require("../artifacts/contracts/HelloWorld.sol/HelloWorld.json");

//provider - Alchemy
const alchemyProvider= new ethers.providers.AlchemyProvider("goerli",API_KEY);
//signer - you
const signer = new ethers.Wallet(PRIVATE_KEY,alchemyProvider);

//contract instace

const helloWorldContract = new ethers.Contract(CONTRACT_ADDRESS,contract.abi,signer);

async function main(){

    let message=await helloWorldContract.message();
    console.log("The message is: "+message);

    console.log("Updating the message...");
    const tx=await helloWorldContract.update("Hello World"); 
    await tx.wait();

    message=await helloWorldContract.message();
    console.log("New message is: "+message);

    
}

main().then(()=>process.exit(0))
      .catch(error =>{
        console.error(error);
        process.exit(1);
      })