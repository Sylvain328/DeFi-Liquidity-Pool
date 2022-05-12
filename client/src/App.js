import React, { Component } from "react";
import DefiProtocol from "./contracts/DeFiProtocol.json";
import HWT from "./contracts/HWT.json";
import getWeb3 from "./getWeb3";
import Header from "./components/Header.js";
import GeneralData from "./components/GeneralData.js";
import PoolContainer from "./components/PoolContainer.js";
import PoolManager from "./manager/poolManager.js";
import RequestManager from "./manager/requestManager.js";

import "./App.css";


class App extends Component {
  state = { storageValue: 0, web3: null, account: null, protocolInstance: null, isOwner: null, requestManager: null, poolManagers: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = DefiProtocol.networks[networkId];
      const protocolInstance = new web3.eth.Contract(
        DefiProtocol.abi,
        deployedNetwork && deployedNetwork.address,
      );
      
      // Get the HWT token instance
      const hwtDeployedNetwork = HWT.networks[networkId];
      const tokenInstance = new web3.eth.Contract(
        HWT.abi,
        hwtDeployedNetwork && hwtDeployedNetwork.address,
      );

      const owner = await protocolInstance.methods.owner().call();
      const account = accounts[0];
      const isOwner = owner === account;

      const hwtAddress = tokenInstance._address;
      const hwtPoolManager = await this.buildPoolManager(tokenInstance, protocolInstance, account,'HWT');
      // const linkToken = this.buildPoolManager(protocolInstance, hwtlinkTokenToken.address, 'HWT');
      // const flpToken = this.buildPoolManager(protocolInstance, flpToken.address, 'HWT');

      const poolManagers = {1: hwtPoolManager};

      // Create the manager that will request the different contract requester and return data
      // For the events, we don't want to get the past events, only actual
      const requestManager = new RequestManager(protocolInstance, poolManagers, account, async() => {
        web3.eth.getBlockNumber();
      });

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, 
        account: account, 
        isOwner: isOwner,
        protocolInstance: protocolInstance,
        requestManager: requestManager,
        poolManagers: poolManagers});
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  buildPoolManager = async(tokenInstance, protocolInstance, account, symbol) => {
    return new PoolManager(tokenInstance, 
      symbol, 
      await protocolInstance.methods.getRewardPerSecond(tokenInstance._address).call({from: account}),
      account);
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <Header account={this.state.account} isOwner={this.state.isOwner} requestManager={this.state.requestManager} />
        <GeneralData requestManager={this.state.requestManager}/>
        <PoolContainer requestManager={this.state.requestManager} poolManagers={this.state.poolManagers} />
      </div>
    );
  }
}

export default App;
