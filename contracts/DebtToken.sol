

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
  uint8 public dayLength = 86400;//Number of seconds in a day
  uint8 public loanTerm;//Loan term in days
  uint8 public exchangeRate; //Exchange rate for Ether to loan coins
  uint256 public initialSupply; //Keep record of Initial value of Loan
  address public debtOwner; //The address from which the loan will be funded, and to which the refund will be directed
  
  
  
  function DebtToken(string _tokenName,
      string _tokenSymbol,,
      uint256 _initialAmount,
      uint8 exchangeRate,
      uint8 _decimalUnits,
      uint8 _dayLength,
      uint8 _loanTerm
      ) {
      balances[msg.sender] = _initialAmount;               // Give the creator all initial tokens
      initialSupply = _initialAmount;                        // Update initial supply
      totalSupply = initialSupply;                           //Update total supply
      name = _tokenName;                                   // Set the name for display purposes
      decimals = _decimalUnits;                            // Amount of decimals for display purposes
      symbol = _tokenSymbol;                              // Set the symbol for display purposes
      dayLength = _dayLength;                             //Set the length of each day in seconds...For dev purposes
      loanTerm = _loanTerm;                               //Set the number of days, the loan would be active      
  }
  
  /**
  return present value of loan in wei (Initial +interest)
  */
  function getLoanValue() return(uint){} 
    
  //Check that an address is the owner of the debt or the loan contract partner
  function isDebtOwner(address addr) return(bool){
    return (addr == debtOwner);
  }
  
  /**
  Make payment to inititate loan
  */
  function fundLoan() public {
    require(isDebtOwner(msg.sender));
    require(msg.value > 0); //Ensure input available
    
    uint256 weiValue = getLoanValue();
    require(msg.value == weiValue);
    
    balances[owner] -= totalSupply;
    balances[msg.sender] += totalSupply;
    Transfer(owner,msg.sender,totalSupply);//Allow funding be tracked
  }
  
  /**
  Make payment to refund loan
  */
  function refundLoan() public{
    require(msg.value > 0);
    require(msg.value == getLoanValue());
  }
  
  function(){ //Fallback function
    require(initialSupply > 0);//Stop the whole process if initialSupply not set
    if(msg.sender == owner && balances[msg.sender] == 0)
      refundLoan();
    else if(isDebtOwner(msg.sender) && balances[msg.sender] == 0)
      fundLoan();
    else revert(); //Throw if neither of cases apply, ensure no free money
  }
  
  //Disable all unwanted Features
  function transfer(address to, uint256 value) public returns (bool){
    revert();  //Disable the transfer feature: Loan non-transferrable
  }
  
  function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
    revert();  //Disable the transferFrom feature: Loan non-transferrable
  }
  
  function approve(address _spender, uint256 _value) public returns (bool) {
    revert();  //Disable the approve feature: Loan non-transferrable
  }
  
  function allowance(address _owner, address _spender) public constant returns (uint256 remaining) {
    revert();  //Disable the allowance feature: Loan non-transferrable
  } 
  
  function increaseApproval (address _spender, uint _addedValue)returns (bool success) {
    revert();  //Disable the allowance feature: Loan non-transferrable
  }
  
  function decreaseApproval (address _spender, uint _subtractedValue)returns (bool success) {  
    revert();  //Disable the allowance feature: Loan non-transferrable
  }

    
  
  
    
}