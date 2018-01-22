# debt-smart-contract [POC]
* First iteration.



## Deployment

### Debt Token

#### Parameters

|--|--------|--------------|
|--|--------|--------------|
|* | _tokenName: |  Name for the token |
|* |_tokenSymbol: | Symbol for the token |
|* |_initialAmount: | Actual amount of Ether requested in WEI |
|* |_exchangeRate: |  Amount of tokens per Ether |
|* |_dayLength: | Number of seconds in a day |
|* |_loanTerm: |  Number of days for Loan maturity; before interest begins |
|* |_loanCycle: | Number of days per loan cycle |
|* |_interestRate: | Interest rate (Percentage) |
|* |_lender: | Lender address |
|* |_borrower: | Borrower address |

#### Deployed values
  * _tokenName:  Performance Global Loan
  * _tokenSymbol:  PGLOAN
  * _initialAmount: 500000000000000000000
  * _exchangeRate:   1
  * _dayLength:  86400
  * _loanTerm:   60
  * _loanCycle: 30
  * _interestRate: 2
  * _lender: address  
  * _borrower: address  

#### Ropsten Test deployment
  Most recent version of the code is deployed at:

  https://ropsten.etherscan.io/token/0x126c694e085517c257ecdad8f46455cf0403008c
  https://ropsten.etherscan.io/address/0x126c694e085517c257ecdad8f46455cf0403008c


### Debt Token Deployer

####  Parameters

  |--|--------|--------------|
  |--|--------|--------------|
  |* | _dayTokenAddress: |  Address of DAY Tokens |
  |* |_dayTokenFees: | Number of DAY tokens, required as fees |

  #### Deployed values
    * _dayTokenAddress:  0x7941bc77e1d6bd4628467b6cd3650f20f745db06
    * _dayTokenFees:  100000000000000000000

  #### Ropsten Test deployment
    Most recent version of the code is deployed at:

    https://ropsten.etherscan.io/address/0x9d396156594b6a665fe28397e7bff3679dc24283


### Tests
  * Test actual functionality of debt-smart-contract
  ~~~
  truffle test test/1_debtToken.js
  ~~~
  * Test that actual functionality of debt-smart-contract deployer :
  ~~~
  truffle test test/2_debtTokenDeployer.js
  ~~~
