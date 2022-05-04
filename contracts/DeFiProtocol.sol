// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Hello World DeFi Protocol
 * @author The Hello World Team
 * @notice This contract offer the possibility to stake ERC20 in Liquidity Pools to receive Hello World Token rewards
 */
contract DeFiProtocol is Ownable {

    /**
     * @notice This mapping store the amount of eth by address
     */
    mapping(address => uint256) ethPoolAddressBalances;

    /**
     * @notice The total amount stored in the liquidity pool
     */
    uint256 public ethPoolTotalAmount = 0;

    address public ETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    
    event Approval(address approver, address spender, uint256 amount);
    
    /**
     * @notice The ETH Token address
     */
    IERC20 private ethToken = IERC20(ETH);

    function approve(address spender, uint256 amount) public returns (bool) {
        ethToken.approve(spender, amount);
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /**
     * @notice Allow to store eth in the Eth Liquidity pool
     * @dev Refresh the stored amount in the address mapping ethPoolAddressBalances and refresh the total balance of the pool ethPoolTotalAmount
     * @param _amount Total amount to store in the eth liquidity pool
     */
    function stakeEthTokens(uint256 _amount) payable external returns(bool) {

        require(ethToken.transferFrom(msg.sender, address(this), _amount), "You don't have enough ETH in your wallet for this transaction");
        ethPoolTotalAmount = ethPoolTotalAmount  + _amount;
        ethPoolAddressBalances[msg.sender] = ethPoolAddressBalances[msg.sender] + _amount;
        return true;
    }
}