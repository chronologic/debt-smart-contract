

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
    
    uint weiValue = getLoanValue();
    require(msg.value == weiValue);
    
    totalSupply = initialSupply;//Initiate loan
    Transfer(owner,msg.value,totalSupply);//Allow funding be tracked
  }
  
  /**
  Make payment to refund loan
  */
  function refundLoan() public{
    require(msg.value > 0);
    require(msg.value == getLoanValue());
  }
  
  function(){ //Fallback function
    if(msg.sender == owner && balances[msg.sender] == 0)
      refundLoan();
    else if(isDebtOwner(msg.sender) && balances[msg.sender] == 0)
      fundLoan();
    else revert(); //Throw if neither of cases apply, ensure no free money
  }
  
  function isDebtOwner(){
    
  }
  
  //Disable all unwanted Features
  function transfer(address to, uint256 value) public returns (bool){
    revert();  //Disable the transfer feature: Loan non-transferrable
  }
  
  function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
    revert();  //Disable the transfer feature: Loan non-transferrable
  }
  
  function approve(address _spender, uint256 _value) public returns (bool) {
  
  

    
  
  
    
}