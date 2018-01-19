import './DebtToken.sol';
import '../installed_contracts/zeppelin/contracts/token/ERC20.sol';
import '../installed_contracts/zeppelin/contracts/ownership/Ownable.sol';

pragma solidity ^0.4.18;
contract DebtTokenDeployer is Ownable{

    address public dayTokenAddress;
    uint public dayTokenFees; //DAY tokens to be paid for deploying custom DAY contract
    ERC20 dayToken;

    event FeeUpdated(uint _fee, uint _time);
    event DebtTokenCreated(address  _creator, address _debtTokenAddress, uint256 _time);

    function DebtTokenDeployer(address _dayTokenAddress, uint _dayTokenFees){
        dayTokenAddress = _dayTokenAddress;
        dayTokenFees = _dayTokenFees;
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
        uint256 _intrestRatePerCycle,
        address _lender)
    public
    {
        if(dayToken.transferFrom(msg.sender, this, dayTokenFees)){
            DebtToken newDebtToken = new DebtToken(_tokenName, _tokenSymbol, _initialAmount, _exchangeRate,
                _decimalUnits, _dayLength, _loanTerm, _loanCycle,
                _intrestRatePerCycle, _lender, msg.sender);
            DebtTokenCreated(msg.sender, address(newDebtToken), now);
        }
    }

    // to collect all fees paid till now
    function fetchDayTokens() onlyOwner public {
        dayToken.transfer(owner, dayToken.balanceOf(this));
    }
}