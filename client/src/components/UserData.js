import React from 'react';
import DataContainer from './DataContainer.js';
import RateConverter from "../utils/rateConverter.js";

export default class GeneralData extends React.Component {

    render(){
        return(
            <div className="UserData">
                <h3>User</h3>
                <DataContainer containerClass='DataContainer' indicatorTitle='Total Staked Amount' indicatorValue={this.props.allPoolsUserStakedUsd.toFixed(2)} indicatorUnit='$'/>
                <DataContainer containerClass='DataContainer' indicatorTitle='Total Reward HWT' indicatorValue={this.props.allPoolsUserReward} indicatorUnit='HWT'/>
                <DataContainer containerClass='DataContainer' indicatorTitle='Total Reward Amount' indicatorValue={this.props.allPoolsUserRewardUsd.toFixed(2)} indicatorUnit='$'/>
            </div>
        )
    }
}