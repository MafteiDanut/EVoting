async function main(){
    const EVoting=await ethers.getContractFactory("eVoting");

    const contractEVoting=await EVoting.deploy(1674117000,
                                              1674120600,
                                              1674117480,
                                              1674117480,
                                              1674117480,
                                              "0x00000000000000000000000000000000a4da374c4efb24d3ce385e9f15500819",
                                              "0xc30b2a68bb5ce664273eaecccb49f1fc814df47479a75519ba4b8fb016409729",
                                              "0x496c20766f74657a69207065205472756d703f00000000000000000000000000");

    console.log("Contract deployed to address:",contractEVoting.address);
}

main().then(()=>process.exit(0))
      .catch(error =>{
        console.error(error);
        process.exit(1);
      })