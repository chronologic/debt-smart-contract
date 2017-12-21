pragma solidity ^0.4.15;
import './DebtToken.sol';
contract DeployDebtToken is Ownable{

    address public owner;
    address public dayTokenAddress;
    uint public dayTokenFees; //DAY tokens to be paid for deploying custom DAY contract
    ERC20 dayToken;

    event FeeUpdated(uint _fee, uint _time);
    event DebtTokenCreated(address Indexed _creator, address _debtTokenAddress, uint _time);

    function DeployDebtToken(address _dayTokenAddress, uint _dayTokenFees){
            dayTokenAddress = _dayTokenAddress;
            dayTokenFees = _dayTokenFees;
            owner = msg.sender;
        dayToken = ERC20(dayTokenAddress);
    }

    function updateDayTokenFees(uint _dayTokenFees) onlyOwner public {
        dayTokenFees = _dayTokenFees;
        FeeUpdated(dayTokenFees, now);
    }

    function createDebtToken(string _tokenName,
        string _tokenSymbol,
        uint256 _initialAmount,
        uint256 _exchangeRate,
        uint256 _decimalUnits,
        uint256 _dayLength,
        uint256 _loanTerm,
        uint256 _loanCycle,
        uint256 _interestRate,
        address _debtOwner){

        address user = msg.sender;

        if(dayToken.transferFrom(user, this, dayTokenFees)){
            DebtToken newDebtToken = new DebtToken(_tokenName, _tokenSymbol, _initialAmount, _exchangeRatr,
                                                    _decimalUnits, _dayLength, _loanTerm, _loanCycle,
                                                    _interestRate, _debtOwner);
            DeployDebtToken(user, newDebtToken, now);
        }


    }

    // to collect all fees paid till now
    function fetchDayTokens() onlyOwner public {
        dayToken.transfer(owner, dayToken.balanceOf(this));
    }

}
