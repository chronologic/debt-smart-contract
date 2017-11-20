var DebtToken = artifacts.require('./DebtToken.sol');// Import contract of StandarTOken type

contract('DebtToken', function(accounts){

    var contract,web3,Me;
    const _1ether = 1e+18;
    Me = accounts[0];

    var deployment_config = {
      _tokenName:  'Performance Global Loan',
      _tokenSymbol:  'PGLOAN',
      _initialAmount: 5000000000000000000,
      //_initialAmount: 500000000000000000000,//wei value of initial loan
      _exchangeRate:   1,
      _decimalUnits:   18,
      //_dayLength:  86400,
      _dayLength:  10,
      _loanTerm:   60,
      _loanCycle: 20,
      _interestRate: 2,
      _debtOwner: accounts[1]
    },
    unit = Math.pow(10,deployment_config._decimalUnits);

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

    describe('Loan Activation',function(){

        it('Should fail to send wrong amount to the contract from non-debtOwner',function(done){
            var _value = web3.toWei(2, 'ether');
            web3.eth.sendTransaction({from:accounts[2],to:contract.address,value:_value},function(e,r){
              assert.notEqual(e,null,'Wrong amount used to fund loan by non-debtOwner');
              done();
            });
        });

        it('Should fail to send right amount to the contract from non-debtOwner',function(done){
          var _value = deployment_config._initialAmount;
          web3.eth.sendTransaction({from:accounts[2],to:contract.address,value:_value},function(e,r){
            assert.notEqual(e,null,'Loan funded by non-debtOwner');
            done();
          });
        });

        it('Should fail to send wrong amount to the contract from debtOwner',function(done){
          var _value = web3.toWei(2, 'ether'),
          debtOwner = deployment_config._debtOwner;
          web3.eth.sendTransaction({from:debtOwner,to:contract.address,value:_value},function(e,r){
            assert.notEqual(e,null,'Wrong amount used to fund loan');
            done();
          });
        });

        it('Should send right amount to the contract from debtOwner',function(done){
          var _debtOwner = contract.debtOwner.call(),
          _value = contract.getLoanValue.call(true),
          txn = {from:_debtOwner,to:contract.address,value: _value, gas: 210000 };

          web3.eth.sendTransaction(txn,function(e,r){
            var balance = contract.balanceOf.call(_debtOwner);
            var totalSupply = contract.actualTotalSupply.call();
            assert.equal(e,null,'Loan not successfully funded by debtOwner');
            assert.equal(Number(balance),Number(totalSupply),'Wrong number of tokens assigned to debtOwner');
            done();
          });
        });
    })

    describe.skip('Interest Accruing ',function(){
        it('Should fetch interestUpdated satus',{

        })

        it('Should run updateInterest function from any address',{

        })

        it('Should not allow raceCondition on updateInterest function',{

        })

        it('Should fail to allow owner run finishMinting function',{

        })

    })

    describe.skip('Loan Refund',function(){
        it('Should fail to refund amount diffferent from total due',{

        })

        it('Should fail to refund correct amount from non-owner',{

        })

        it('Should successfully refund correct amount',{

        })

    })

  });
