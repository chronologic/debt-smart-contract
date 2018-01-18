var BigNumber = require('bignumber.js')

const DebtTokenDeployer = artifacts.require('./DebtTokenDeployer.sol')
const SimpleToken = artifacts.require('./SimpleToken.sol')

contract('DebtTokenDeployer', accounts => {
    var deploymentConfig = {
      _tokenName:  'Performance Global Loan',
      _tokenSymbol:  'PGLOAN',
      _initialAmount: web3.toWei('0.5'),
      _exchangeRate:   1,
      _decimalUnits:   18,
      _dayLength:  10,
      _loanTerm:   60,
      _loanCycle: 20,
      _interestRatePerCycle: 2,
      _lender: accounts[1],
      _borrower: accounts[3],
      _deploymentFee: new BigNumber('10e18'),
    }

    function deployDebtTokenDeployer(tokenAddress) {
        return DebtTokenDeployer.new(tokenAddress, deploymentConfig._deploymentFee)
    }

    async function grantFeeTokens(token, deployerAddress, amount) {
        await token.transfer(deploymentConfig._borrower, deploymentConfig._deploymentFee.times(2), {from: accounts[0]})
        await token.approve(deployerAddress, amount, {from: deploymentConfig._borrower})
    }

    function createDebtToken(debtTokenDeployer) {
        return debtTokenDeployer.createDebtToken(
            deploymentConfig._tokenName,
            deploymentConfig._tokenSymbol,
            deploymentConfig._initialAmount,
            deploymentConfig._exchangeRate,
            deploymentConfig._decimalUnits,
            deploymentConfig._dayLength,
            deploymentConfig._loanTerm,
            deploymentConfig._loanCycle,
            deploymentConfig._interestRatePerCycle,
            deploymentConfig._lender,
            { from: deploymentConfig._borrower }
        )
    }

    function getEvents(contract, blocks = {})
    {
        return new Promise((success, reject) => {
            contract.allEvents(blocks).get((error, events) => {
                if (error) {
                    reject(error);
                } else {
                    success(events);
                }
            });
        });
    }

    it('should deploy the contract', async () => {
        const simpleToken = await SimpleToken.new()
        const debtTokenDeployer = await deployDebtTokenDeployer(simpleToken.address)

        assert.notEqual(debtTokenDeployer.address, null, 'Contract not successfully deployed')
        assert.isTrue(deploymentConfig._deploymentFee.equals(debtTokenDeployer.contract.dayTokenFees()))
        assert.equal(simpleToken.address, debtTokenDeployer.contract.dayTokenAddress())
    })

    it('should only allow owner to change the fee for deployment', async () => {
        const simpleToken = await SimpleToken.new()
        const debtTokenDeployer = await deployDebtTokenDeployer(simpleToken.address)

        const newFee = deploymentConfig._deploymentFee.times(2)
        const owner = await debtTokenDeployer.owner()
        const caller = accounts[1]

        assert.notEqual(owner, caller)
                      
        try {
            await debtTokenDeployer.updateDayTokenFees(newFee, {from: caller})
        } catch(error) {
            assert.isNotNull(error)
            return
        }

        assert.fail("Contract should only owner to change the fee")
    })

    it('should allow to change the fee for deployment', async () => {
        const simpleToken = await SimpleToken.new()
        const debtTokenDeployer = await deployDebtTokenDeployer(simpleToken.address)
        
        const newFee = deploymentConfig._deploymentFee.times(2)
        await debtTokenDeployer.updateDayTokenFees(newFee)

        const events = await getEvents(debtTokenDeployer)
        const foundEvent = events.find(ev => ev.event == 'FeeUpdated');

        assert.isTrue(foundEvent.args._fee.equals(newFee));
    })

    it('should fail when no fee was sent before deployment', async () => {
        const simpleToken = await SimpleToken.new()
        const debtTokenDeployer = await deployDebtTokenDeployer(simpleToken.address)
        
        try {
            await createDebtToken(debtTokenDeployer)
        } catch (error) {
            assert.isNotNull(error)
            return
        }

        assert.fail("Contract deployment passed without the fee")
    })

    it('should fail when fee was to small', async () => {
        const simpleToken = await SimpleToken.new()
        const debtTokenDeployer = await deployDebtTokenDeployer(simpleToken.address)

        const fee = deploymentConfig._deploymentFee.minus("1e18")
        await grantFeeTokens(simpleToken, debtTokenDeployer.address, fee)
        
        try {
            await createDebtToken(debtTokenDeployer)
        } catch (error) {
            assert.isNotNull(error)
            return
        }

        assert.fail("Contract deployment passed with smaller fee")
    })

    it('should pass when fee was to exactly as required', async () => {
        const simpleToken = await SimpleToken.new()
        const debtTokenDeployer = await deployDebtTokenDeployer(simpleToken.address)

        const fee = deploymentConfig._deploymentFee
        
        await grantFeeTokens(simpleToken, debtTokenDeployer.address, fee)
        await createDebtToken(debtTokenDeployer)

        const events = await getEvents(debtTokenDeployer)
        const foundEvent = events.find(ev => ev.event == 'DebtTokenCreated')

        assert.isOk(foundEvent);
        assert.equal(foundEvent.args._creator, deploymentConfig._borrower, "Borrower shall be set as contract creator")
        assert.isOk(foundEvent.args._debtTokenAddress)
        assert.isNumber(foundEvent.args._time.toNumber())
    })

    it('should take no more than transaction fee even if was granted more', async () => {
        const simpleToken = await SimpleToken.new()
        const debtTokenDeployer = await deployDebtTokenDeployer(simpleToken.address)

        const fee = deploymentConfig._deploymentFee.times(2)
        
        await grantFeeTokens(simpleToken, debtTokenDeployer.address, fee) // we always granting 2*deployment fee to borrower
        await createDebtToken(debtTokenDeployer)

        const contractTokenBalance = await simpleToken.balanceOf(debtTokenDeployer.address)
        const borrowerTokenBalanceAfterDeployment = await simpleToken.balanceOf(deploymentConfig._borrower)

        const events = await getEvents(debtTokenDeployer)
        const foundEvent = events.find(ev => ev.event == 'DebtTokenCreated')

        assert.isOk(foundEvent);
        assert.equal(foundEvent.args._creator, deploymentConfig._borrower, "Borrower shall be set as contract creator")
        assert.isOk(foundEvent.args._debtTokenAddress);
        assert.isNumber(foundEvent.args._time.toNumber())

        assert.isTrue(deploymentConfig._deploymentFee.equals(contractTokenBalance))
        assert.isTrue(deploymentConfig._deploymentFee.equals(borrowerTokenBalanceAfterDeployment))
    })
})
