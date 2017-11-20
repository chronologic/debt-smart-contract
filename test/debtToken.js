var DebtToken = artifacts.require('./DebtToken.sol');// Import contract of StandarTOken type

contract('DebtToken', function(accounts){

    var contract,web3,Me;
    const _1ether = 1e+18;
    Me = accounts[0];

    var deployment_config = {
      _tokenName:  'Performance Global Loan',
      _tokenSymbol:  'PGLOAN',
      //_initialAmount: 500,
      _initialAmount: 5000000000000000000,//wei value of initial loan
      _exchangeRate:   1,
      _decimalUnits:   18,
      //_dayLength:  86400,
      _dayLength:  10,
      _loanTerm:   60,
      _loanCycle: 20,
      _interestRate: 2,
      _debtOwner: accounts[1]
    }

    it('should deploy the contract', function (done) {
        DebtToken.new(
            deployment_config._tokenName,
            deployment_config._tokenSymbol,
            deployment_config._initialAmount,
            deployment_config._exchangeRate,
            deployment_config._decimalUnits,
            deployment_config._dayLength,
            deployment_config._loanTerm,
            deployment_config._loanCycle,
            deployment_config._interestRate,
            deployment_config._debtOwner
        )
        .then(function(inst){
            contract = inst.contract;
            web3 = inst.constructor.web3;


            console.log('Address:',contract.address );
            contract.name(function(e,r){
                console.log('Name:', r);
              });
            contract.symbol(function(e,r){
                console.log('Symbol:', r);
              });
            contract.totalSupply(function(e,r){
                console.log('totalSupply:', r);
              });

            assert.notEqual(contract.address, null, 'Contract not successfully deployed');
            done();
        });
    });

    describe.skip('Loan Activation',function(){

        it('Should fail to send wrong amount to the contract from non-debtOwner',{

        })

        it('Should fail to send right amount to the contract from non-debtOwner',{

        })

        it('Should fail to send wrong amount to the contract from debtOwner',{

        })

        it('Should send right amount to the contract from debtOwner',{

        })
    })

    describe('Interest Accruing ',function(){
        it('Should fetch interestUpdated satus',{

        })

        it('Should run updateInterest function from any address',{

        })

        it('Should not allow raceCondition on updateInterest function',{

        })

        it('Should fail to allow owner run finishMinting function',{

        })

    })

    describe('Loan Refund',function(){
        it('Should fail to refund amount diffferent from total due',{

        })

        it('Should fail to refund correct amount from non-owner',{

        })

        it('Should successfully refund correct amount',{

        })

    })

  });
