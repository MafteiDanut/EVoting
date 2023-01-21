const ethers = require('ethers');

async function createBytes(args){
    /*const name = args[0]
    const bytes=ethers.utils.formatBytes32String(name);
    console.log("Bytes: ",bytes);
    */
    
    const amount = ethers.BigNumber.from(BigInt(args));
    const bytes=ethers.utils.hexZeroPad(amount.toHexString(), 32)
    console.log(bytes);
    
}

createBytes(process.argv.slice(2))