var DebtToken = artifacts.require('./DebtToken.sol');// Import contract of StandarTOken type

contract('DebtToken', function(accounts){
  
    var contract,web3,Me;
    const _1ether = 1e+18;
    Me = accounts[0];
    
    var deployment_config = {
      _tokenName:  'Performance Global Loan',
      _tokenSymbol:  'PGLOAN',
      _initialAmount: 500,
      _exchangeRate:   1,
      _decimalUnits:   18,
      _dayLength:  86400,
      _loanTerm:   60,
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
    
  });