import React, { Component } from "react";
import DefiProtocol from "./contracts/DeFiProtocol.json";
import HWT from "./contracts/HWT.json";
import getWeb3 from "./getWeb3";
import Header from "./components/Header.js";
import GeneralData from "./components/GeneralData.js";
import PoolContainer from "./components/PoolContainer.js";
import RequestManager from "./manager/requestManager.js";

import "./App.css";


class App extends Component {
  state = { storageValue: 0, web3: null, account: null, instance: null, isOwner: null, requestManager: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = DefiProtocol.networks[networkId];
      const instance = new web3.eth.Contract(
        DefiProtocol.abi,
        deployedNetwork && deployedNetwork.address,
      );
      
      // Get the HWT token instance
      const hwtDeployedNetwork = HWT.networks[networkId];
      const tokenInstance = new web3.eth.Contract(
        HWT.abi,
        hwtDeployedNetwork && hwtDeployedNetwork.address,
      );

      const owner = await instance.methods.owner().call();
      const account = accounts[0];
      const isOwner = owner === account;

      // Create the manager that will request the different contract requester and return data
      // For the events, we don't want to get the past events, only actual
      const requestManager = new RequestManager(instance, tokenInstance, account, async() => {
        web3.eth.getBlockNumber();
      });

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, 
        account: account, 
        isOwner: isOwner,
        instance: instance,
        requestManager: requestManager});
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
        <Header account={this.state.account} isOwner={this.state.isOwner} requestManager={this.state.requestManager} />
        <GeneralData requestManager={this.state.requestManager}/>
        <PoolContainer requestManager={this.state.requestManager} />
      </div>
    );
  }
}

export default App;
