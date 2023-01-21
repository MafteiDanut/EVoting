const API_KEY=process.env.API_KEY;
const PRIVATE_KEY=process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS=process.env.CONTRACT_ADDRESS;

const {ethers, network} =require("hardhat");
const contract = require("../artifacts/contracts/EVoting.sol/eVoting.json");
const prompt= require("prompt-sync")({sigint:true})
const crypto=require("./electionUtils");

function createBytesFromBigInt(number){
  const amount = ethers.BigNumber.from(number);
  const bytes=ethers.utils.hexZeroPad(amount.toHexString(), 32)
  return bytes
}

//provider - Alchemy
const alchemyProvider= new ethers.providers.AlchemyProvider("goerli",API_KEY);
//signer - you
const signer = new ethers.Wallet(PRIVATE_KEY,alchemyProvider);

//contract instace

const eVotingContract = new ethers.Contract(CONTRACT_ADDRESS,contract.abi,signer);

async function main(){

  const sessionDetails=await eVotingContract.session();

  const timeStartRegistery=sessionDetails[0].toString();
  const timeStopRegistery=sessionDetails[1].toString();
  const timeStartVote=sessionDetails[2].toString();
  const timeStopVote=sessionDetails[3].toString();
  const timetoShowResult=sessionDetails[4].toString();
  const generator=BigInt(sessionDetails[5]);
  const module=BigInt(sessionDetails[6]);
  const message=sessionDetails[7];
  
  
  while(Math.floor(Date.now() / 1000)<timeStopVote);

  let votes=await eVotingContract.takeVotes();
  let newVotes=[];
  for(let i=0;i<votes.length;++i){
    newVotes.push(BigInt(votes[i]))
  }
  console.log(newVotes)

  const resultFinal=await crypto.computeResult(newVotes,module);

  await eVotingContract.saveResult(await createBytesFromBigInt(resultFinal)).then(response=>{
  
  }).catch(error =>{
    console.log("Eroare: "+error.reason);
  })
  
}

main().then(()=>process.exit(0))
      .catch(error =>{
        console.error(error);
        process.exit(1);
      })