var DebtToken = artifacts.require('./DebtToken.sol');// Import contract of StandarTOken type

contract('DebtToken', function(accounts){

    var contract,newcontract,web3,Me;
    const _1ether = 1e+18;
    Me = accounts[0];

    var deployment_config = {
      _tokenName:  'Performance Global Loan',
      _tokenSymbol:  'PGLOAN',
      _initialAmount: 0.5*_1ether,
      _exchangeRate:   1,
      _dayLength:  10,
      _loanTerm:   60,
      _loanCycle: 20,
      _interestRatePerCycle: 2,
      _lender: accounts[1],
      _borrower: Me
    },
    deployNewDebtContract = function(){
      return DebtToken.new(
          deployment_config._tokenName,
          deployment_config._tokenSymbol,
          deployment_config._initialAmount,
          deployment_config._exchangeRate,
          deployment_config._dayLength,
          deployment_config._loanTerm,
          deployment_config._loanCycle,
          deployment_config._interestRatePerCycle,
          deployment_config._lender,
          deployment_config._borrower
      );
    };

    function forceMine(time){
      web3.currentProvider.send({jsonrpc: "2.0", method: "evm_increaseTime", params: [time], id: 123});
      web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 0})
    }

    it('should deploy the contract', function (done) {
        deployNewDebtContract()
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
                console.log('totalSupply:', Number(r));
              });

            assert.notEqual(contract.address, null, 'Contract not successfully deployed');
            done();
        });
    });

    describe('Exchange Rate:: ',function(){

      it('Should test the Exchange Rate functionality',function(done){
        var exchange  = Math.floor(Math.random()*10);
        console.log(exchange);
        DebtToken.new(
            deployment_config._tokenName,
            deployment_config._tokenSymbol,
            deployment_config._initialAmount,
            exchange,
            deployment_config._dayLength,
            deployment_config._loanTerm,
            deployment_config._loanCycle,
            deployment_config._interestRatePerCycle,
            deployment_config._lender,
            deployment_config._borrower
        )
        .then(function(inst){
            var loanVal = inst.contract.getLoanValue.call(true);
            assert.equal( Number(loanVal) , deployment_config._initialAmount, 'Exchange wrongly calculated');
            done();
        })
      })
      
    })

    describe('Loan Activation:: ',function(){

        it('Should fail to send wrong amount to the contract from non-lender',function(done){
            var _value = web3.toWei(2, 'ether');
            web3.eth.sendTransaction({from:accounts[2],to:contract.address,value:_value},function(e,r){
              assert.notEqual(e,null,'Wrong amount used to fund loan by non-lender');
              done();
            });
        });

        it('Should fail to send right amount to the contract from non-lender',function(done){
          var _value = deployment_config._initialAmount;
          web3.eth.sendTransaction({from:accounts[2],to:contract.address,value:_value},function(e,r){
            assert.notEqual(e,null,'Loan funded by non-lender');
            done();
          });
        });

        it('Should fail to send wrong amount to the contract from lender',function(done){
          var _value = web3.toWei(2, 'ether'),
          lender = deployment_config._lender;
          web3.eth.sendTransaction({from:lender,to:contract.address,value:_value},function(e,r){
            assert.notEqual(e,null,'Wrong amount used to fund loan');
            done();
          });
        });

        it('Should send right amount to the contract from lender',function(done){
          var _lender = contract.lender.call(),
          _value = contract.getLoanValue.call(true),
          _mybal = web3.eth.getBalance(Me),
          txn = {from:_lender,to:contract.address,value: _value, gas: 210000 };

          web3.eth.sendTransaction(txn,function(e,r){
            var balance = contract.balanceOf.call(_lender),
            totalSupply = contract.actualTotalSupply.call();
            _mynewbal = web3.eth.getBalance(Me);
            assert.equal(e,null,'Loan not successfully funded by lender');
            assert.equal(Number(balance),Number(totalSupply),'Wrong number of tokens assigned to lender');
            assert.equal(Number(_mynewbal),Number(_mybal)+ deployment_config._initialAmount,'Wrong value of Ether sent to Owner');
            done();
          });
        });
    })

    describe('Interest Accruing:: ',function(){
        it('Should fetch isInterestStatusUpdated status',function(){
            var isInterestStatusUpdated = contract.isInterestStatusUpdated.call();

            assert.notEqual(isInterestStatusUpdated,null, 'Did not successfully fetch isInterestStatusUpdated value, instead "'+isInterestStatusUpdated+'"');
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

          assert.equal(contract.isTermOver.call(),true,'Loan tern has not over ( '+web3.eth.getBlock('latest').timestamp+' )');
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
          assert.isNotOk(contract.finishMinting, "finishMiting shall be available internally only");
          done();
        })

    })

    describe('Loan Refund:: ',function(){
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
          _lender = contract.lender.call(),
          _lenderBalance = web3.eth.getBalance(_lender);

          web3.eth.sendTransaction({from:Me,to:contract.address,value:_value,gas:4000000},function(e,r){
            var balance = contract.balanceOf.call(Me),
            totalSupply = contract.actualTotalSupply.call();
            _debtownernewbal = web3.eth.getBalance(_lender);
            assert.equal(e,null,'Loan not successfully refunded by Owner');
            assert.equal(Number(balance),Number(totalSupply),'Wrong number of tokens refunded to Owner');
            assert.equal(Number(_debtownernewbal),Number(_lenderBalance)+ Number(_value),'Wrong value of Ether sent to lender');
            done();
          });
        })

        it('Should successfully refund before contract maturation',function(done){
          deployNewDebtContract()
          .then(function(inst){
              newcontract = inst.contract;
              assert.notEqual(contract.address, null, 'Contract not successfully deployed');

              var _lender = newcontract.lender.call(),
              _value = newcontract.getLoanValue.call(true),
              _mybal = web3.eth.getBalance(Me),
              txn = {from:_lender,to:newcontract.address,value: _value, gas: 210000 };

              web3.eth.sendTransaction(txn,function(e,r){

                var _lender = newcontract.lender.call(),
                balance = newcontract.balanceOf.call(_lender),
                totalSupply = newcontract.actualTotalSupply.call();
                _mynewbal = web3.eth.getBalance(Me);

                assert.equal(e,null,'Loan not successfully funded by lender');
                assert.equal(Number(balance),Number(totalSupply),'Wrong number of tokens assigned to lender');
                assert.equal(Number(_mynewbal),Number(_mybal)+ deployment_config._initialAmount,'Wrong value of Ether sent to Owner');

                      var _value = newcontract.getLoanValue.call(false),//fetch the initial loan value
                      _lender = newcontract.lender.call(),
                      _lenderBalance = web3.eth.getBalance(_lender);
                      console.log('Loan term over:', newcontract.isTermOver.call() );

                      web3.eth.sendTransaction({from:Me,to:newcontract.address,value:_value},function(e,r){

                        var balance = newcontract.balanceOf.call(Me),
                        totalSupply = newcontract.actualTotalSupply.call();
                        _debtownernewbal = web3.eth.getBalance(_lender);
                        assert.equal(e,null,'Loan not successfully refunded by Owner');
                        assert.equal(Number(balance),Number(totalSupply),'Wrong number of tokens refunded to Owner');
                        assert.equal(Number(_debtownernewbal),Number(_lenderBalance)+ Number(_value),'Wrong value of Ether sent to lender');
                        done();
                      });
              });
          });
        });

        it('Should confirm loanValue does not increase after refundLoan',function(done){
          var time = deployment_config._loanCycle*2*deployment_config._dayLength*1000;
          forceMine(time);

          totalSupply = contract.totalSupply.call(),
          actualTotalSupply = contract.actualTotalSupply.call();

          newtotalSupply = newcontract.totalSupply.call(),
          newactualTotalSupply = newcontract.actualTotalSupply.call();

          assert.equal( Number(totalSupply), Number(actualTotalSupply), 'Loan increased from '+totalSupply+' to '+actualTotalSupply+' after loan was repaid');
          assert.equal( Number(newtotalSupply), Number(newactualTotalSupply), 'New Loan increased from '+newtotalSupply+' to '+newactualTotalSupply+' after loan was repaid');
          done();
        })

    })

  });
