const API_KEY=process.env.API_KEY;
const CONTRACT_ADDRESS=process.env.CONTRACT_ADDRESS;

const {ethers, network} =require("hardhat");
const contract = require("../artifacts/contracts/EVoting.sol/eVoting.json");
const prompt= require("prompt-sync")({sigint:true})
const web3=require("web3");
const crypto=require("./electionUtils");

//provider - Alchemy
const alchemyProvider= new ethers.providers.AlchemyProvider("goerli",API_KEY);
//signer - you
let signer; 

//contract instace

let eVotingContract;
let privateValue;
let publicValue;

function createBytesFromBigInt(number){
    const amount = ethers.BigNumber.from(number);
    const bytes=ethers.utils.hexZeroPad(amount.toHexString(), 32)
    return bytes
}


async function main(){

    const privateKey = prompt("Introdu cheia privata a portofelului:");
    signer=new ethers.Wallet(privateKey,alchemyProvider);

    eVotingContract=new ethers.Contract(CONTRACT_ADDRESS,contract.abi,signer);

    const sessionDetails=await eVotingContract.session();

    const timeStartRegistery=sessionDetails[0].toString();
    const timeStopRegistery=sessionDetails[1].toString();
    const timeStartVote=sessionDetails[2].toString();
    const timeStopVote=sessionDetails[3].toString();
    const timetoShowResult=sessionDetails[4].toString();
    const generator=BigInt(sessionDetails[5]);
    const module=BigInt(sessionDetails[6]);
    const message=sessionDetails[7];

    console.log('Sesiunea de inregistrare incepe la: '+new Date(parseInt(timeStartRegistery)*1000));

    console.log('\nAsteptati pana cand incepe inregistrarea.....\n');

    while(Math.floor(Date.now() / 1000)<timeStartRegistery);

    console.log('Va puteti inregistra!\nInregistrarea se termina la: '+new Date(parseInt(timeStopRegistery)*1000)+'\n');
    
    let reg;

    do{
        reg=prompt('Doriti sa va inregistrati pentru a vota? Alegeti dintre Y/N?: ');
        if(reg!='Y' && reg!='N'){
            console.log('Tastati Y sau N!!!');
        }
    }while(reg!='Y' && reg!='N');

    if(Math.floor(Date.now() / 1000)>timeStopRegistery ){
        console.log('\nSesiunea de inregistrare s-a terminat, nu va mai puteti inregistra...\n');
    }
    else if(reg=='N'){
        console.log('\nO zi buna!\n');
    }
    else{

        privateValue=await crypto.generateBigNumberPrime();
        publicValue=await crypto.computePublicValue(generator,privateValue,module);

        await eVotingContract.registrationToSession(createBytesFromBigInt(publicValue))
        . then(async response=>{
            console.log('\nV-ati inregistrat cu succes!\n');

            console.log('Sesiunea de votare incepe la: '+new Date(parseInt(timeStartVote)*1000)+'\n');

            while(timeStartVote>Math.floor(Date.now() / 1000));

            //preia valorile publice 

            //calculeaza valoarea Y

            console.log('Puteti sa votati!!!\n');

            const publicValues=await eVotingContract.takePublicValues();
    
            let newPublicValues=[]
            let index;

            for(let i=0;i<publicValues.length;++i){
                newPublicValues.push(BigInt(publicValues[i]));
            }

            for(let i=0;i<newPublicValues.length;++i){
                if(publicValue===newPublicValues[i]){
                    index=i;
                }
            }

            console.log(newPublicValues)

            const YValue=await crypto.computeYValueForOneUser(index,newPublicValues,module);
            
            do{
                reg=prompt(ethers.utils.parseBytes32String(message)+' Alegeti dintre Y/N?: ');
                if(reg!='Y' && reg!='N'){
                    console.log('Tastati Y sau N!!!');
                }
            }while(reg!='Y' && reg!='N');

            if(Math.floor(Date.now() / 1000)>timeStopVote){
                console.log('\nNu ati votat la timp!\n')
            }else{
                let vot;
                if(reg==='Y'){
                    vot=1n;
                }
                else{
                    vot=0n;
                }
                //calculeaza vot
                const make_vote=await crypto.makeVote(YValue,vot,privateValue,generator,module); 
                //trimite vot criptat

                await eVotingContract.vote(createBytesFromBigInt(make_vote)).then(async response=>{

                    console.log('Ati votat cu succes!')
                    console.log('Va rog sa asteptati pana cand se afiseaza rezultatele...')
                    
                    while(Math.floor(Date.now() / 1000)<timetoShowResult);


                    const result = await eVotingContract.takeResult();

                    const finalResult=result[1];

                    console.log('Numar de voturi pentru:'+await crypto.printResultBrute(BigInt(finalResult),generator,module)+' dintr-un total de '+publicValues.length);
                }).catch(error=>{
                    console.log('Eroare '+error.reason);
                })
        
            }
        
        }).catch(error=>{
        console.log("Eroare:"+error.reason);
        })

        
    }

    
}

main().then(()=>process.exit(0))
      .catch(error =>{
        console.error(error);
        process.exit(1);
      })