import React, { Component } from "react";
import DefiProtocol from "./contracts/DeFiProtocol.json";
import HWT from "./contracts/HWT.json";
import getWeb3 from "./getWeb3";
import Header from "./components/Header.js";
import GeneralData from "./components/GeneralData.js";
import PoolContainer from "./components/PoolContainer.js";
import ProtocolRequester from "./web3/protocolRequester";

import "./App.css";
import TokenRequester from "./web3/tokenRequester";

class App extends Component {
  state = { storageValue: 0, web3: null, account: null, instance: null, isOwner: null, contract: null, tokenContract: null };

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
      const isOwner = owner == accounts[0];
      const account = accounts[0];

      const tokenContract = new TokenRequester(tokenInstance, accounts[0]);
      debugger
      const test = await tokenInstance.methods.balanceOf(accounts[0]).call();
      const contract = new ProtocolRequester(instance, accounts[0]);

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, 
        account: account, 
        isOwner: isOwner,
        instance: instance,
        contract:  contract,
        tokenContract : tokenContract});
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
        <Header account={this.state.account} isOwner={this.state.isOwner} contract={this.state.contract} />
        <GeneralData />
        <PoolContainer contract={this.state.contract} tokenContract={this.state.tokenContract} />
      </div>
    );
  }
}

export default App;
