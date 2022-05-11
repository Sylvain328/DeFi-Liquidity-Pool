import React from 'react';
import RateConverter from "../utils/rateConverter.js";
import DataContainer from './DataContainer.js';

export default class ProtocolData extends React.Component {

    state = {allPoolTvl: 0}

    constructor(props) {
        super(props);
    }
    
    componentDidMount = async () => {
        let allPoolTvl = await this.props.requestManager.getAllPoolsTvl();
        let tokenPrice = await this.props.requestManager.getHwtTokenUsdValue();
        
        this.setState({allPoolTvl: allPoolTvl});
    }

    render(){
        return(
            <div className="ProtocolData">
                <h3>Protocol</h3>
                <DataContainer containerClass='DataContainer' indicatorTitle='TVL' indicatorValue={this.state.allPoolTvl} indicatorUnit='USD'/>
                <DataContainer containerClass='DataContainer' indicatorTitle='Estimated daily HWT reward' indicatorValue='0' indicatorUnit='HWT'/>
                <DataContainer containerClass='DataContainer' indicatorTitle='Estimated daily USD reward' indicatorValue='0' indicatorUnit='USD'/>
            </div>
        )
    }
}