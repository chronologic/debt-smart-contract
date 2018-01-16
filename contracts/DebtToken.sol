import 'zeppelin/ownership/Ownable.sol';
import 'zeppelin/math/SafeMath.sol';

pragma solidity ^0.4.15;

contract DebtToken is Ownable {
  using SafeMath for uint256;
  /**
  Recognition data
  */
  string public name;
  string public symbol;
  string public version = 'DT0.1';
  
  /**
  Actual logic data
  */
  uint256 public decimals;
  uint256 public dayLength = 86400;//Number of seconds in a day
  uint256 public loanTerm;//Loan term in days
  uint256 public exchangeRate; //Exchange rate for Ether to loan coins
  uint256 public initialSupply; //Keep record of Initial value of Loan
  uint256 public loanActivation; //Timestamp the loan was funded
  uint256 public interestRate; //Interest rate per interest cycle
  uint256 public interestCycleLength = 30; //Total number of days per interest cycle
  uint256 public totalInterestCycle; //Total number of interest cycles completed
  uint256 public lastinterestCycle; //Keep record of Initial value of Loan
  address public lender; //The address from which the loan will be funded, and to which the refund will be directed
  uint256 public constant divisor = 100;
  
  function DebtToken(string _tokenName,
      string _tokenSymbol,
      uint256 _initialAmount,
      uint256 _exchangeRate,
      uint256 _decimalUnits,
      uint256 _dayLength,
      uint256 _loanTerm,
      uint256 _loanCycle,
      uint256 _interestRate,
      address _lender
      ) {
      exchangeRate = _exchangeRate;                           // Exchange rate for the coins
      balances[msg.sender] = _initialAmount.mul(exchangeRate);     // Give the creator all initial tokens
      initialSupply = _initialAmount.mul(exchangeRate);            // Update initial supply
      totalSupply = initialSupply;                           //Update total supply
      name = _tokenName;                                   // Set the name for display purposes
      decimals = _decimalUnits;                             // Amount of decimals for display purposes
      symbol = _tokenSymbol;                              // Set the symbol for display purposes
      dayLength = _dayLength;                             //Set the length of each day in seconds...For dev purposes
      loanTerm = _loanTerm;                               //Set the number of days, for loan maturity
      interestCycleLength = _loanCycle;                   //set the Interest cycle period
      interestRate = _interestRate;                      //Set the Interest rate per cycle
      lender = _lender;                             //set lender address

      Transfer(0,msg.sender,totalSupply);//Allow funding be tracked
  }

  /** 
  Partial ERC20 functionality
   */
  uint256 public totalSupply;
  mapping(address => uint256) balances;

  event Transfer(address indexed from, address indexed to, uint256 value);

  function balanceOf(address _owner) public constant returns (uint256 balance) {
    return balances[_owner];
  }

  /**
  MintableToken functionality
   */
  event Mint(address indexed to, uint256 amount);
  event MintFinished();

  bool public mintingFinished = true;


  modifier canMint() {
    require(!mintingFinished);
    _;
  }

  /**
   * @dev Function to mint tokens
   * @param _to The address that will receive the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint(address _to, uint256 _amount) canMint private returns (bool) {
    totalSupply = totalSupply.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    Mint(_to, _amount);
    Transfer(0x0, _to, _amount);
    return true;
  }

  /**
   * @dev Function to stop minting new tokens.
   * @return True if the operation was successful.
   */
  function finishMinting() onlyOwner private returns (bool) {
    mintingFinished = true;
    MintFinished();
    return true;
  }

  /**
  Debt token functionality
   */
  function actualTotalSupply() public constant returns(uint) {
    uint256 coins;
    uint256 cycle;
    (coins,cycle) = calculateInterestDue();
    return totalSupply.add(coins);
  }

  /**
  Fetch total value of loan in wei (Initial +interest)
  */
  function getLoanValue(bool initial) public constant returns(uint){
    //TODO get a more dynamic way to calculate
    if(initial == true)
      return initialSupply.mul(exchangeRate);
    else{
      uint totalTokens = actualTotalSupply().sub(balances[owner]);
      return totalTokens.mul(exchangeRate);
    }
  }

  /**
  Fetch total coins gained from interest
  */
  function getInterest() public constant returns (uint){
    return actualTotalSupply().sub(initialSupply);
  }

  /**
  Check that an address is the lender
  */
  function isLender(address addr) public constant returns(bool){
    return (addr == lender);
  }

  /**
  Check if the loan is mature for interest
  */
  function loanMature() public constant returns (bool){
    if(loanActivation == 0)
      return false;
    else
      return now >= loanActivation.add( dayLength.mul(loanTerm) );
  }

  /**
  Check if updateInterest() needs to be called before refundLoan()
  */
  function interestStatusUpdated() public constant returns(bool){
    if(!loanMature())
      return true;
    else
      return !( now >= lastinterestCycle.add( interestCycleLength.mul(dayLength) ) );
  }

  /**

  */

  /**
  calculate the total number of passed interest cycles and coin value
  */
  function calculateInterestDue() public constant returns(uint256 _coins,uint256 _cycle){
    if(!loanMature())
      return (0,0);
    else if(balances[lender] == 0)
      return (0,0);
    else{
      uint timeDiff = now.sub(lastinterestCycle);
      _cycle = timeDiff.div(dayLength.mul(interestCycleLength) );
      _coins = _cycle.mul( interestRate.mul(initialSupply) ).div(divisor);//Delayed division to avoid too early floor
    }
  }

  /**
  Update the interest of the contract
  */
  function updateInterest() public {
    require( loanMature() );
    uint interest_coins;
    uint256 interest_cycle;
    (interest_coins,interest_cycle) = calculateInterestDue();
    assert(interest_coins > 0 && interest_cycle > 0);
    totalInterestCycle =  totalInterestCycle.add(interest_cycle);
    lastinterestCycle = lastinterestCycle.add( interest_cycle.mul( interestCycleLength.mul(dayLength) ) );
    mint(lender , interest_coins);
  }

  /**
  Make payment to inititate loan
  */
  function fundLoan() public payable{
    require(isLender(msg.sender));
    require(msg.value > 0); //Ensure input available

    uint256 weiValue = getLoanValue(true);
    require(msg.value == weiValue);
    require( balances[msg.sender] == 0); //Avoid double payment

    balances[owner] = balances[owner].sub(totalSupply);
    balances[msg.sender] = balances[msg.sender].add(totalSupply);
    loanActivation = now;  //store the time loan was activated
    lastinterestCycle = now.add(dayLength.mul(loanTerm) ) ; //store the date interest matures
    owner.transfer(msg.value);
    mintingFinished = false;                 //Enable minting
    Transfer(owner,msg.sender,totalSupply);//Allow funding be tracked
  }

  /**
  Make payment to refund loan
  */
  function refundLoan() onlyOwner public payable{
    if(! interestStatusUpdated() )
        updateInterest(); //Ensure Interest is updated

    require(msg.value > 0);
    require(msg.value == getLoanValue(false));

    require(balances[lender] > 0);
    finishMinting() ;//Prevent further Minting

    balances[lender] = balances[lender].sub(totalSupply);
    balances[owner] = balances[owner].add(totalSupply);
    lender.transfer(msg.value);
    Transfer(lender,owner,totalSupply);//Allow funding be tracked
  }

  /**
  Fallback function
  */
  function() public payable{
    require(initialSupply > 0);//Stop the whole process if initialSupply not set
    if(msg.sender == owner && balances[msg.sender] == 0)
      refundLoan();
    else if(isLender(msg.sender) && balances[msg.sender] == 0)
      fundLoan();
    else revert(); //Throw if neither of cases apply, ensure no free money
  }

  //Disable all unwanted Features

  function transferOwnership(address newOwner) onlyOwner public {
    revert();  //Disable the transferOwnership feature: Loan non-transferrable
  }
}
