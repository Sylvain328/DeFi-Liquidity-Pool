const DeFiProtocol = artifacts.require("./DeFiProtocol.sol");
const HwToken = artifacts.require("./HWT.sol");
const { BN, expectRevert, expectEvent, time } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('DeFiProtocol', accounts => {

    const owner = accounts[0];

    context("Methods tests", () => {

        //::::::::::::::: Stake Method :::::::::::::::::/

        describe("stake() method tests", () => {

            beforeEach(async () => {
                HwTokenInstance = await HwToken.new({from:owner});
                DeFiProtocolInstance = await DeFiProtocol.new(HwTokenInstance.address, {from:owner});
            });    

            it("should stake 50 token in the liquidity pool", async () => {
                const valueToStake = BigInt(5000000000000000000);
                await HwTokenInstance.approve(DeFiProtocolInstance.address, valueToStake, {from: owner});
                await DeFiProtocolInstance.stake(valueToStake, {from: owner});
                const tvl = await DeFiProtocolInstance.totalValueLocked.call();
                expect(new BN(tvl)).to.be.bignumber.equal(new BN(valueToStake));
            });

            it("should stake an amount smaller than approved amount ", async () => {
                const valueToStake = BigInt(5000000000000000000);
                await HwTokenInstance.approve(DeFiProtocolInstance.address, BigInt(10000000000000000000), {from: owner});
                await DeFiProtocolInstance.stake(valueToStake, {from: owner});
                const tvl = await DeFiProtocolInstance.totalValueLocked.call();
                expect(new BN(tvl)).to.be.bignumber.equal(new BN(valueToStake));
            });
        
            describe("Revert cases", () => {

                it("should revert when you try to stake 0 amount", async () => {
                    await HwTokenInstance.approve(DeFiProtocolInstance.address, BigInt(5000000000000000000), {from: owner});
                    await expectRevert(DeFiProtocolInstance.stake(0, {from: owner}), "Only amount above zero are authorized");
                });
                
                it("should revert when you don't approve the contract", async () => {
                    await expectRevert(DeFiProtocolInstance.stake(BigInt(5000000000000000000), {from: owner}), "ERC20: insufficient allowance.");
                });
    
                it("should revert when try to stake amount bigger than approved amount", async () => {
                    await HwTokenInstance.approve(DeFiProtocolInstance.address, BigInt(5000000000000000000), {from: owner});
                    await expectRevert(DeFiProtocolInstance.stake(BigInt(10000000000000000000), {from: owner}), "ERC20: insufficient allowance.");
                });
            });

            describe("Event cases", () => {

                it("should emit an event when amount is properly staked", async () => {
                    const valueToStake = BigInt(5000000000000000000);
                    await HwTokenInstance.approve(DeFiProtocolInstance.address, BigInt(10000000000000000000), {from: owner});
                    
                    expectEvent(await DeFiProtocolInstance.stake(valueToStake, {from: owner}), "AmountStaked", {stakedAmount: new BN(valueToStake)});
                });
            });
        });

        //::::::::::::::: Unstake Method :::::::::::::::::/

        describe("unstake() method tests", () => {

            beforeEach(async () => {
                HwTokenInstance = await HwToken.new({from:owner});
                DeFiProtocolInstance = await DeFiProtocol.new(HwTokenInstance.address, {from:owner});
                const stakedValue = BigInt(5000000000000000000);
                await HwTokenInstance.approve(DeFiProtocolInstance.address, stakedValue, {from: owner});
                await DeFiProtocolInstance.stake(stakedValue, {from: owner});
            });    

            it("should unstake 50 token in the liquidity pool, TVL should be 0", async () => {
                await DeFiProtocolInstance.unstake(BigInt(5000000000000000000), {from: owner});
                const tvl = await DeFiProtocolInstance.totalValueLocked.call();
                expect(new BN(tvl)).to.be.bignumber.equal(new BN(0));
            });

            it("should unstake 25 token in the liquidity pool, TVL should be 25", async () => {
                await DeFiProtocolInstance.unstake(BigInt(2500000000000000000), {from: owner});
                const tvl = await DeFiProtocolInstance.totalValueLocked.call();
                expect(new BN(tvl)).to.be.bignumber.equal(new BN(BigInt(2500000000000000000)));
            });
            
            describe("Revert cases", () => {

                it("should revert when you try to unstake 0 amount", async () => {
                    await expectRevert(DeFiProtocolInstance.unstake(0, {from: owner}), "Only amount above zero are authorized");
                });
                
                it("should revert when you try to unstake an amount bigger than your staked amount", async () => {
                    await expectRevert(DeFiProtocolInstance.unstake(BigInt(10000000000000000000), {from: owner}), "You didn't stored this amount in the pool");
                });
            });

            describe("Event cases", () => {

                it("should emit an event when amount is properly unstaked", async () => {
                    expectEvent(await DeFiProtocolInstance.unstake(BigInt(5000000000000000000), {from: owner}), "AmountUnstaked", {unstakedAmount: new BN(BigInt(5000000000000000000))});
                });
            });
        });

        //::::::::::::::: getStakedAmount Method :::::::::::::::::/

        describe("getStakedAmount() method tests", () => {
            
            beforeEach(async () => {
                HwTokenInstance = await HwToken.new({from:owner});
                DeFiProtocolInstance = await DeFiProtocol.new(HwTokenInstance.address, {from:owner});
                const stakedValue = BigInt(5000000000000000000);
                await HwTokenInstance.approve(DeFiProtocolInstance.address, stakedValue, {from: owner});
                await DeFiProtocolInstance.stake(stakedValue, {from: owner});
            }); 

            it("should return 50 token token staked", async () => {
                const stakedAmount = await DeFiProtocolInstance.getStakedAmount({from: owner});
                expect(new BN(stakedAmount)).to.be.bignumber.equal(new BN(BigInt(5000000000000000000)));
            });

            it("should return 75 token staked if user restake 25 tokens", async () => {
                const toStake = BigInt(2500000000000000000); 
                await HwTokenInstance.approve(DeFiProtocolInstance.address, toStake, {from: owner});
                await DeFiProtocolInstance.stake(toStake, {from: owner});
                const newStakedAmount = await DeFiProtocolInstance.getStakedAmount({from: owner});
                expect(new BN(newStakedAmount)).to.be.bignumber.equal(new BN(BigInt(7500000000000000000)));
            });

            it("should return 4 token staked if user unstake 1 token", async () => {
                const toUnstake = BigInt(1000000000000000000); 
                await DeFiProtocolInstance.unstake(toUnstake, {from: owner});
                const newStakedAmount = await DeFiProtocolInstance.getStakedAmount({from: owner});
                expect(new BN(newStakedAmount)).to.be.bignumber.equal(new BN(BigInt(4000000000000000000)));
            });

            it("should return 0 token staked if user unstake all tokens", async () => {
                const toUnstake = BigInt(5000000000000000000); 
                await DeFiProtocolInstance.unstake(toUnstake, {from: owner});
                const newStakedAmount = await DeFiProtocolInstance.getStakedAmount({from: owner});
                expect(new BN(newStakedAmount)).to.be.bignumber.equal(new BN(0));
            });
        });

        // //::::::::::::::: getRewardAmount Method :::::::::::::::::/

        describe("getRewardAmount() method tests", () => {
            
            beforeEach(async () => {
                HwTokenInstance = await HwToken.new({from:owner});
                DeFiProtocolInstance = await DeFiProtocol.new(HwTokenInstance.address, {from:owner});
                const stakedValue = BigInt(5000000000000000000);
                await HwTokenInstance.approve(DeFiProtocolInstance.address, stakedValue, {from: owner});
                await DeFiProtocolInstance.stake(stakedValue, {from: owner});
            }); 

            it("should return 0 reward", async () => {
                const rewardData = await DeFiProtocolInstance.getRewardAmount({from: owner});
                expect(new BN(rewardData.reward)).to.be.bignumber.equal(new BN(0));
            });

            it("should return rewards above 0", async () => {
                
                // Move the timestamp and mine a new block
                await time.increase(15);

                const rewardData = await DeFiProtocolInstance.getRewardAmount({from: owner});
                expect(new BN(rewardData.reward)).to.be.bignumber.above(new BN(0));
            });

            it("should return 0.9315 Usd token value", async () => {
                const rewardData = await DeFiProtocolInstance.getRewardAmount({from: owner});
                expect(new BN(rewardData.hwtUsdValue)).to.be.bignumber.equal(new BN(BigInt(931500000000000000)));
            });

            it("should return 0 reward when rewards was just claimed and stake is void", async () => {
                
                // Move the timestamp and mine a new block
                await time.increase(15);

                // Remove full value and staked data
                let newRewardValue = await DeFiProtocolInstance.getRewardAmount({from: owner});

                await DeFiProtocolInstance.unstake(BigInt(5000000000000000000), {from: owner});

                // Send liquidity to contrat, to claim rewards, we will provide with account 1
                await HwTokenInstance.approve(DeFiProtocolInstance.address, BigInt(5000000000000000000), {from: accounts[1]});
                await DeFiProtocolInstance.stake(BigInt(5000000000000000000), {from: accounts[1]});
                
                await DeFiProtocolInstance.claimReward({from: owner});

                newRewardValue = await DeFiProtocolInstance.getRewardAmount({from: owner});
                expect(new BN(newRewardValue.reward)).to.be.bignumber.equal(new BN(0));

            });

            it("should return 0 rewards token with 200 wei in pool", async () => {
                // Move the timestamp and mine a new block
                await time.increase(15);
                
                await HwTokenInstance.approve(DeFiProtocolInstance.address, 100, {from: owner});
                await DeFiProtocolInstance.stake(100, {from: owner});
                const rewardData = await DeFiProtocolInstance.getRewardAmount({from: owner});
                expect(new BN(rewardData.reward)).to.be.bignumber.equal(new BN(0));
            });
        });


        //::::::::::::::: claimReward Method :::::::::::::::::/

        describe("claimReward() method tests", () => {

            beforeEach(async () => {
                HwTokenInstance = await HwToken.new({from:owner});
                DeFiProtocolInstance = await DeFiProtocol.new(HwTokenInstance.address, {from:owner});
                const stakedValue = BigInt(500000000000000000000);
                await HwTokenInstance.approve(DeFiProtocolInstance.address, stakedValue, {from: owner});
                await DeFiProtocolInstance.stake(stakedValue, {from: owner});
                // Move the timestamp and mine a new block
                await time.increase(15);
            }); 

            describe("Event cases", () => {
                it("should emit an event when reward is claimed", async () => {    
                    expectEvent(await DeFiProtocolInstance.claimReward({from: owner}), "RewardOffered");
                });
            });
            
            describe("Revert cases", () => {
                it("should revert because there is no reward", async () => {
                    await DeFiProtocolInstance.claimReward({from: owner})
                    await expectRevert(DeFiProtocolInstance.claimReward({from: owner}), "No reward to claim");
                });
            });
        });
    });
});