const DeFiProtocol = artifacts.require("./DeFiProtocol.sol");
const HwToken = artifacts.require("./HWT.sol");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract('DeFiProtocol', accounts => {

    const owner = accounts[0];

    context("Methods tests", () => {

        beforeEach(async () => {
            HwTokenInstance = await HwToken.new({from:owner});
            DeFiProtocolInstance = await DeFiProtocol.new(HwTokenInstance.address, {from:owner});
        });

        describe("stake() method tests", () => {

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
                    await expectRevert(DeFiProtocolInstance.stake(0, {from: owner}), "You can only insert a value greater than 0");
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
    });
});