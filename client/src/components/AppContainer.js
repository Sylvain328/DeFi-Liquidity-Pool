import React from 'react';
import Header from "./Header.js";
import GeneralData from "./GeneralData.js";
import PoolContainer from "./PoolContainer.js";

export default class AppContainer extends React.Component {

    state = {allPoolsTvl: 0, allPoolsUserStakedUsd: 0, allPoolsUserReward: 0, allPoolsUserRewardUsd: 0};

    componentDidMount = async () => {
        this.updateAllPoolsData();
    }

    // Update all pool data
    updateAllPoolsData = () => {
        this.props.poolManager.recomputeAllGeneralData();
        this.setState({
            allPoolsTvl: this.props.poolManager.allPoolsTvl, 
            allPoolsUserStakedUsd: this.props.poolManager.allPoolsUserStakedUsd, 
            allPoolsUserReward: this.props.poolManager.allPoolsUserReward, 
            allPoolsUserRewardUsd: this.props.poolManager.allPoolsUserRewardUsd
        });
    };
  
    render(){
        return(
            <div>
                <Header account={this.props.account} isOwner={this.props.isOwner} hwtPrice={this.props.hwtPrice} />
                <GeneralData allPoolsTvl={this.state.allPoolsTvl} allPoolsUserStakedUsd={this.state.allPoolsUserStakedUsd} allPoolsUserReward={this.state.allPoolsUserReward} allPoolsUserRewardUsd={this.state.allPoolsUserRewardUsd} />
                <PoolContainer poolManager={this.props.poolManager} updateAllPoolsData={this.updateAllPoolsData} />
            </div>
        )
    }

}