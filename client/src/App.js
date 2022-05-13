import React, { Component } from "react";
import DefiProtocol from "./contracts/DeFiProtocol.json";
import HWT from "./contracts/HWT.json";
import GUM from "./contracts/GUM.json";
import ERC20 from "./contracts/ERC20.json";
import AppContainer from "./components/AppContainer.js";
import getWeb3 from "./getWeb3";

import PoolManager from "./manager/poolManager";
import RequestManager from "./manager/requestManager.js";

import "./App.css";


class App extends Component {
  state = { storageValue: 0, 
    web3: null, 
    account: null, 
    protocolInstance: null, 
    isOwner: null, 
    requestManager: null, 
    poolManager: null,
    hwtPrice: 0
  };

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
      const hwtInstance = new web3.eth.Contract(
        HWT.abi,
        hwtDeployedNetwork && hwtDeployedNetwork.address,
      );

      // Get the GUM token instance
      const gumDeployedNetwork = GUM.networks[networkId];
      const gumInstance = new web3.eth.Contract(
        GUM.abi,
        gumDeployedNetwork && gumDeployedNetwork.address,
      );

      
      // Get the LINK token instance
      var linkInstance = new web3.eth.Contract(ERC20.abi, '0xa36085F69e2889c224210F603D836748e7dC0088');

      // Define account and check if it's the owner
      const owner = await protocolInstance.methods.owner().call();
      const account = accounts[0];
      const isOwner = owner === account;

      // Create the manager that will request the different contract requester and return data
      // For the events, we don't want to get the past events, only actual
      const requestManager = new RequestManager(protocolInstance, account, async() => {
        web3.eth.getBlockNumber();
      });

      // Fake token price are fixed
      const hwtTokenPrice = await requestManager.getHwtTokenUsdValue();
      const flpTokenPrice = await requestManager.getFlpTokenUsdValue();

      // Create pool manager and pool
      const poolManager = new PoolManager(requestManager);
      await poolManager.addNewPool(0, hwtInstance, account, true, hwtTokenPrice, 'HwtLogo');
      await poolManager.addNewPool(1, gumInstance, account, true, flpTokenPrice, 'GumLogo');
      await poolManager.addNewPool(2, linkInstance, account, false, 0, 'LinkLogo');

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, 
        account: account, 
        isOwner: isOwner,
        protocolInstance: protocolInstance,
        requestManager: requestManager,
        poolManager: poolManager,
        hwtPrice: hwtTokenPrice
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <AppContainer account={this.state.account} isOwner={this.state.isOwner} hwtPrice={this.state.hwtPrice}  poolManager={this.state.poolManager}/>
      </div>
    );
  }
}

export default App;
