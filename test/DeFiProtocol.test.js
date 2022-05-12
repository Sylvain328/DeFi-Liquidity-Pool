const DeFiProtocol = artifacts.require("./DeFiProtocol.sol");
const HwToken = artifacts.require("./HWT.sol");
const { BN, expectRevert, expectEvent, time } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('DeFiProtocol', accounts => {

    const owner = accounts[0];

    convertEthToWei = (ethAmount) => {
        return BigInt(ethAmount * 1e18);
    }

    context("Methods tests", () => {

        //::::::::::::::: Stake Method :::::::::::::::::/

        describe("stake() method tests", () => {

            beforeEach(async () => {
                HwTokenInstance = await HwToken.new({from:owner});
                DeFiProtocolInstance = await DeFiProtocol.new(HwTokenInstance.address, {from:owner});
                await DeFiProtocolInstance.createLiquidityPool(HwTokenInstance.address, HwTokenInstance.address, new BN(925925925925), {from: owner});
            });    

            it("should stake 5 token in the liquidity pool", async () => {
                const valueToStake = convertEthToWei(5);
                await HwTokenInstance.approve(DeFiProtocolInstance.address, valueToStake, {from: owner});
                await DeFiProtocolInstance.stake(HwTokenInstance.address, valueToStake, {from: owner});
                const tvl = await DeFiProtocolInstance.getTotalValueLocked(HwTokenInstance.address, {from: owner});
                expect(new BN(tvl)).to.be.bignumber.equal(new BN(valueToStake));
            });

            it("should stake an amount smaller than approved amount ", async () => {
                const valueToStake = convertEthToWei(5);
                await HwTokenInstance.approve(DeFiProtocolInstance.address, convertEthToWei(10), {from: owner});
                await DeFiProtocolInstance.stake(HwTokenInstance.address, valueToStake, {from: owner});
                const tvl = await DeFiProtocolInstance.getTotalValueLocked(HwTokenInstance.address, {from: owner});
                expect(new BN(tvl)).to.be.bignumber.equal(new BN(valueToStake));
            });
        
            describe("Revert cases", () => {

                it("should revert when you try to stake 0 amount", async () => {
                    await HwTokenInstance.approve(DeFiProtocolInstance.address, convertEthToWei(5), {from: owner});
                    await expectRevert(DeFiProtocolInstance.stake(HwTokenInstance.address, 0, {from: owner}), "Only amount above zero are authorized");
                });
                
                it("should revert when you don't approve the contract", async () => {
                    await expectRevert(DeFiProtocolInstance.stake(HwTokenInstance.address, convertEthToWei(5), {from: owner}), "ERC20: insufficient allowance.");
                });
    
                it("should revert when try to stake amount bigger than approved amount", async () => {
                    await HwTokenInstance.approve(DeFiProtocolInstance.address, convertEthToWei(5), {from: owner});
                    await expectRevert(DeFiProtocolInstance.stake(HwTokenInstance.address, convertEthToWei(10), {from: owner}), "ERC20: insufficient allowance.");
                });
            });

            describe("Event cases", () => {

                it("should emit an event when amount is properly staked", async () => {
                    const valueToStake = convertEthToWei(5);
                    await HwTokenInstance.approve(DeFiProtocolInstance.address, convertEthToWei(10), {from: owner});
                    
                    expectEvent(await DeFiProtocolInstance.stake(HwTokenInstance.address, valueToStake, {from: owner}), "AmountStaked", {stakedAmount: new BN(valueToStake)});
                });
            });
        });

        //::::::::::::::: Unstake Method :::::::::::::::::/

        describe("unstake() method tests", () => {

            beforeEach(async () => {
                HwTokenInstance = await HwToken.new({from:owner});
                DeFiProtocolInstance = await DeFiProtocol.new(HwTokenInstance.address, {from:owner});
                await DeFiProtocolInstance.createLiquidityPool(HwTokenInstance.address, HwTokenInstance.address, new BN(925925925925), {from: owner});
                await HwTokenInstance.transfer(DeFiProtocolInstance.address, convertEthToWei(20), {from: owner});
                const stakedValue = convertEthToWei(5);
                await HwTokenInstance.approve(DeFiProtocolInstance.address, stakedValue, {from: owner});
                await DeFiProtocolInstance.stake(HwTokenInstance.address, stakedValue, {from: owner});
            });    

            it("should unstake 5 token in the liquidity pool, TVL should be 0", async () => {
                await DeFiProtocolInstance.unstake(HwTokenInstance.address, convertEthToWei(5), {from: owner});
                const tvl = await DeFiProtocolInstance.getTotalValueLocked(HwTokenInstance.address, {from: owner});
                expect(new BN(tvl)).to.be.bignumber.equal(new BN(0));
            });

            it("should unstake 2.5 token in the liquidity pool, TVL should be 2.5", async () => {
                await DeFiProtocolInstance.unstake(HwTokenInstance.address, convertEthToWei(2.5), {from: owner});
                const tvl = await DeFiProtocolInstance.getTotalValueLocked(HwTokenInstance.address, {from: owner});
                expect(new BN(tvl)).to.be.bignumber.equal(new BN(convertEthToWei(2.5)));
            });
            
            describe("Revert cases", () => {

                it("should revert when you try to unstake 0 amount", async () => {
                    await expectRevert(DeFiProtocolInstance.unstake(HwTokenInstance.address, 0, {from: owner}), "Only amount above zero are authorized");
                });
                
                it("should revert when you try to unstake an amount bigger than your staked amount", async () => {
                    await expectRevert(DeFiProtocolInstance.unstake(HwTokenInstance.address, convertEthToWei(10), {from: owner}), "You didn't stored this amount in the pool");
                });
            });

            describe("Event cases", () => {

                it("should emit an event when amount is properly unstaked", async () => {
                    expectEvent(await DeFiProtocolInstance.unstake(HwTokenInstance.address, convertEthToWei(5), {from: owner}), "AmountUnstaked", {unstakedAmount: new BN(convertEthToWei(0))});
                });
            });
        });

        //::::::::::::::: getStakedAmount Method :::::::::::::::::/

        describe("getStakedAmount() method tests", () => {
            
            beforeEach(async () => {
                HwTokenInstance = await HwToken.new({from:owner});
                DeFiProtocolInstance = await DeFiProtocol.new(HwTokenInstance.address, {from:owner});
                await DeFiProtocolInstance.createLiquidityPool(HwTokenInstance.address, HwTokenInstance.address, new BN(925925925925), {from: owner});
                await HwTokenInstance.transfer(DeFiProtocolInstance.address, convertEthToWei(20), {from: owner});
                const stakedValue = convertEthToWei(5);
                await HwTokenInstance.approve(DeFiProtocolInstance.address, stakedValue, {from: owner});
                await DeFiProtocolInstance.stake(HwTokenInstance.address, stakedValue, {from: owner});
            }); 

            it("should return 5 token token staked", async () => {
                const stakedAmount = await DeFiProtocolInstance.getStakedAmount(HwTokenInstance.address, {from: owner});
                expect(new BN(stakedAmount)).to.be.bignumber.equal(new BN(convertEthToWei(5)));
            });

            it("should return 7.5 token staked if user restake 2.5 tokens", async () => {
                const toStake = convertEthToWei(2.5); 
                await HwTokenInstance.approve(DeFiProtocolInstance.address, toStake, {from: owner});
                await DeFiProtocolInstance.stake(HwTokenInstance.address, toStake, {from: owner});
                const newStakedAmount = await DeFiProtocolInstance.getStakedAmount(HwTokenInstance.address, {from: owner});
                expect(new BN(newStakedAmount)).to.be.bignumber.equal(new BN(convertEthToWei(7.5)));
            });

            it("should return 4 tokens staked if user unstake 1 token", async () => {
                const toUnstake = convertEthToWei(1); 
                await DeFiProtocolInstance.unstake(HwTokenInstance.address, toUnstake, {from: owner});
                const newStakedAmount = await DeFiProtocolInstance.getStakedAmount(HwTokenInstance.address, {from: owner});
                expect(new BN(newStakedAmount)).to.be.bignumber.equal(new BN(convertEthToWei(4)));
            });

            it("should return 0 token staked if user unstake all tokens", async () => {
                const toUnstake = convertEthToWei(5); 
                await DeFiProtocolInstance.unstake(HwTokenInstance.address, toUnstake, {from: owner});
                const newStakedAmount = await DeFiProtocolInstance.getStakedAmount(HwTokenInstance.address, {from: owner});
                expect(new BN(newStakedAmount)).to.be.bignumber.equal(new BN(0));
            });
        });

        //::::::::::::::: getRewardAmount Method :::::::::::::::::/

        describe("getRewardAmount() method tests", () => {
            
            beforeEach(async () => {
                HwTokenInstance = await HwToken.new({from:owner});
                DeFiProtocolInstance = await DeFiProtocol.new(HwTokenInstance.address, {from:owner});
                await DeFiProtocolInstance.createLiquidityPool(HwTokenInstance.address, HwTokenInstance.address, new BN(925925925925), {from: owner});
                await HwTokenInstance.transfer(DeFiProtocolInstance.address, convertEthToWei(20), {from: owner});
                const stakedValue = BigInt(convertEthToWei(5));
                await HwTokenInstance.approve(DeFiProtocolInstance.address, stakedValue, {from: owner});
                await DeFiProtocolInstance.stake(HwTokenInstance.address, stakedValue, {from: owner});
            }); 

            it("should return 0 reward if timestamp didn't evolve", async () => {
                const rewardData = await DeFiProtocolInstance.getRewardAmount(HwTokenInstance.address, {from: owner});
                expect(new BN(rewardData.reward)).to.be.bignumber.equal(new BN(0));
            });

            it("should return rewards above 0 if tblock timestamp move", async () => {
                
                // Move the timestamp and mine a new block
                await time.increase(15);
                const test = await DeFiProtocolInstance.getStakedAmount(HwTokenInstance.address, {from: owner});

                // get the new reward
                const newRewardValue = await DeFiProtocolInstance.getRewardAmount(HwTokenInstance.address, {from: owner});
                expect(new BN(newRewardValue)).to.be.bignumber.above(new BN(0));
            });

            it("should return 0 reward when rewards was just claimed", async () => {
                
                // Move the timestamp and mine a new block
                await time.increase(15);
                
                // Claim the reward
                await DeFiProtocolInstance.claimReward(HwTokenInstance.address, {from: owner});

                // get the new reward
                const newRewardValue = await DeFiProtocolInstance.getRewardAmount(HwTokenInstance.address, {from: owner});
                expect(new BN(newRewardValue.reward)).to.be.bignumber.equal(new BN(0));

            });

            it("should return 0 rewards token with 200 wei in pool", async () => {
                // Move the timestamp and mine a new block
                await time.increase(15);
                
                await HwTokenInstance.approve(DeFiProtocolInstance.address, 100, {from: owner});
                await DeFiProtocolInstance.stake(HwTokenInstance.address, 100, {from: owner});
                const rewardData = await DeFiProtocolInstance.getRewardAmount(HwTokenInstance.address, {from: owner});
                expect(new BN(rewardData.reward)).to.be.bignumber.equal(new BN(0));
            });
        });


        //::::::::::::::: claimReward Method :::::::::::::::::/

        describe("claimReward() method tests", () => {

            beforeEach(async () => {
                HwTokenInstance = await HwToken.new({from:owner});
                DeFiProtocolInstance = await DeFiProtocol.new(HwTokenInstance.address, {from:owner});
                await DeFiProtocolInstance.createLiquidityPool(HwTokenInstance.address, HwTokenInstance.address, new BN(925925925925), {from: owner});
                await HwTokenInstance.transfer(DeFiProtocolInstance.address, convertEthToWei(20), {from: owner});
                const stakedValue = BigInt(convertEthToWei(5));
                await HwTokenInstance.approve(DeFiProtocolInstance.address, stakedValue, {from: owner});
                await DeFiProtocolInstance.stake(HwTokenInstance.address, stakedValue, {from: owner});
                // Move the timestamp and mine a new block
                await time.increase(15);
            }); 

            describe("Event cases", () => {
                it("should emit an event when reward is claimed", async () => {    
                    expectEvent(await DeFiProtocolInstance.claimReward(HwTokenInstance.address, {from: owner}), "RewardOffered");
                });
            });
            
            describe("Revert cases", () => {
                it("should revert because there is no reward", async () => {
                    await DeFiProtocolInstance.claimReward(HwTokenInstance.address, {from: owner})
                    await expectRevert(DeFiProtocolInstance.claimReward(HwTokenInstance.address, {from: owner}), "No reward to claim");
                });
            });
        });

        //::::::::::::::: hwtTokenUsdValue property :::::::::::::::::/

        describe("hwtTokenUsdValue property tests", () => {

            beforeEach(async () => {
                HwTokenInstance = await HwToken.new({from:owner});
                DeFiProtocolInstance = await DeFiProtocol.new(HwTokenInstance.address, {from:owner});
            }); 

            it("should return 0.9315 Usd token value", async () => {
                const value = await DeFiProtocolInstance.hwtTokenUsdValue.call();
                expect(new BN(value)).to.be.bignumber.equal(new BN(BigInt(convertEthToWei(0.9315))));
            });
        });
    });
});