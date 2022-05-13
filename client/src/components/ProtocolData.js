import React from 'react';
import DataContainer from './DataContainer.js';

export default class ProtocolData extends React.Component {

    render(){
        return(
            <div className="ProtocolData">
                <h3>Protocol</h3>
                <DataContainer containerClass='DataContainer' indicatorTitle='TVL' indicatorValue={this.props.allPoolsTvl.toFixed(2)} indicatorUnit='$'/>
            </div>
        )
    }
}