# DeFi-Liquidity-Pool

## Created by the Hello World Team during Alyra's training

### What is this project ?

This project is a liquidity pool that allows the storage of ERC20 tokens.

### Who are the team member ?

- Guillaume P : 
    - Responsible for developing the stacking part
    - Responsible for developing the data recovery gateway between the front and the Smart contract
    - Unit Test Writer for the Smart Contract
    - Code Reviewer
- Arnaud G : 
    - Responsible for developing the unstacking part
    - Responsible for checking security element of the Smart Contract
    - Development of the front and graphic components
    - Unit Test Writer for the Smart Contract
- Sylvain B : 
    - Responsible for developing the reward part of the Smart Contract
    - Responsible for developing for checking the security of the Smart Contract
    - Unit Test Writer for the Smart Contract
    - Development of graphic components for the front part
    - Designer of the Dapp


### How it works ? 

We created two ERC20 custom token for this exercice : 

- HWT Token : The Hello World Token that is used to reward people who stake in our pool. This token has also it's own Liquidity Pool

- GUM Token : A second ERC20, created just for staking in our liquidity pool.

You have access to 3 Liquidity pools, with high daily reward for the training : 

- A HWT Pool : 8% daily HWT reward 
- A GUM pool : 5% daily HWT reward
- A Link pool : To Stake a real ERC20, and show the use of Chainlink Oracle to get Link price : 3 % daily HWT Reward

### How can I test it ? 

You can access to this project via the github-page of the project.

### How is it developped ? 

- Solidity Smart Contract
- Truffle framework
- React and web3.js


