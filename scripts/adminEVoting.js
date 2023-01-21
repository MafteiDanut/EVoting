const API_KEY=process.env.API_KEY;
const PRIVATE_KEY=process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS=process.env.CONTRACT_ADDRESS;

const {ethers, network} =require("hardhat");
const contract = require("../artifacts/contracts/EVoting.sol/eVoting.json");
const prompt= require("prompt-sync")({sigint:true})

//provider - Alchemy
const alchemyProvider= new ethers.providers.AlchemyProvider("goerli",API_KEY);
//signer - you
const signer = new ethers.Wallet(PRIVATE_KEY,alchemyProvider);

//contract instace

const eVotingContract = new ethers.Contract(CONTRACT_ADDRESS,contract.abi,signer);

async function main(){

    const test = prompt("Introdu ceva de test\n");
    console.log('Ai introdus:'+test);
    let adminAddresse=await eVotingContract.adminAddress();
    console.log("The admin addresse is: "+adminAddresse);

    //await eVotingContract.setEligibleVoters(['0x60bD36338c16398DEe277293b4D5BdF1F2d2E17B']);

    await eVotingContract.registrationToSession('0x3230000000000000000000000000000000000000000000000000000000000000')
    .then(response=>{
      console.log("Raspunsul este:"+response);
    }).catch(error=>{
      console.log("Eroare:"+error.reason);
    })
    
}

main().then(()=>process.exit(0))
      .catch(error =>{
        console.error(error);
        process.exit(1);
      })