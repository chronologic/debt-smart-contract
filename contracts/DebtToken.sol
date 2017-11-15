

pragma solidity ^0.4.13;

contract DebtToken is ERC20Basic,MintableToken{
  
  /**
  Recognition data
  */
  string public name;
  string public symbol;
  string public version = 'DT0.1';
  
  /**
  Actual logic data
  */
  uint8 public decimals;
  uint public dayLength = 86400;//Number of seconds in a day
  uint public loanTerm;//Loan term in days
  uint8 public exchangeRate; //Exchange rate for Ether to loan coins
  uint public initialSupply; //Keep record of Initial value of Loan
  
  
  
  function DebtToken(int256 _initialAmount,
      string _tokenName,
      uint8 _decimalUnits,
      string _tokenSymbol,
      uint _dayLength,
      uint _loanTerm
      ) {
      balances[msg.sender] = _initialAmount;               // Give the creator all initial tokens
      initialSupply = _initialAmount;                        // Update initial supply
      totalSupply = _initialAmount;                        // Update total supply
      name = _tokenName;                                   // Set the name for display purposes
      decimals = _decimalUnits;                            // Amount of decimals for display purposes
      symbol = _tokenSymbol;                              // Set the symbol for display purposes
      dayLength = _dayLength;                             //Set the length of each day in seconds...For dev purposes
      loanTerm = _loanTerm;                               //Set the number of days, the loan would be active      
  }

    
  
  
    
}