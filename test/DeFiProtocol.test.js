const DeFiProtocol = artifacts.require("./DeFiProtocol.sol");
const HwToken = artifacts.require("./HWT.sol");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
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

            describe("stake() method stake cases", () => {

                it("should stake 50 in the liquidity pool", async () => {
                    const valueToStake = 50;
                    await HwTokenInstance.approve(DeFiProtocolInstance.address, valueToStake, {from: owner});
                    await DeFiProtocolInstance.stake(valueToStake, {from: owner});
                    const tvl = await DeFiProtocolInstance.totalValueLocked.call();
                    expect(new BN(tvl)).to.be.bignumber.equal(new BN(valueToStake));
                });
    
                it("should stake an amount smaller than approved amount ", async () => {
                    const valueToStake = 50;
                    await HwTokenInstance.approve(DeFiProtocolInstance.address, 100, {from: owner});
                    await DeFiProtocolInstance.stake(valueToStake, {from: owner});
                    const tvl = await DeFiProtocolInstance.totalValueLocked.call();
                    expect(new BN(tvl)).to.be.bignumber.equal(new BN(valueToStake));
                });
            });
            
            describe("stake() method revert cases", () => {

                it("should revert when you try to stake 0 amount", async () => {
                    await HwTokenInstance.approve(DeFiProtocolInstance.address, 50, {from: owner});
                    await expectRevert(DeFiProtocolInstance.stake(0, {from: owner}), "Only amount above zero are authorized");
                });
                
                it("should revert when you don't approve the contract", async () => {
                    await expectRevert(DeFiProtocolInstance.stake(50, {from: owner}), "ERC20: insufficient allowance.");
                });
    
                it("should revert when try to stake amount bigger than approved amount", async () => {
                    await HwTokenInstance.approve(DeFiProtocolInstance.address, 50, {from: owner});
                    await expectRevert(DeFiProtocolInstance.stake(100, {from: owner}), "ERC20: insufficient allowance.");
                });
            });

            describe("stake() method revert cases", () => {

                it("should emit an event when amount is properly staked", async () => {
                    const valueToStake = 50;
                    await HwTokenInstance.approve(DeFiProtocolInstance.address, 100, {from: owner});
                    
                    expectEvent(await DeFiProtocolInstance.stake(valueToStake, {from: owner}), "AmountStaked", {staker: owner, stakedAmount: new BN(valueToStake)});
                });
            });
        });

        //::::::::::::::: Unstake Method :::::::::::::::::/

        describe("unstake() method tests", () => {

            beforeEach(async () => {
                HwTokenInstance = await HwToken.new({from:owner});
                DeFiProtocolInstance = await DeFiProtocol.new(HwTokenInstance.address, {from:owner});
                const stakedValue = 50;
                await HwTokenInstance.approve(DeFiProtocolInstance.address, stakedValue, {from: owner});
                await DeFiProtocolInstance.stake(stakedValue, {from: owner});
            });    

            describe("unstake() method unstake cases", () => {

                it("should unstake 50 in the liquidity pool, tvl should be 0", async () => {
                    await DeFiProtocolInstance.unstake(50, {from: owner});
                    const tvl = await DeFiProtocolInstance.totalValueLocked.call();
                    expect(new BN(tvl)).to.be.bignumber.equal(new BN(0));
                });

                it("should unstake 25 in the liquidity pool, TVL should be 25", async () => {
                    await DeFiProtocolInstance.unstake(25, {from: owner});
                    const tvl = await DeFiProtocolInstance.totalValueLocked.call();
                    expect(new BN(tvl)).to.be.bignumber.equal(new BN(25));
                });
            });
            
            describe("unstake() method revert cases", () => {

                it("should revert when you try to unstake 0 amount", async () => {
                    await expectRevert(DeFiProtocolInstance.unstake(0, {from: owner}), "Only amount above zero are authorized");
                });
                
                it("should revert when you try to unstake an amount bigger than your staked amount", async () => {
                    await expectRevert(DeFiProtocolInstance.unstake(100, {from: owner}), "You didn't stored this amount in the pool");
                });
            });

            describe("unstake() method revert cases", () => {

                it("should emit an event when amount is properly unstaked", async () => {
                    expectEvent(await DeFiProtocolInstance.unstake(10, {from: owner}), "AmountUnstaked", {staker: owner, unstakedAmount: new BN(10)});
                });
            });
        });

        describe("getStakedAmount() method tests", () => {

            beforeEach(async () => {
                HwTokenInstance = await HwToken.new({from:owner});
                DeFiProtocolInstance = await DeFiProtocol.new(HwTokenInstance.address, {from:owner});
                const stakedValue = 50;
                await HwTokenInstance.approve(DeFiProtocolInstance.address, stakedValue, {from: owner});
                await DeFiProtocolInstance.stake(stakedValue, {from: owner});
            }); 

            it("should return 50 token staked", async () => {
                const stakedAmount = await DeFiProtocolInstance.getStakedAmount({from: owner});
                expect(new BN(stakedAmount)).to.be.bignumber.equal(new BN(50));
            });

            it("should return 75 token staked if user restake 25 tokens", async () => {
                const toStake = 25; 
                await HwTokenInstance.approve(DeFiProtocolInstance.address, toStake, {from: owner});
                await DeFiProtocolInstance.stake(toStake, {from: owner});
                const newStakedAmount = await DeFiProtocolInstance.getStakedAmount({from: owner});
                expect(new BN(newStakedAmount)).to.be.bignumber.equal(new BN(75));
            });

            it("should return 40 token staked if user unstake 10 tokens", async () => {
                const toUnstake = 10; 
                await DeFiProtocolInstance.unstake(toUnstake, {from: owner});
                const newStakedAmount = await DeFiProtocolInstance.getStakedAmount({from: owner});
                expect(new BN(newStakedAmount)).to.be.bignumber.equal(new BN(40));
            });

            it("should return 0 token staked if user unstake all tokens", async () => {
                const toUnstake = 50; 
                await DeFiProtocolInstance.unstake(toUnstake, {from: owner});
                const newStakedAmount = await DeFiProtocolInstance.getStakedAmount({from: owner});
                expect(new BN(newStakedAmount)).to.be.bignumber.equal(new BN(0));
            });
        });

    });
});