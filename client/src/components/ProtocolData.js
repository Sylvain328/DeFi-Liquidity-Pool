import React from 'react';
import DataContainer from './DataContainer.js';

export default class ProtocolData extends React.Component {

    state = {allPoolTvl: 0}

    componentDidMount = async () => {

        // Get general TVL from all pools
        let allPoolTvl = 0;//await this.props.requestManager.getAllPoolsTvl();
        let tokenPrice = await this.props.requestManager.getHwtTokenUsdValue();
        
        this.setState({allPoolTvl: allPoolTvl * tokenPrice});
    }

    render(){
        return(
            <div className="ProtocolData">
                <h3>Protocol</h3>
                <DataContainer containerClass='DataContainer' indicatorTitle='TVL' indicatorValue={this.state.allPoolTvl} indicatorUnit='USD'/>
            </div>
        )
    }
}