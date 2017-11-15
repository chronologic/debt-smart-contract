import 'zeppelin/token/ERC20Basic.sol';
import 'zeppelin/token/MintableToken.sol';

pragma solidity ^0.4.15;

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
  uint8 public dayLength = uint8(86400);//Number of seconds in a day
  uint8 public loanTerm;//Loan term in days
  uint8 public exchangeRate; //Exchange rate for Ether to loan coins
  uint256 public initialSupply; //Keep record of Initial value of Loan
  uint8 public interestCycleLength = uint8(30); //Total number of days per interest cycle
  uint256 public totalInterestCycle; //Total number of interest cycles completed
  uint256 public lastinterestCycle; //Keep record of Initial value of Loan
  address public debtOwner; //The address from which the loan will be funded, and to which the refund will be directed
  
  
  
  function DebtToken(string _tokenName,
      string _tokenSymbol,
      uint256 _initialAmount,
      uint8 _exchangeRate,
      uint8 _decimalUnits,
      uint8 _dayLength,
      uint8 _loanTerm
      ) {
      balances[msg.sender] = _initialAmount;               // Give the creator all initial tokens
      initialSupply = _initialAmount;                        // Update initial supply
      totalSupply = initialSupply;                           //Update total supply
      name = _tokenName;                                   // Set the name for display purposes
      decimals = _decimalUnits;                             // Amount of decimals for display purposes
      exchangeRate = _exchangeRate;                           // Exchange rate for the coins
      symbol = _tokenSymbol;                              // Set the symbol for display purposes
      dayLength = _dayLength;                             //Set the length of each day in seconds...For dev purposes
      loanTerm = _loanTerm;                               //Set the number of days, the loan would be active
      mintingFinished = true;                             //Disable minting  
  }
  
  /**
  Fetch total value of loan in wei (Initial +interest)
  */
  function getLoanValue() public returns(uint){} 
    
  /**
  Fetch total coins gained from interest
  */
  function getInterest() public returns (uint){}
  
  /**
  Check if updateInterest() needs to be called before refundLoan()
  */
  function inerestStatusUpdated() public returns(bool){}
  
  /**
  calculate the total number of passed interest cycles and coin value
  */
  function calculateInterestDue() internal returns(uint _coins,uint8 _cycle){}
    
  /**
  Check that an address is the owner of the debt or the loan contract partner
  */
  function isDebtOwner(address addr) public returns(bool){
    return (addr == debtOwner);
  }
  
  /**
  Update the interest of the contract
  */
  function updateInterest() public {
    uint interest_coins;
    uint8 interest_cycle;
    (interest_coins,interest_cycle) = calculateInterestDue();
    assert(interest_coins > 0 && interest_cycle > 0);
    super.mint(debtOwner , interest_coins);
  }
  
  /**
  Make payment to inititate loan
  */
  function fundLoan() public payable{
    require(isDebtOwner(msg.sender));
    require(msg.value > 0); //Ensure input available
    
    uint256 weiValue = getLoanValue();
    require(msg.value == weiValue);
    
    balances[owner] -= totalSupply;
    balances[msg.sender] += totalSupply;
    mintingFinished = false;                 //Enable minting  
    Transfer(owner,msg.sender,totalSupply);//Allow funding be tracked
  }
  
  /**
  Make payment to refund loan
  */
  function refundLoan() public payable{
    require( inerestStatusUpdated() ); //Ensure to Interest is updated
    require(msg.value > 0);
    require(msg.value == getLoanValue());
    
    require(balances[debtOwner] > 0);
    finishMinting() ;//Prevent further Minting
    
    balances[debtOwner] -= totalSupply;
    balances[owner] += totalSupply;
  }
  
  /**
  Fallback function
  */
  function() public payable{ 
    require(initialSupply > 0);//Stop the whole process if initialSupply not set
    if(msg.sender == owner && balances[msg.sender] == 0)
      refundLoan();
    else if(isDebtOwner(msg.sender) && balances[msg.sender] == 0)
      fundLoan();
    else revert(); //Throw if neither of cases apply, ensure no free money
  }
  
  //Disable all unwanted Features
  
  function transferOwnership(address newOwner) onlyOwner public {
    revert();  //Disable the transfer feature: Loan non-transferrable
  }
  
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
  
  function increaseApproval (address _spender, uint _addedValue) public returns (bool success) {
    revert();  //Disable the increaseApproval feature: Loan non-transferrable
  }
  
  function decreaseApproval (address _spender, uint _subtractedValue) public returns (bool success) {  
    revert();  //Disable the decreaseApproval feature: Loan non-transferrable
  }
  
  function mint(address _to, uint256 _amount) onlyOwner canMint public returns (bool) { 
    revert();  //Disable the decreaseApproval feature: Loan non-transferrable
  }
  
}