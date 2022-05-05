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
     * @notice This mapping store the amount of liquidity by address
     */
    mapping(address => uint256) storedValuePerAddress;

    /**
     * @notice The Total Value Locked(TVL) of the liquidity pool
     * @dev The TVL is public because front may want to display it
     */
    uint256 public totalValueLocked = 0;
    
    /**
     * @notice The Token to store in the liquidity pool
     */
    IERC20 token;

    constructor(address _erc) {
        token = IERC20(_erc);
    }

    /**
     * @notice Allow to store token in the Liquidity pool
     * @dev Refresh the stored amount in the address mapping ethPoolAddressBalances and refresh the total balance of the pool ethPoolTotalAmount
     * @param _amount Total amount to store in the eth liquidity pool
     */
    function stakeEthTokens(uint256 _amount) payable external {
        require(_amount > 0, "you can only insert a value greater than 0");
        require(token.transferFrom(msg.sender, address(this), _amount), "You must have the balance in your wallet and approve this contract");
        
        totalValueLocked = totalValueLocked  + _amount;
        storedValuePerAddress[msg.sender] = storedValuePerAddress[msg.sender] + _amount;
    }
}