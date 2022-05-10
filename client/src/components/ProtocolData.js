import React from 'react';
import RateConverter from "../utils/rateConverter.js";
import DataContainer from './DataContainer.js';

export default class ProtocolData extends React.Component {

    constructor(props) {
        super(props);
    }
    
    componentDidMount = async () => {
    }

    render(){
        return(
            <div className="ProtocolData">
                <h3>Protocol</h3>
                <DataContainer containerClass='DataContainer' indicatorTitle='TVL' indicatorValue='0' indicatorUnit='USD'/>
                <DataContainer containerClass='DataContainer' indicatorTitle='Estimated daily HWT reward' indicatorValue='0' indicatorUnit='HWT'/>
                <DataContainer containerClass='DataContainer' indicatorTitle='Estimated daily USD reward' indicatorValue='0' indicatorUnit='HWT'/>
            </div>
        )
    }
}