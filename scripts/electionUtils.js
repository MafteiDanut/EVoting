const { type } =require('os')
//import * as bigIntCrypto from 'bigint-crypto-utils'
const bigIntCrypto = require('bigint-crypto-utils')


module.exports=class electionUtils{

    static async generateBigNumberPrime(){
        return await bigIntCrypto.prime(256);
    }

    static async generateGeneratorAndModule(){
        let generator;
        let module;
        let p;
        let isPrime;
        do{
            p=await bigIntCrypto.prime(256);
            module=p*2n+1n;
            isPrime=await bigIntCrypto.isProbablyPrime(module)
        }while(isPrime==false)

        for(let i=2;i<module;++i){
            if(await bigIntCrypto.modPow(i,2,module)!==1n && await bigIntCrypto.modPow(i,p,module)!==1n){
                generator=i;
                break;
            }
        }
        return [generator,module]
    }

    static async generateGenerator(){
        return await bigIntCrypto.prime(512);
    }

    static async generateASecretValue(listOfPrivates){
        
        let newPrivate;
        do{
            newPrivate=await bigIntCrypto.prime(512);
        }while(listOfPrivates.length!=0 && listOfPrivates.includes(newPrivate)==true)

        return newPrivate
    }

    static async computePublicValue(generator,privateValue,module){
        return await bigIntCrypto.modPow(generator,privateValue,module);
    }

    static async computeY(publicValues,module){

        let Y=[]
        for(let i=0;i<publicValues.length;++i){
            Y.push(1n)

            for(let j=0;j<i;++j){
                Y[i]=(Y[i]*publicValues[j])%module;
            }

            for(let j=i+1;j<publicValues.length;++j){
                Y[i]=(Y[i]*await bigIntCrypto.modInv(publicValues[j],module))%module
            }
        }
        return Y
    }

    static async computeYValueForOneUser(i,publicValues,module){
        let Y=1n;

        for(let j=0;j<i;++j){
            Y=(Y*publicValues[j])%module;
        }

        for(let j=i+1;j<publicValues.length;++j){
            Y=(Y*await bigIntCrypto.modInv(publicValues[j],module))%module;
        }

        return Y;

    }

    static async makeVote(Y,vote,privateValue,generator,module){
        return ((await bigIntCrypto.modPow(Y,privateValue,module))*(await bigIntCrypto.modPow(generator,vote,module)))%module
    }

    static async makeVotes(Y,votes,privateValues,generator,module){
        let make_votes=[]

        for(let i=0;i<Y.length;++i){
            make_votes.push(
                (await bigIntCrypto.modPow(Y[i],privateValues[i],module)*
                await bigIntCrypto.modPow(generator,votes[i],module))%module
                );
        }

        return make_votes
    }

    static computeResult(make_votes,module){
        let result=make_votes[0]

        for(let i=1;i<make_votes.length;++i){
            result=(result*make_votes[i])%module
        }
        return result
    }
    
    static natlog(bigint) {
        if (bigint < 0) return NaN;
      
        const s = bigint.toString(16);
        const s15 = s.substring(0, 15);
      
        return Math.log(16) * (s.length - s15.length) + Math.log("0x" + s15);
    }
      
    static sqrt(value) {
        if (value < 0n) {
            throw 'square root of negative numbers is not supported'
        }
    
        if (value < 2n) {
            return value;
        }
    
        function newtonIteration(n, x0) {
            const x1 = ((n / x0) + x0) >> 1n;
            if (x0 === x1 || x0 === (x1 - 1n)) {
                return x0;
            }
            return newtonIteration(n, x1);
        }
    
        return newtonIteration(value, 1n);
    }
    
    static async babyStepGiantStep(generator,module,beta){
        const m=await this.sqrt(module);
        console.log(m);
        let jValues=[];
    
        for(let i=0;i<m;++i){
            jValues.push(await bigIntCrypto.modPow(generator,i,module));
        }
    
        const v=await bigIntCrypto.modPow(generator,m,module);
        const inv=await bigIntCrypto.modInv(v,module);
    
        let gama=beta;
    
        for(let i=0;i<m;++i){
            for(let j=0;j<m;++j){
                if(jValues[j]===gama){
                    return BigInt(i)*m+BigInt(j);
                }
            }
    
            gama=gama*inv%module;
        }
    
        return 0n;
    }

    static async printResultUsingBabyStepGiantStep(result,generator,module){

        return await this.babyStepGiantStep(generator,module,result);
        
    }

    static async printResultBrute(result,generator,module){

        let i=0n;
        let number;

        do{
            number=await bigIntCrypto.modPow(generator,i,module);
            
            if(number===result){
                return i
            }

            i=i+1n;
        }while(i)
    }
}



//const voters=[1n,1n,1n,1n,1n,0n,1n,1n,0n,1n,1n,1n,0n,1n,1n,1n,1n,1n,1n]
let voters=[]

const election=async()=>{
    
    let count=0;
    for(let i=0;i<40;++i){
        voters[i]=BigInt(Math.floor(Math.random() * 2))
        if(voters[i]===1n){
            count++;
        }
        else if(voters[i]!=1n && voters[i]!=0n){
            console.log('Diferit');
        }
    }
    
    console.log(count);
    let privateValues=[]
    let publicValues=[]

    let values=await module.exports.generateGeneratorAndModule();
    const generator=values[0];
    const moduleP=values[1];

    console.log('Generator:');
    console.log(generator);
    console.log('Module:');
    console.log(moduleP);

    //generate private values
    for(let i=0;i<voters.length;++i){
        privateValues.push(await module.exports.generateBigNumberPrime())
    }

    console.log('Valorile private sunnt:');

    for(let i=0;i<privateValues.length;++i){
        console.log(privateValues[i])
    }

    ///////////////////

    //generate public values

    for(let i=0;i<voters.length;++i){
        publicValues.push(await module.exports.computePublicValue(generator,privateValues[i],moduleP));
    }

    console.log('Valorile publice sunt');

    for(let i=0;i<publicValues.length;++i){
        console.log(publicValues[i]);
    }

    ////////////////////

    //compute Y values
    let Y=[]
    for(let i=0;i<publicValues.length;++i){
        Y.push(await module.exports.computeYValueForOneUser(i,publicValues,moduleP));
    }

    console.log('Valorile Y sunt:');

    for(let i=0;i<Y.length;++i){
        console.log(Y[i])
    }
    //////

    //compute Votes

    let make_votes=await module.exports.makeVotes(Y,voters,privateValues,generator,moduleP);

    console.log('Voturile criptate sunnt:');


    for(let i=0;i<make_votes.length;++i){
        console.log(make_votes[i])
    }

    /////
    //compute Result
    result=await module.exports.computeResult(make_votes,moduleP)
    console.log('Rezultatul este:')
    console.log(result)
    const finalResult=await module.exports.printResultBrute(result,generator,moduleP);

    console.log(finalResult)

}

const electionTest=async ()=>{
    makeVotes=[50n,29n,38n,29n,16n]
    result=await electionUtils.computeResult(makeVotes,moduleP)

    electionUtils.printResult(result,generator)
}

async function main(){
    console.log(await module.exports.printResultBrute(99386334853690179677995281036458250739882978278386385230538947159887834205964n,
        2n,
        171397249759009121257558538980090330863884702563480313208657829012323085588619n))
}

//main()
//election()


