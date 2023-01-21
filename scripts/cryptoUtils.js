const bigIntCrypto = require('bigint-crypto-utils')

function sqrt(value) {
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

async function babyStepGiantStep(generator,module,beta){
    const m=await sqrt(module);

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

async function main(){
    //let number = await bigIntCrypto.modPow(3n,1234n,17n);
    console.log(await babyStepGiantStep(219126433602198792564311281445094033433n,88220733488362141919030454210779147012844266424965499941485635268248898410281n,number));
}

main()