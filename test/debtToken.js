var DebtToken = artifacts.require('./DebtToken.sol');// Import contract of StandarTOken type

contract('DebtToken', function(accounts){

    var contract,web3,Me;
    const _1ether = 1e+18;
    Me = accounts[0];

    var deployment_config = {
      _tokenName:  'Performance Global Loan',
      _tokenSymbol:  'PGLOAN',
      _initialAmount: 500000000000000000,
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

    function forceMine(time){
      web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [time], id: 123});
      web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 0})
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
          _mybal = web3.eth.getBalance(Me),
          txn = {from:_debtOwner,to:contract.address,value: _value, gas: 210000 };

          web3.eth.sendTransaction(txn,function(e,r){
            var balance = contract.balanceOf.call(_debtOwner),
            totalSupply = contract.actualTotalSupply.call();
            _mynewbal = web3.eth.getBalance(Me);
            assert.equal(e,null,'Loan not successfully funded by debtOwner');
            assert.equal(Number(balance),Number(totalSupply),'Wrong number of tokens assigned to debtOwner');
            assert.equal(Number(_mynewbal),Number(_mybal)+ deployment_config._initialAmount,'Wrong value of Ether sent to Owner');
            done();
          });
        });
    })

    describe('Interest Accruing ',function(){
        it('Should fetch interestUpdated satus',function(){
            var interestStatusUpdated = contract.interestStatusUpdated.call();

            assert.notEqual(interestStatusUpdated,null, 'Did not successfully fetch interestStatusUpdated value, instead "'+interestStatusUpdated+'"');
        })

        it('Should run updateInterest function from any address',function(done){

          function doUpdate(){
            contract.updateInterest({from:accounts[3]},function(e,r){
              assert.equal(e,null,'Random address could not run updateInterest functon');
              done()
            });
          }

          //Update EVM time to required time
          var time = deployment_config._loanTerm*deployment_config._dayLength*1000;
          forceMine(time);

          assert.equal(contract.loanMature.call(),true,'Loan not mature in due time ( '+web3.eth.getBlock('latest').timestamp+' )');
          doUpdate();
        })

        it('Should not allow race condition on updateInterest function',function(done){
          //Update EVM time to required time
          var alldone=0,
          time = deployment_config._loanCycle*2*deployment_config._dayLength*1000;
          forceMine(time);

          var actualTotalSupply = contract.actualTotalSupply.call();

          contract.updateInterest({from:accounts[3]},function(e,r){
            var totalSupply = contract.totalSupply.call();
            assert.equal(Number(totalSupply) == Number(actualTotalSupply),true,'Leakage allowed mutiple runs of updateInterest: '+Number(totalSupply)+' !== '+Number(actualTotalSupply) );
            alldone++;
            checkDone();
          })

          contract.updateInterest({from:accounts[3]},function(e,r){
            var totalSupply = contract.totalSupply.call();
            assert.equal(Number(totalSupply) == Number(actualTotalSupply),true,'Leakage allowed mutiple runs of updateInterest: '+Number(totalSupply)+' !== '+Number(actualTotalSupply) );
            alldone++;
            checkDone();
          })

          function checkDone(){
            if(alldone>1)
              done();
          }

        })

        it('Should fail to allow owner run finishMinting function',function(done){
            contract.finishMinting({from:Me},function(e,r){
              assert.notEqual(e,null,'Owner successfuly prevented minting without refunding Loan');
              done();
            });
        })

    })

    describe('Loan Refund',function(){
        it('Should fail to refund amount diffferent from total due',function(done){
            var _value = contract.getLoanValue.call(true);//fetch the initial loan value
            web3.eth.sendTransaction({from:Me,to:contract.address,value:_value},function(e,r){
              assert.notEqual(e,null,'Owner refunded Loan with wrong (initial without interest) amount');
              done();
            });
        })

        it('Should fail to refund correct amount from non-owner',function(done){
          var _value = contract.getLoanValue.call(false);//fetch the initial loan value
          web3.eth.sendTransaction({from:accounts[3],to:contract.address,value:_value},function(e,r){
            assert.notEqual(e,null,'Non-Owner successfully refunded Loan');
            done();
          });
        })

        it('Should successfully refund correct amount',function(done){
          var _value = contract.getLoanValue.call(false),//fetch the initial loan value
          _debtOwner = contract.debtOwner.call(),
          _debtownerbal = web3.eth.getBalance(_debtOwner);

          web3.eth.sendTransaction({from:Me,to:contract.address,value:_value},function(e,r){
            var balance = contract.balanceOf.call(Me),
            totalSupply = contract.actualTotalSupply.call();
            _debtownernewbal = web3.eth.getBalance(_debtOwner);
            assert.equal(e,null,'Loan not successfully refunded by Owner');
            assert.equal(Number(balance),Number(totalSupply),'Wrong number of tokens refunded to Owner');
            assert.equal(Number(_debtownernewbal),Number(_debtownerbal)+ Number(_value),'Wrong value of Ether sent to debtOwner');
            done();
          });
        })

    })

  });
