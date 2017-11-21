# debt-smart-contract [WIP]
* Under development.



### Deployment

#### Parameters

|--|--------|--------------|
|--|--------|--------------|
|* | _tokenName: |  Name for the token |
|* |_tokenSymbol: | Symbol for the token |
|* |_initialAmount: | Actual amount of Ether requested in WEI |
|* |_exchangeRate: |  Amount of tokens per Ether |
|* |_decimalUnits: | Number of Decimal places |
|* |_dayLength: | Number of seconds in a day |
|* |_loanTerm: |  Number of days for Loan maturity; before interest begins |
|* |_loanCycle: | Number of days per loan cycle |
|* |_interestRate: | Interest rate (Percentage) |
|* |_debtOwner: | Lender address |

#### Deployed values
  * _tokenName:  Performance Global Loan
  * _tokenSymbol:  PGLOAN
  * _initialAmount: 500000000000000000000
  * _exchangeRate:   1
  * _decimalUnits:   18
  * _dayLength:  86400
  * _loanTerm:   60
  * _loanCycle: 30
  * _interestRate: 2
  * _debtOwner: address  

_ *_

### Tests
  * Test actual functionality of debt-smart-contract
  ~~~
  truffle test test/debtToken.js
  ~~~
  * Test that resricted Token functions are restricted :
  ~~~
  truffle test test/standardToken.js
  ~~~
